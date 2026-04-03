export interface NodePosition {
  x: number;
  y: number;
  rotation: number;
}

/**
 * Generates node positions that flow left-to-right in order.
 * Each card gets its own horizontal lane with randomized vertical
 * position and slight rotation, so the layout reads 1→2→3→4→5
 * while still feeling organic.
 */
export function generateNodePositions(count: number): NodePosition[] {
  const padLeft = 10;
  const padRight = 12;
  const usableWidth = 100 - padLeft - padRight;
  const laneWidth = usableWidth / count;

  const positions: NodePosition[] = [];

  for (let i = 0; i < count; i++) {
    const laneStart = padLeft + i * laneWidth;
    const x = laneStart + laneWidth * (0.3 + Math.random() * 0.4);

    const zigzag = i % 2 === 0 ? 0 : 20;
    const y = 15 + zigzag + Math.random() * 25;

    const rotation = (Math.random() - 0.5) * 6;

    positions.push({ x, y, rotation });
  }

  return positions;
}
