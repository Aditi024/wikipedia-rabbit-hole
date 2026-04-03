"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeRabbitHole } from "@/lib/share";
import { RabbitHoleArticle, ScoreInfo, Connection } from "@/lib/types";
import { generateNodePositions, NodePosition } from "@/lib/layout";
import { generateNarrative, RabbitHoleNarrative } from "@/lib/narrative";
import { buildDefaultConnections } from "@/lib/graph";
import NodeCanvas from "@/app/components/NodeCanvas";
import ScoreDisplay from "@/app/components/ScoreDisplay";
import ExploreButton from "@/app/components/ExploreButton";
import Link from "next/link";

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
        setArticles(chain);
        setPositions(generateNodePositions(chain.length));
        setConnections(buildDefaultConnections(chain.length));
        setNarrative(generateNarrative(chain));
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
            <Link
              href="/"
              className="inline-flex px-6 py-3 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-hover transition-colors font-display"
            >
              Dig your own rabbit hole
            </Link>
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
              <div className="flex items-center gap-4">
                <ScoreDisplay
                  score={totalScore}
                  maxScore={articles.length * 5}
                />
                <span className="text-sm text-text-muted font-medium font-body">
                  Shared rabbit hole
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ExploreButton
                  onClick={() => (window.location.href = "/")}
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
