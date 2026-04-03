"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { RabbitHoleArticle, ScoreInfo, Connection } from "@/lib/types";
import { buildScoreMap } from "@/lib/graph";
import { NodePosition } from "@/lib/layout";
import { RabbitHoleNarrative } from "@/lib/narrative";
import { useWiring } from "@/hooks/useWiring";
import { useConnectionPaths } from "@/hooks/useConnectionPaths";
import ArticleNode from "./ArticleNode";
import ConnectionLines from "./ConnectionLines";
import DetailPanel from "./DetailPanel";
import NarrativeBanner from "./NarrativeBanner";
import RabbitHoleSummary from "./RabbitHoleSummary";
import CanvasHints from "./CanvasHints";

interface NodeCanvasProps {
  articles: RabbitHoleArticle[];
  positions: NodePosition[];
  scores: ScoreInfo[];
  narrative: RabbitHoleNarrative | null;
  connections: Connection[];
  onConnectionsChange: (connections: Connection[]) => void;
  onRemoveArticle: (index: number) => void;
}

export default function NodeCanvas({
  articles,
  positions,
  scores,
  narrative,
  connections,
  onConnectionsChange,
  onRemoveArticle,
}: NodeCanvasProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    nodeRefs.current = nodeRefs.current.slice(0, articles.length);
  }, [articles.length]);

  const scoreMap = useMemo(() => buildScoreMap(scores), [scores]);

  const connectionPaths = useConnectionPaths({
    connections,
    canvasRef,
    nodeRefs,
  });

  const { wiringFrom, pendingLine, handlePortClick, handleRemoveConnection } =
    useWiring({
      connections,
      onConnectionsChange,
      canvasRef,
      nodeRefs,
    });

  const selectedArticle =
    selectedIndex !== null ? articles[selectedIndex] : null;
  const selectedScore = selectedArticle
    ? scoreMap[selectedArticle.title]
    : undefined;

  return (
    <>
      <div
        ref={canvasRef}
        data-canvas
        className={`relative w-full flex-1 min-h-[600px] ${wiringFrom !== null ? "cursor-crosshair" : ""}`}
      >
        <ConnectionLines
          paths={connectionPaths}
          onRemoveConnection={handleRemoveConnection}
        />

        {pendingLine && wiringFrom !== null && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 2 }}
          >
            <path
              d={pendingLine}
              stroke="rgba(26,21,32,0.4)"
              strokeWidth={2}
              strokeDasharray="8 5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}

        <AnimatePresence>
          {articles.map((article, i) => {
            const score = scoreMap[article.title];
            return (
              <ArticleNode
                key={`${article.title}-${i}`}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                article={article}
                index={i}
                position={positions[i]}
                isSelected={selectedIndex === i}
                isWiring={wiringFrom !== null && wiringFrom !== i}
                rarity={score?.rarity}
                rarityColor={score?.color}
                onClick={() =>
                  setSelectedIndex(selectedIndex === i ? null : i)
                }
                onRemove={() => {
                  setSelectedIndex(null);
                  onRemoveArticle(i);
                }}
                onPortClick={handlePortClick}
                onDragUpdate={() => {}}
              />
            );
          })}
        </AnimatePresence>

        {wiringFrom !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 bg-surface-translucent border border-brand-light rounded-full text-sm font-medium text-foreground backdrop-blur-sm font-body">
            Click on another card to connect &middot;{" "}
            <button
              data-cancel-wiring
              className="text-brand hover:text-brand-hover ml-1 font-medium font-display"
            >
              Cancel
            </button>
          </div>
        )}

        {narrative && (
          <NarrativeBanner
            narrative={narrative}
            onClick={() => setShowSummary(true)}
          />
        )}

        <CanvasHints />
      </div>

      <DetailPanel
        article={selectedArticle}
        rarity={selectedScore?.rarity}
        rarityColor={selectedScore?.color}
        onClose={() => setSelectedIndex(null)}
      />

      <RabbitHoleSummary
        open={showSummary}
        narrative={narrative}
        articles={articles}
        scores={scores}
        onClose={() => setShowSummary(false)}
      />
    </>
  );
}
