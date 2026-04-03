import { GemRarity } from "./scoring";

export interface RabbitHoleArticle {
  title: string;
  description?: string;
  extract: string;
  thumbnail?: string;
  url: string;
  monthlyViews: number;
}

export interface ScoreInfo {
  title: string;
  rarity: GemRarity;
  points: number;
  color: string;
  monthlyViews: number;
}

export interface Connection {
  from: number;
  to: number;
}
