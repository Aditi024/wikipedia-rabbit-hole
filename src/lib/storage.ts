import { RabbitHoleArticle } from "./types";
import { GemRarity } from "./scoring";
import { RARITY_ORDER, DEFAULT_STATS } from "./config";

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
  if (typeof window === "undefined") return { ...DEFAULT_STATS };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function updateStats(gemScore: number, rarestArticle?: { title: string; rarity: string }) {
  const stats = getStats();
  stats.totalExplored += 1;
  stats.totalGems += gemScore;
  if (rarestArticle) {
    const currentIdx = stats.rarestFind
      ? RARITY_ORDER.indexOf(stats.rarestFind.rarity as GemRarity)
      : -1;
    const newIdx = RARITY_ORDER.indexOf(rarestArticle.rarity as GemRarity);
    if (newIdx > currentIdx) {
      stats.rarestFind = rarestArticle;
    }
  }
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
