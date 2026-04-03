"use client";

import { useState, useEffect, useCallback, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeRabbitHole } from "@/lib/share";
import { RabbitHoleArticle, ScoreInfo, Connection } from "@/lib/types";
import { generateNodePositions, NodePosition } from "@/lib/layout";
import { generateNarrative, RabbitHoleNarrative } from "@/lib/narrative";
import { buildDefaultConnections } from "@/lib/graph";
import { saveRabbitHole } from "@/lib/storage";
import NodeCanvas from "@/app/components/NodeCanvas";
import ExploreButton from "@/app/components/ExploreButton";

type PageState = "loading" | "ready" | "error";

export default function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [state, setState] = useState<PageState>("loading");
  const [articles, setArticles] = useState<RabbitHoleArticle[]>([]);
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [scores, setScores] = useState<ScoreInfo[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [narrative, setNarrative] = useState<RabbitHoleNarrative | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    if (articles.length === 0) return;
    saveRabbitHole({
      id: `shared-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      articles,
      gemScore: totalScore,
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  }, [articles, totalScore]);

  useEffect(() => {
    const titles = decodeRabbitHole(id);
    if (titles.length === 0) {
      setState("error");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titles }),
        });
        const data = await res.json();

        if (!data.articles || data.articles.length === 0) {
          setState("error");
          return;
        }

        const chain: RabbitHoleArticle[] = data.articles;
        const linkContexts: (string | null)[] = data.linkContexts || [];
        setArticles(chain);
        setPositions(generateNodePositions(chain.length));
        setConnections(buildDefaultConnections(chain.length));
        setNarrative(generateNarrative(chain, linkContexts));
        setState("ready");

        try {
          const scoreRes = await fetch("/api/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ titles: chain.map((a) => a.title) }),
          });
          const scoreData = await scoreRes.json();
          setScores(scoreData.scores || []);
          setTotalScore(scoreData.totalScore || 0);
        } catch {
          // Scoring is non-critical
        }
      } catch {
        setState("error");
      }
    })();
  }, [id]);

  const handleConnectionsChange = (newConnections: Connection[]) => {
    setConnections(newConnections);
  };

  const handleRemoveArticle = (index: number) => {
    setArticles((prev) => prev.filter((_, i) => i !== index));
    setPositions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
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
            <p className="text-text-primary text-lg font-medium font-body">
              Reconstructing rabbit hole...
            </p>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 text-center px-6"
          >
            <p className="text-4xl font-display">🕳️</p>
            <h1 className="text-2xl font-bold text-foreground font-display">
              This rabbit hole has collapsed
            </h1>
            <p className="text-text-secondary font-body max-w-sm">
              The link might be broken or the articles may no longer exist.
            </p>
            <ExploreButton href="/" label="Dig your own rabbit hole" />
          </motion.div>
        )}

        {state === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between px-8 py-3 z-20">
              <span className="text-sm text-text-muted font-medium font-body">
                Shared rabbit hole
              </span>
              <div className="flex items-center gap-3">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
                  href="/"
                  label="Explore your own"
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
