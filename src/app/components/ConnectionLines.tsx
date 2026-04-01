"use client";

import { motion } from "framer-motion";

export interface ConnectionPath {
  id: string;
  path: string;
  fromIndex: number;
  toIndex: number;
}

interface ConnectionLinesProps {
  paths: ConnectionPath[];
  onRemoveConnection: (fromIndex: number, toIndex: number) => void;
}

export default function ConnectionLines({
  paths,
  onRemoveConnection,
}: ConnectionLinesProps) {
  if (paths.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        <linearGradient id="nodeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(252,211,77,0.4)" />
          <stop offset="50%" stopColor="rgba(251,191,146,0.25)" />
          <stop offset="100%" stopColor="rgba(252,211,77,0.4)" />
        </linearGradient>
      </defs>

      {paths.map((conn, i) => (
        <g key={conn.id}>
          {/* Visible line */}
          <motion.path
            d={conn.path}
            stroke="url(#nodeLineGrad)"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { delay: i * 0.3 + 0.5, duration: 0.6, ease: "easeInOut" },
              opacity: { delay: i * 0.3 + 0.4, duration: 0.3 },
            }}
          />
          {/* Invisible thick hit area for clicking */}
          <path
            d={conn.path}
            stroke="transparent"
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
            className="pointer-events-auto cursor-pointer"
            onClick={() => onRemoveConnection(conn.fromIndex, conn.toIndex)}
          >
            <title>Click to remove connection</title>
          </path>
          {/* Hover highlight */}
          <path
            d={conn.path}
            stroke="rgba(239,68,68,0)"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            className="pointer-events-none transition-all duration-200 [g:hover>&]:stroke-[rgba(239,68,68,0.5)]"
          />
        </g>
      ))}
    </svg>
  );
}
