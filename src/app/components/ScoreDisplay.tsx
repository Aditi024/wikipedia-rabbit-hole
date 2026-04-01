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
      className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-100/5 border border-amber-200/15 backdrop-blur-sm"
    >
      <span
        className="text-sm text-amber-100/70"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Gem Score
      </span>
      <span
        className="text-xl font-bold text-amber-50"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {score}
        <span className="text-sm text-amber-100/70 font-normal">
          /{maxScore}
        </span>
      </span>
    </motion.div>
  );
}
