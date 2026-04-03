"use client";

import { useMemo } from "react";

const COLS = 28;
const ROWS = 18;
const CELL = 55;
const WARP_STRENGTH = 18;
const STROKE_COLOR = "rgba(241, 132, 235, 0.55)";
const STROKE_WIDTH = 0.9;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateWarpField(cols: number, rows: number, seed: number) {
  const rand = seededRandom(seed);
  const points: { x: number; y: number }[][] = [];

  for (let r = 0; r <= rows; r++) {
    const row: { x: number; y: number }[] = [];
    for (let c = 0; c <= cols; c++) {
      const baseX = c * CELL;
      const baseY = r * CELL;

      const edgeFadeX =
        Math.min(c, cols - c) / (cols * 0.3);
      const edgeFadeY =
        Math.min(r, rows - r) / (rows * 0.3);
      const fade = Math.min(1, edgeFadeX) * Math.min(1, edgeFadeY);

      const warpX = (rand() - 0.5) * 2 * WARP_STRENGTH * fade;
      const warpY = (rand() - 0.5) * 2 * WARP_STRENGTH * fade;

      row.push({ x: baseX + warpX, y: baseY + warpY });
    }
    points.push(row);
  }

  return points;
}

function buildPaths(points: { x: number; y: number }[][]) {
  const paths: string[] = [];

  for (let r = 0; r < points.length; r++) {
    const row = points[r];
    let d = `M ${row[0].x.toFixed(1)} ${row[0].y.toFixed(1)}`;
    for (let c = 1; c < row.length; c++) {
      const prev = row[c - 1];
      const curr = row[c];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
      const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
      const cpy1 = prev.y + (curr.y - prev.y) * 0.2;
      const cpy2 = prev.y + (curr.y - prev.y) * 0.8;
      d += ` C ${cpx1.toFixed(1)} ${cpy1.toFixed(1)}, ${cpx2.toFixed(1)} ${cpy2.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }
    paths.push(d);
  }

  for (let c = 0; c < points[0].length; c++) {
    let d = `M ${points[0][c].x.toFixed(1)} ${points[0][c].y.toFixed(1)}`;
    for (let r = 1; r < points.length; r++) {
      const prev = points[r - 1][c];
      const curr = points[r][c];
      const cpy1 = prev.y + (curr.y - prev.y) * 0.4;
      const cpy2 = prev.y + (curr.y - prev.y) * 0.6;
      const cpx1 = prev.x + (curr.x - prev.x) * 0.2;
      const cpx2 = prev.x + (curr.x - prev.x) * 0.8;
      d += ` C ${cpx1.toFixed(1)} ${cpy1.toFixed(1)}, ${cpx2.toFixed(1)} ${cpy2.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }
    paths.push(d);
  }

  return paths;
}

export default function WarpedGrid() {
  const paths = useMemo(() => {
    const points = generateWarpField(COLS, ROWS, 7);
    return buildPaths(points);
  }, []);

  const viewW = COLS * CELL + WARP_STRENGTH * 2;
  const viewH = ROWS * CELL + WARP_STRENGTH * 2;

  return (
    <svg
      className="mesh-overlay"
      viewBox={`${-WARP_STRENGTH} ${-WARP_STRENGTH} ${viewW} ${viewH}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={STROKE_COLOR}
          strokeWidth={STROKE_WIDTH}
        />
      ))}
    </svg>
  );
}
