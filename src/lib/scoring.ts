export type GemRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface GemInfo {
  rarity: GemRarity;
  points: number;
  color: string;
  glow: string;
}

const RARITY_MAP: Record<GemRarity, Omit<GemInfo, "rarity">> = {
  Common: { points: 1, color: "#6B7280", glow: "rgba(107,114,128,0.3)" },
  Uncommon: { points: 2, color: "#059669", glow: "rgba(5,150,105,0.3)" },
  Rare: { points: 3, color: "#2563EB", glow: "rgba(37,99,235,0.3)" },
  Epic: { points: 4, color: "#7C3AED", glow: "rgba(124,58,237,0.4)" },
  Legendary: { points: 5, color: "#B45309", glow: "rgba(180,83,9,0.5)" },
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
