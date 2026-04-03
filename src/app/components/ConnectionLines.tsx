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
      {paths.map((conn, i) => (
        <g key={conn.id}>
          <motion.path
            d={conn.path}
            stroke="var(--color-foreground)"
            strokeWidth={2}
            strokeOpacity={0.3}
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { delay: i * 0.3 + 0.5, duration: 0.6, ease: "easeInOut" },
              opacity: { delay: i * 0.3 + 0.4, duration: 0.3 },
            }}
          />
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
          <path
            d={conn.path}
            stroke="rgba(239,68,68,0)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            className="pointer-events-none transition-all duration-200 [g:hover>&]:stroke-[rgba(239,68,68,0.6)]"
          />
        </g>
      ))}
    </svg>
  );
}
