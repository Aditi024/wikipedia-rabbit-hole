"use client";

import { motion } from "framer-motion";

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
}

export default function ScoreDisplay({ score, maxScore }: ScoreDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.5, type: "spring" }}
      className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface-glass border border-brand-subtle backdrop-blur-sm"
    >
      <span className="text-sm text-text-secondary font-medium font-body">
        Gem Score
      </span>
      <span className="text-xl font-bold text-brand font-display">
        {score}
        <span className="text-sm text-text-muted font-normal">
          /{maxScore}
        </span>
      </span>
    </motion.div>
  );
}
