import { GemRarity } from "./scoring";

export const COLORS = {
  brand: "#EF3922",
  brandHover: "#d42f1a",
  foreground: "#1a1520",
  background: "#FFAAFA",
  grid: "#F184EB",
} as const;

export const RARITY_ORDER: GemRarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
];

export const DEFAULT_STATS = {
  totalExplored: 0,
  totalGems: 0,
  rarestFind: null,
} as const;

export const ANIMATION = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  slideRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
} as const;
