"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RabbitHoleArticle, ScoreInfo, Connection } from "@/lib/types";
import { generateNodePositions, NodePosition } from "@/lib/layout";
import { saveRabbitHole, updateStats } from "@/lib/storage";
import {
  generateNarrative,
  RabbitHoleNarrative,
  stripParenthetical,
} from "@/lib/narrative";
import { buildDefaultConnections, tracePathFromConnections } from "@/lib/graph";
import { encodeRabbitHole } from "@/lib/share";
import NodeCanvas from "@/app/components/NodeCanvas";
import ExploreButton from "@/app/components/ExploreButton";
import LoadingTunnel from "@/app/components/LoadingTunnel";
import TopicSearch from "@/app/components/TopicSearch";

type AppState = "landing" | "loading" | "reveal" | "exploring";

const REVEAL_DURATION_MS = 3200;

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState<AppState>("landing");
  const [articles, setArticles] = useState<RabbitHoleArticle[]>([]);
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [scores, setScores] = useState<ScoreInfo[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [narrative, setNarrative] = useState<RabbitHoleNarrative | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [saved, setSaved] = useState(false);
  const [showPostSave, setShowPostSave] = useState(false);
  const [shared, setShared] = useState<"idle" | "copied">("idle");
  const [linkContexts, setLinkContexts] = useState<(string | null)[]>([]);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (state === "reveal") {
      revealTimerRef.current = setTimeout(
        () => setState("exploring"),
        REVEAL_DURATION_MS
      );
      return () => {
        if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      };
    }
  }, [state]);

  const cancelExplore = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setState("landing");
  }, []);

  const skipReveal = useCallback(() => {
    if (state !== "reveal") return;
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    setState("exploring");
  }, [state]);

  const explore = useCallback(async (startTitle?: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("loading");
    setSaved(false);
    setShowPostSave(false);
    setShared("idle");

    try {
      const url = startTitle
        ? `/api/generate?startTitle=${encodeURIComponent(startTitle)}`
        : "/api/generate";
      const genRes = await fetch(url, {
        signal: controller.signal,
      });
      const genData = await genRes.json();

      if (controller.signal.aborted) return;

      if (!genData.articles || genData.articles.length === 0) {
        throw new Error("No articles returned");
      }

      const chain: RabbitHoleArticle[] = genData.articles;
      const ctxs: (string | null)[] = genData.linkContexts || [];
      const nodePositions = generateNodePositions(chain.length);
      const defaultConns = buildDefaultConnections(chain.length);
      const holeNarrative = generateNarrative(chain, ctxs);

      if (controller.signal.aborted) return;

      setArticles(chain);
      setLinkContexts(ctxs);
      setPositions(nodePositions);
      setConnections(defaultConns);
      setNarrative(holeNarrative);
      setScores([]);
      setTotalScore(0);
      setState("reveal");

      try {
        const scoreRes = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titles: chain.map((a) => a.title) }),
          signal: controller.signal,
        });
        const scoreData = await scoreRes.json();

        if (controller.signal.aborted) return;

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
      if (error instanceof DOMException && error.name === "AbortError") return;
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
    const success = saveRabbitHole(hole);
    setSaved(success);
    if (success) setShowPostSave(true);
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="relative z-10 w-full flex flex-col items-center gap-4"
            >
              <TopicSearch onSelect={(title) => explore(title)} />
              <span className="text-sm text-text-faint font-body">or</span>
              <ExploreButton onClick={() => explore()} loading={false} />
            </motion.div>
          </motion.div>
        )}

        {state === "loading" && (
          <LoadingTunnel
            key="loading"
            onCancel={cancelExplore}
          />
        )}

        {state === "reveal" && articles.length >= 2 && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            onClick={skipReveal}
            className="flex flex-col items-center justify-center text-center px-8 cursor-pointer select-none"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-sm uppercase tracking-[0.25em] text-text-muted font-display mb-8"
            >
              How did you get from&hellip;
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", damping: 20, stiffness: 90 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-brand leading-tight max-w-3xl font-display">
                {stripParenthetical(articles[0].title)}
              </h1>
              {articles[0].description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="text-base text-text-secondary font-body mt-2 max-w-md"
                >
                  {articles[0].description}
                </motion.p>
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="text-3xl md:text-5xl text-text-muted font-display my-4"
            >
              &darr;
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, type: "spring", damping: 20, stiffness: 90 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-brand leading-tight max-w-3xl font-display">
                {stripParenthetical(articles[articles.length - 1].title)}
              </h1>
              {articles[articles.length - 1].description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 1.6, duration: 0.4 }}
                  className="text-base text-text-secondary font-body mt-2 max-w-md"
                >
                  {articles[articles.length - 1].description}
                </motion.p>
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 2.2, duration: 0.5 }}
              className="text-sm text-text-faint font-body mt-10"
            >
              Click to skip
            </motion.p>
          </motion.div>
        )}

        {state === "exploring" && (
          <motion.div
            key="exploring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex-1 flex flex-col"
          >
            <div className="flex items-center justify-end px-8 py-3 z-20">
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
                  onClick={() => explore()}
                  loading={false}
                  variant="small"
                />
              </div>
            </div>

            <AnimatePresence>
              {showPostSave && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-16 right-8 z-30 flex items-center gap-3 px-5 py-3 bg-surface-frosted backdrop-blur-md border border-emerald-500/20 rounded-2xl shadow-lg shadow-black/5"
                >
                  <span className="text-sm text-text-secondary font-body">
                    Saved!
                  </span>
                  <button
                    onClick={() => router.push("/collection")}
                    className="text-sm font-medium text-brand hover:text-brand-hover transition-colors font-body"
                  >
                    View collection
                  </button>
                  <span className="text-foreground/10">|</span>
                  <button
                    onClick={() => {
                      setShowPostSave(false);
                      void explore();
                    }}
                    className="text-sm font-medium text-brand hover:text-brand-hover transition-colors font-body"
                  >
                    Explore more
                  </button>
                  <button
                    onClick={() => setShowPostSave(false)}
                    className="text-text-faint hover:text-text-muted transition-colors ml-1 text-xs"
                  >
                    &times;
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <NodeCanvas
              articles={articles}
              positions={positions}
              scores={scores}
              narrative={narrative}
              connections={connections}
              linkContexts={linkContexts}
              onConnectionsChange={handleConnectionsChange}
              onRemoveArticle={handleRemoveArticle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
