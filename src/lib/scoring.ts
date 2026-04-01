export type GemRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface GemInfo {
  rarity: GemRarity;
  points: number;
  color: string;
  glow: string;
}

const RARITY_MAP: Record<GemRarity, Omit<GemInfo, "rarity">> = {
  Common: { points: 1, color: "#9CA3AF", glow: "rgba(156,163,175,0.3)" },
  Uncommon: { points: 2, color: "#34D399", glow: "rgba(52,211,153,0.3)" },
  Rare: { points: 3, color: "#60A5FA", glow: "rgba(96,165,250,0.3)" },
  Epic: { points: 4, color: "#A78BFA", glow: "rgba(167,139,250,0.4)" },
  Legendary: { points: 5, color: "#FBBF24", glow: "rgba(251,191,36,0.5)" },
};

export function getGemRarity(monthlyViews: number): GemRarity {
  if (monthlyViews < 0) return "Common";
  if (monthlyViews < 100) return "Legendary";
  if (monthlyViews < 1000) return "Epic";
  if (monthlyViews < 10000) return "Rare";
  if (monthlyViews < 100000) return "Uncommon";
  return "Common";
}

export function getGemInfo(monthlyViews: number): GemInfo {
  const rarity = getGemRarity(monthlyViews);
  return { rarity, ...RARITY_MAP[rarity] };
}

export function getTotalScore(
  articles: { monthlyViews: number }[]
): number {
  return articles.reduce((sum, a) => {
    const info = getGemInfo(a.monthlyViews);
    return sum + info.points;
  }, 0);
}
