"use client";

import { motion } from "framer-motion";
import { GemRarity } from "@/lib/scoring";

const RARITY_CONFIG: Record<
  GemRarity,
  { label: string; bg: string; text: string; border: string; emoji: string }
> = {
  Common: {
    label: "Common",
    bg: "bg-gray-500/15",
    text: "text-gray-600",
    border: "border-gray-500/40",
    emoji: "~",
  },
  Uncommon: {
    label: "Uncommon",
    bg: "bg-emerald-500/15",
    text: "text-emerald-700",
    border: "border-emerald-500/40",
    emoji: "+",
  },
  Rare: {
    label: "Rare",
    bg: "bg-blue-500/15",
    text: "text-blue-700",
    border: "border-blue-500/40",
    emoji: "*",
  },
  Epic: {
    label: "Epic",
    bg: "bg-purple-500/15",
    text: "text-purple-700",
    border: "border-purple-500/40",
    emoji: "**",
  },
  Legendary: {
    label: "Legendary",
    bg: "bg-amber-500/15",
    text: "text-amber-700",
    border: "border-amber-500/40",
    emoji: "***",
  },
};

export default function GemBadge({ rarity }: { rarity: GemRarity }) {
  const config = RARITY_CONFIG[rarity];

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.3 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span>{config.emoji}</span>
      {config.label}
    </motion.span>
  );
}
