import { Connection, RabbitHoleArticle } from "./types";

export function buildDefaultConnections(count: number): Connection[] {
  const conns: Connection[] = [];
  for (let i = 0; i < count - 1; i++) {
    conns.push({ from: i, to: i + 1 });
  }
  return conns;
}

export function tracePathFromConnections(
  connections: Connection[],
  articles: RabbitHoleArticle[]
): RabbitHoleArticle[] {
  if (connections.length === 0) return articles;

  const adjMap = new Map<number, number[]>();
  const allIndices = new Set<number>();
  for (const c of connections) {
    allIndices.add(c.from);
    allIndices.add(c.to);
    if (!adjMap.has(c.from)) adjMap.set(c.from, []);
    adjMap.get(c.from)!.push(c.to);
  }

  const inDegree = new Map<number, number>();
  for (const idx of allIndices) inDegree.set(idx, 0);
  for (const c of connections) {
    inDegree.set(c.to, (inDegree.get(c.to) || 0) + 1);
  }

  let start = -1;
  for (const [idx, deg] of inDegree) {
    if (deg === 0) {
      start = idx;
      break;
    }
  }
  if (start === -1) start = connections[0]?.from ?? 0;

  const path: number[] = [];
  const visited = new Set<number>();
  let current: number | undefined = start;

  while (current !== undefined && !visited.has(current)) {
    visited.add(current);
    path.push(current);
    const neighbors = adjMap.get(current);
    current = neighbors?.[0];
  }

  return path
    .filter((i) => i >= 0 && i < articles.length)
    .map((i) => articles[i]);
}

export function buildScoreMap<T extends { title: string }>(
  scores: T[]
): Record<string, T> {
  const map: Record<string, T> = {};
  scores.forEach((s) => (map[s.title] = s));
  return map;
}
