function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface SketchyPathResult {
  d: string;
  vw: number;
  vh: number;
  offset: number;
}

/**
 * Generates a hand-drawn pencil circle/oval around a rectangle of size w x h.
 * Uses dense point sampling with micro-jitter for pencil-on-paper roughness,
 * layered sine wobble for natural hand movement, and an overshoot tail.
 */
export function generateSketchyPath(
  w: number,
  h: number,
  seed = 42
): SketchyPathResult {
  const rand = seededRandom(seed);

  const padX = 8;
  const padY = 6;
  const bleed = 16;
  const rx = w / 2 + padX;
  const ry = h / 2 + padY;
  const cx = w / 2 + bleed;
  const cy = h / 2 + bleed;

  const svgW = w + bleed * 2;
  const svgH = h + bleed * 2;

  const numPoints = 72;
  const overshoot = 8;
  const totalPoints = numPoints + overshoot;

  const wobbleFreq1 = 2.2 + rand() * 0.8;
  const wobbleFreq2 = 4.5 + rand() * 1.5;
  const wobbleAmp1 = 2.5 + rand() * 2;
  const wobbleAmp2 = 1 + rand() * 1.5;
  const phaseShift1 = rand() * Math.PI * 2;
  const phaseShift2 = rand() * Math.PI * 2;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= totalPoints; i++) {
    const t = (i / numPoints) * Math.PI * 2;

    const fade = i > numPoints ? 1 - (i - numPoints) / overshoot : 1;

    const handWobble =
      (Math.sin(t * wobbleFreq1 + phaseShift1) * wobbleAmp1 +
        Math.sin(t * wobbleFreq2 + phaseShift2) * wobbleAmp2) *
      fade;

    const microJitter = (rand() - 0.5) * 3.0 * fade;

    const tangentBump = (rand() - 0.5) * 2.0 * fade;

    const cosT = Math.cos(t);
    const sinT = Math.sin(t);

    const x =
      cx +
      (rx + handWobble + microJitter) * cosT +
      tangentBump * -sinT;
    const y =
      cy +
      (ry + handWobble + microJitter) * sinT +
      tangentBump * cosT;

    points.push({ x, y });
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 1; i < points.length; i++) {
    const p0 = points[Math.max(0, i - 2)];
    const p1 = points[i - 1];
    const p2 = points[i];
    const p3 = points[Math.min(points.length - 1, i + 1)];

    const tension = 5;
    const cp1x = p1.x + (p2.x - p0.x) / tension;
    const cp1y = p1.y + (p2.y - p0.y) / tension;
    const cp2x = p2.x - (p3.x - p1.x) / tension;
    const cp2y = p2.y - (p3.y - p1.y) / tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return { d, vw: svgW, vh: svgH, offset: bleed };
}
