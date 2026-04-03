import { RabbitHoleArticle } from "./types";
import { GemRarity } from "./scoring";
import { RARITY_ORDER, DEFAULT_STATS } from "./config";

const SCHEMA_VERSION = 1;

export interface SavedRabbitHole {
  id: string;
  articles: RabbitHoleArticle[];
  gemScore: number;
  createdAt: string;
}

interface StorageEnvelope<T> {
  version: number;
  data: T;
}

const STORAGE_KEY = "rabbit-hole-collection";
const STATS_KEY = "rabbit-hole-stats";
const MAX_SAVED_HOLES = 200;

export interface ExplorerStats {
  totalExplored: number;
  totalGems: number;
  rarestFind: { title: string; rarity: string } | null;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "version" in parsed && "data" in parsed) {
      return (parsed as StorageEnvelope<T>).data;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, data: unknown): boolean {
  try {
    const envelope: StorageEnvelope<unknown> = { version: SCHEMA_VERSION, data };
    localStorage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

function getCollection(): SavedRabbitHole[] {
  if (typeof window === "undefined") return [];
  return safeParse<SavedRabbitHole[]>(localStorage.getItem(STORAGE_KEY), []);
}

export function getSavedHoles(): SavedRabbitHole[] {
  return getCollection();
}

export function saveRabbitHole(hole: SavedRabbitHole): boolean {
  const collection = getCollection();
  if (collection.some((h) => h.id === hole.id)) return true;
  collection.unshift(hole);

  if (collection.length > MAX_SAVED_HOLES) {
    collection.length = MAX_SAVED_HOLES;
  }

  return safeWrite(STORAGE_KEY, collection);
}

export function deleteRabbitHole(id: string) {
  const collection = getCollection().filter((h) => h.id !== id);
  safeWrite(STORAGE_KEY, collection);
}

export function getStats(): ExplorerStats {
  if (typeof window === "undefined") return { ...DEFAULT_STATS };
  return safeParse<ExplorerStats>(localStorage.getItem(STATS_KEY), { ...DEFAULT_STATS });
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
  safeWrite(STATS_KEY, stats);
}
