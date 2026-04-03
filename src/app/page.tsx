"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RabbitHoleArticle, ScoreInfo, Connection } from "@/lib/types";
import { generateNodePositions, NodePosition } from "@/lib/layout";
import { saveRabbitHole, updateStats } from "@/lib/storage";
import { generateNarrative, RabbitHoleNarrative } from "@/lib/narrative";
import { buildDefaultConnections, tracePathFromConnections } from "@/lib/graph";
import { encodeRabbitHole } from "@/lib/share";
import NodeCanvas from "@/app/components/NodeCanvas";
import ExploreButton from "@/app/components/ExploreButton";
import ScoreDisplay from "@/app/components/ScoreDisplay";

type AppState = "landing" | "loading" | "exploring";

const LOADING_MESSAGES = [
  "Tunneling through Wikipedia...",
  "Following a curious link...",
  "Discovering something obscure...",
  "Connecting the dots...",
  "Going deeper...",
];

function LoadingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-text-primary text-lg font-medium font-body"
      >
        {LOADING_MESSAGES[index]}
      </motion.p>
    </AnimatePresence>
  );
}

export default function Home() {
  const [state, setState] = useState<AppState>("landing");
  const [articles, setArticles] = useState<RabbitHoleArticle[]>([]);
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [scores, setScores] = useState<ScoreInfo[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [narrative, setNarrative] = useState<RabbitHoleNarrative | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState<"idle" | "copied">("idle");

  const explore = useCallback(async () => {
    setState("loading");
    setSaved(false);
    setShared("idle");

    try {
      const genRes = await fetch("/api/generate");
      const genData = await genRes.json();

      if (!genData.articles || genData.articles.length === 0) {
        throw new Error("No articles returned");
      }

      const chain: RabbitHoleArticle[] = genData.articles;
      const linkContexts: (string | null)[] = genData.linkContexts || [];
      const nodePositions = generateNodePositions(chain.length);
      const defaultConns = buildDefaultConnections(chain.length);
      const holeNarrative = generateNarrative(chain, linkContexts);

      setArticles(chain);
      setPositions(nodePositions);
      setConnections(defaultConns);
      setNarrative(holeNarrative);
      setScores([]);
      setTotalScore(0);
      setState("exploring");

      try {
        const scoreRes = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titles: chain.map((a) => a.title) }),
        });
        const scoreData = await scoreRes.json();
        setScores(scoreData.scores || []);
        setTotalScore(scoreData.totalScore || 0);

        const rarestScore = (scoreData.scores || []).reduce(
          (best: ScoreInfo | null, s: ScoreInfo) =>
            !best || s.points > best.points ? s : best,
          null
        );
        if (rarestScore) {
          updateStats(scoreData.totalScore, {
            title: rarestScore.title,
            rarity: rarestScore.rarity,
          });
        }
      } catch {
        // Scoring is non-critical
      }
    } catch (error) {
      console.error("Failed to explore:", error);
      setState("landing");
    }
  }, []);

  const handleConnectionsChange = useCallback(
    (newConnections: Connection[]) => {
      setConnections(newConnections);

      const pathArticles = tracePathFromConnections(newConnections, articles);
      if (pathArticles.length >= 2) {
        setNarrative(generateNarrative(pathArticles));
      } else {
        setNarrative(null);
      }
    },
    [articles]
  );

  const handleRemoveArticle = useCallback(
    (index: number) => {
      const newArticles = articles.filter((_, i) => i !== index);
      const newPositions = positions.filter((_, i) => i !== index);
      const newScores = scores.filter(
        (s) => s.title !== articles[index]?.title
      );

      const incoming = connections.filter((c) => c.to === index);
      const outgoing = connections.filter((c) => c.from === index);
      const bridges: Connection[] = [];
      for (const inc of incoming) {
        for (const out of outgoing) {
          const alreadyExists = connections.some(
            (c) => c.from === inc.from && c.to === out.to
          );
          if (!alreadyExists && inc.from !== out.to) {
            bridges.push({ from: inc.from, to: out.to });
          }
        }
      }

      const reindex = (idx: number) => (idx > index ? idx - 1 : idx);
      const newConnections = [
        ...connections.filter((c) => c.from !== index && c.to !== index),
        ...bridges,
      ].map((c) => ({ from: reindex(c.from), to: reindex(c.to) }));

      setArticles(newArticles);
      setPositions(newPositions);
      setScores(newScores);
      setConnections(newConnections);

      if (newArticles.length >= 2) {
        const pathArticles = tracePathFromConnections(
          newConnections,
          newArticles
        );
        setNarrative(generateNarrative(pathArticles));
        setTotalScore(newScores.reduce((sum, s) => sum + s.points, 0));
      } else if (newArticles.length === 0) {
        setState("landing");
      } else {
        setNarrative(null);
        setTotalScore(newScores.reduce((sum, s) => sum + s.points, 0));
      }
    },
    [articles, positions, scores, connections]
  );

  const handleSave = useCallback(() => {
    if (articles.length === 0) return;
    const hole = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      articles,
      gemScore: totalScore,
      createdAt: new Date().toISOString(),
    };
    saveRabbitHole(hole);
    setSaved(true);
  }, [articles, totalScore]);

  const handleShare = useCallback(async () => {
    if (articles.length === 0) return;
    const encoded = encodeRabbitHole(articles.map((a) => a.title));
    const url = `${window.location.origin}/share/${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setShared("copied");
      setTimeout(() => setShared("idle"), 2500);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }, [articles]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        {state === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col items-center gap-10 text-center px-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ delay: 0.1, duration: 1.2 }}
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(239,57,34,0.15) 0%, rgba(241,132,235,0.1) 40%, transparent 70%)",
                filter: "blur(80px)",
              }}
            />
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 18, stiffness: 100 }}
              className="relative z-10 leading-[0.9]"
            >
              <span className="block text-8xl md:text-[11rem] font-extrabold text-brand tracking-tight font-display">
                rabbit
              </span>
              <span className="block text-8xl md:text-[11rem] font-extrabold tracking-tight text-brand font-display">
                hole.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-text-primary max-w-sm relative z-10 font-medium font-body"
            >
              Wander through Wikipedia.
              <br />
              Find what you never knew you were looking for.
            </motion.p>
            <div className="relative z-10">
              <ExploreButton onClick={explore} loading={false} />
            </div>
          </motion.div>
        )}

        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="w-16 h-16 rounded-full border-2 border-brand-light border-t-brand border-r-grid"
            />
            <LoadingText />
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-brand-medium"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.4, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {state === "exploring" && (
          <motion.div
            key="exploring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between px-8 py-3 z-20">
              <ScoreDisplay
                score={totalScore}
                maxScore={articles.length * 5}
              />
              <div className="flex items-center gap-3">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  onClick={handleShare}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all font-body ${
                    shared === "copied"
                      ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"
                      : "bg-surface-glass text-foreground border border-brand-light hover:bg-surface-translucent hover:border-brand-medium"
                  }`}
                >
                  {shared === "copied" ? "Link copied!" : "Share"}
                </motion.button>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  onClick={handleSave}
                  disabled={saved}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all font-body ${
                    saved
                      ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"
                      : "bg-surface-glass text-foreground border border-brand-light hover:bg-surface-translucent hover:border-brand-medium"
                  }`}
                >
                  {saved ? "Saved!" : "Save"}
                </motion.button>
                <ExploreButton
                  onClick={explore}
                  loading={false}
                  variant="small"
                />
              </div>
            </div>

            <NodeCanvas
              articles={articles}
              positions={positions}
              scores={scores}
              narrative={narrative}
              connections={connections}
              onConnectionsChange={handleConnectionsChange}
              onRemoveArticle={handleRemoveArticle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
