"use client";

import { motion } from "framer-motion";
import { GemRarity } from "@/lib/scoring";

const RARITY_CONFIG: Record<
  GemRarity,
  { label: string; bg: string; text: string; border: string; emoji: string }
> = {
  Common: {
    label: "Common",
    bg: "bg-gray-500/20",
    text: "text-gray-300",
    border: "border-gray-500/30",
    emoji: "~",
  },
  Uncommon: {
    label: "Uncommon",
    bg: "bg-emerald-500/20",
    text: "text-emerald-300",
    border: "border-emerald-500/30",
    emoji: "+",
  },
  Rare: {
    label: "Rare",
    bg: "bg-blue-500/20",
    text: "text-blue-300",
    border: "border-blue-500/30",
    emoji: "*",
  },
  Epic: {
    label: "Epic",
    bg: "bg-purple-500/20",
    text: "text-purple-300",
    border: "border-purple-500/30",
    emoji: "**",
  },
  Legendary: {
    label: "Legendary",
    bg: "bg-amber-500/20",
    text: "text-amber-300",
    border: "border-amber-500/30",
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span>{config.emoji}</span>
      {config.label}
    </motion.span>
  );
}
