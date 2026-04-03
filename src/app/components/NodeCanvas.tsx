"use client";

import {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { AnimatePresence } from "framer-motion";
import { RabbitHoleArticle } from "@/app/api/generate/route";
import { NodePosition } from "@/lib/layout";
import { GemRarity } from "@/lib/scoring";
import { RabbitHoleNarrative } from "@/lib/narrative";
import ArticleNode from "./ArticleNode";
import ConnectionLines, { ConnectionPath } from "./ConnectionLines";
import DetailPanel from "./DetailPanel";
import NarrativeBanner from "./NarrativeBanner";
import RabbitHoleSummary from "./RabbitHoleSummary";

interface ScoreInfo {
  title: string;
  rarity: GemRarity;
  color: string;
}

export interface Connection {
  from: number;
  to: number;
}

interface NodeCanvasProps {
  articles: RabbitHoleArticle[];
  positions: NodePosition[];
  scores: ScoreInfo[];
  narrative: RabbitHoleNarrative | null;
  connections: Connection[];
  onConnectionsChange: (connections: Connection[]) => void;
  onRemoveArticle: (index: number) => void;
}

function getPortCenter(el: Element, canvasRect: DOMRect) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - canvasRect.left,
    y: rect.top + rect.height / 2 - canvasRect.top,
  };
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
  const [wiringFrom, setWiringFrom] = useState<number | null>(null);
  const wiringFromRef = useRef<number | null>(null);
  const [connectionPaths, setConnectionPaths] = useState<ConnectionPath[]>([]);
  const [pendingLine, setPendingLine] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const connectionsRef = useRef(connections);
  connectionsRef.current = connections;

  useEffect(() => {
    nodeRefs.current = nodeRefs.current.slice(0, articles.length);
  }, [articles.length]);

  const scoreMap = useMemo(() => {
    const map: Record<string, ScoreInfo> = {};
    scores.forEach((s) => (map[s.title] = s));
    return map;
  }, [scores]);

  // Continuously sync wires to port positions via rAF.
  // This keeps wires magnetically attached during float animations, drags, etc.
  const rafRef = useRef<number>(0);
  const prevPathsRef = useRef<string>("");

  useEffect(() => {
    const tick = () => {
      const canvas = canvasRef.current;
      if (canvas && connections.length > 0) {
        const canvasRect = canvas.getBoundingClientRect();
        const paths: ConnectionPath[] = [];

        for (const conn of connections) {
          const fromEl = nodeRefs.current[conn.from];
          const toEl = nodeRefs.current[conn.to];
          if (!fromEl || !toEl) continue;

          const outputPort = fromEl.querySelector('[data-port="output"]');
          const inputPort = toEl.querySelector('[data-port="input"]');
          if (!outputPort || !inputPort) continue;

          const out = getPortCenter(outputPort, canvasRect);
          const inp = getPortCenter(inputPort, canvasRect);

          const dx = inp.x - out.x;
          const absDx = Math.abs(dx);
          const dy = inp.y - out.y;

          let handleLen: number;
          if (dx > 0) {
            handleLen = Math.min(Math.max(absDx * 0.45, 60), 200);
          } else {
            handleLen = Math.min(Math.max(absDx * 0.5 + Math.abs(dy) * 0.3, 100), 300);
          }

          const path = `M ${out.x} ${out.y} C ${out.x + handleLen} ${out.y}, ${inp.x - handleLen} ${inp.y}, ${inp.x} ${inp.y}`;
          paths.push({
            id: `${conn.from}-${conn.to}`,
            path,
            fromIndex: conn.from,
            toIndex: conn.to,
          });
        }

        const key = paths.map((p) => p.path).join("|");
        if (key !== prevPathsRef.current) {
          prevPathsRef.current = key;
          setConnectionPaths(paths);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [connections]);

  // Track mouse for pending connection line
  useEffect(() => {
    if (wiringFrom === null) {
      setPendingLine(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const mx = e.clientX - canvasRect.left;
      const my = e.clientY - canvasRect.top;

      const wf = wiringFromRef.current;
      if (wf === null) return;
      const fromEl = nodeRefs.current[wf];
      if (!fromEl) return;

      const outputPort = fromEl.querySelector('[data-port="output"]');
      const inputPort = fromEl.querySelector('[data-port="input"]');
      const port = outputPort || inputPort;
      if (!port) return;
      const portPos = getPortCenter(port, canvasRect);

      const dx = mx - portPos.x;
      const handleLen = Math.min(Math.max(Math.abs(dx) * 0.5, 60), 200);

      const line = `M ${portPos.x} ${portPos.y} C ${portPos.x + handleLen} ${portPos.y}, ${mx - handleLen} ${my}, ${mx} ${my}`;
      setPendingLine(line);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [wiringFrom]);

  const onConnectionsChangeRef = useRef(onConnectionsChange);
  onConnectionsChangeRef.current = onConnectionsChange;

  // Start wiring when a port is clicked (only when not already wiring)
  const handlePortClick = useCallback(
    (cardIndex: number) => {
      if (wiringFromRef.current !== null) return;
      wiringFromRef.current = cardIndex;
      setWiringFrom(cardIndex);
    },
    []
  );

  // Native capture-phase listener handles wiring COMPLETION.
  // Capture phase fires top-down before Framer Motion can intercept.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClickCapture = (e: MouseEvent) => {
      const wf = wiringFromRef.current;
      if (wf === null) return;

      const target = e.target as HTMLElement;

      if (target.closest("[data-cancel-wiring]")) {
        wiringFromRef.current = null;
        setWiringFrom(null);
        e.stopPropagation();
        e.preventDefault();
        return;
      }

      const cardEl = target.closest("[data-card-index]");

      if (cardEl) {
        const cardIndex = parseInt(cardEl.getAttribute("data-card-index")!, 10);
        if (cardIndex === wf) {
          // Clicked the same card — cancel wiring
          wiringFromRef.current = null;
          setWiringFrom(null);
          e.stopPropagation();
          e.preventDefault();
          return;
        }

        // Complete the connection
        const conns = connectionsRef.current;
        const exists = conns.some(
          (c) =>
            (c.from === wf && c.to === cardIndex) ||
            (c.from === cardIndex && c.to === wf)
        );
        if (!exists) {
          onConnectionsChangeRef.current([
            ...conns,
            { from: wf, to: cardIndex },
          ]);
        }
        wiringFromRef.current = null;
        setWiringFrom(null);
      } else {
        // Clicked empty canvas — cancel wiring
        wiringFromRef.current = null;
        setWiringFrom(null);
      }

      e.stopPropagation();
      e.preventDefault();
    };

    canvas.addEventListener("click", handleClickCapture, true);
    return () => canvas.removeEventListener("click", handleClickCapture, true);
  }, []);

  const handleRemoveConnection = useCallback(
    (fromIndex: number, toIndex: number) => {
      onConnectionsChange(
        connectionsRef.current.filter(
          (c) => !(c.from === fromIndex && c.to === toIndex)
        )
      );
    },
    [onConnectionsChange]
  );

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

        {/* Pending connection line while wiring */}
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
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 bg-white/70 border border-[#EF3922]/20 rounded-full text-sm font-medium text-[#1a1520] backdrop-blur-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Click on another card to connect &middot;{" "}
            <button
              data-cancel-wiring
              className="text-[#EF3922] hover:text-[#d42f1a] ml-1 font-medium"
              style={{ fontFamily: "var(--font-display)" }}
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
