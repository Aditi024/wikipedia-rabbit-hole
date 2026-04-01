export interface NodePosition {
  x: number;
  y: number;
  rotation: number;
}

const LAYOUTS: Record<number, NodePosition[]> = {
  3: [
    { x: 18, y: 30, rotation: -3 },
    { x: 52, y: 15, rotation: 2.5 },
    { x: 75, y: 50, rotation: -1.5 },
  ],
  4: [
    { x: 15, y: 25, rotation: -3 },
    { x: 55, y: 12, rotation: 2.5 },
    { x: 35, y: 55, rotation: -1.5 },
    { x: 72, y: 48, rotation: 3 },
  ],
  5: [
    { x: 12, y: 20, rotation: -2.5 },
    { x: 48, y: 8, rotation: 3 },
    { x: 78, y: 25, rotation: -1.8 },
    { x: 28, y: 55, rotation: 2 },
    { x: 65, y: 58, rotation: -3.2 },
  ],
};

export function generateNodePositions(count: number): NodePosition[] {
  const base = LAYOUTS[count] || LAYOUTS[5];
  const positions: NodePosition[] = [];

  for (let i = 0; i < count; i++) {
    const b = base[i] || base[base.length - 1];
    positions.push({
      x: b.x + (Math.random() - 0.5) * 6,
      y: b.y + (Math.random() - 0.5) * 6,
      rotation: b.rotation + (Math.random() - 0.5) * 2,
    });
  }

  return positions;
}
