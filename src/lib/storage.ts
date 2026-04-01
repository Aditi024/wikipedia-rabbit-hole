import { RabbitHoleArticle } from "@/app/api/generate/route";

export interface SavedRabbitHole {
  id: string;
  articles: RabbitHoleArticle[];
  gemScore: number;
  createdAt: string;
}

const STORAGE_KEY = "rabbit-hole-collection";
const STATS_KEY = "rabbit-hole-stats";

export interface ExplorerStats {
  totalExplored: number;
  totalGems: number;
  rarestFind: { title: string; rarity: string } | null;
}

function getCollection(): SavedRabbitHole[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCollection(collection: SavedRabbitHole[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

export function getSavedHoles(): SavedRabbitHole[] {
  return getCollection();
}

export function saveRabbitHole(hole: SavedRabbitHole) {
  const collection = getCollection();
  if (collection.some((h) => h.id === hole.id)) return;
  collection.unshift(hole);
  saveCollection(collection);
}

export function deleteRabbitHole(id: string) {
  const collection = getCollection().filter((h) => h.id !== id);
  saveCollection(collection);
}

export function getStats(): ExplorerStats {
  if (typeof window === "undefined")
    return { totalExplored: 0, totalGems: 0, rarestFind: null };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw
      ? JSON.parse(raw)
      : { totalExplored: 0, totalGems: 0, rarestFind: null };
  } catch {
    return { totalExplored: 0, totalGems: 0, rarestFind: null };
  }
}

export function updateStats(gemScore: number, rarestArticle?: { title: string; rarity: string }) {
  const stats = getStats();
  stats.totalExplored += 1;
  stats.totalGems += gemScore;
  if (rarestArticle) {
    const rarityOrder = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
    const currentIdx = stats.rarestFind
      ? rarityOrder.indexOf(stats.rarestFind.rarity)
      : -1;
    const newIdx = rarityOrder.indexOf(rarestArticle.rarity);
    if (newIdx > currentIdx) {
      stats.rarestFind = rarestArticle;
    }
  }
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
