"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface ExploreButtonProps {
  onClick: () => void;
  loading: boolean;
  variant?: "landing" | "small";
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateSketchyPath(w: number, h: number) {
  const gap = 8;
  const bump = 12;
  const extra = bump + 6;
  const rand = seededRandom(42);
  const jitter = (amount: number) => (rand() - 0.5) * amount;

  const ow = w + gap * 2;
  const oh = h + gap * 2;
  const r = oh / 2;

  const svgW = ow + extra * 2;
  const svgH = oh + extra * 2;
  const ox = extra;
  const oy = extra;

  const topLen = Math.max(ow - 2 * r, 0);
  const topN = Math.max(Math.round(topLen / 55), 3);
  const topStep = topLen / topN;

  const capCirc = Math.PI * r;
  const capN = Math.max(Math.round(capCirc / 40), 2);

  const p: string[] = [];

  const startX = ox + r + jitter(3);
  const startY = oy + jitter(2);
  p.push(`M ${startX.toFixed(1)} ${startY.toFixed(1)}`);

  for (let i = 0; i < topN; i++) {
    const sx = ox + r + i * topStep;
    const ex = sx + topStep + jitter(4);
    const bumpSize = bump + jitter(6);
    const cpx = (sx + ex) / 2 + jitter(5);
    const cpy = oy - bumpSize + jitter(3);
    const ey = oy + jitter(2);
    p.push(`Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }

  const rcx = ox + ow - r;
  const rcy = oy + r;
  for (let i = 0; i < capN; i++) {
    const a1 = -Math.PI / 2 + (i / capN) * Math.PI;
    const a2 = -Math.PI / 2 + ((i + 1) / capN) * Math.PI;
    const am = (a1 + a2) / 2;
    const bumpR = bump + jitter(5);
    const cpx = rcx + (r + bumpR) * Math.cos(am) + jitter(3);
    const cpy = rcy + (r + bumpR) * Math.sin(am) + jitter(3);
    const ex = rcx + r * Math.cos(a2) + jitter(2);
    const ey = rcy + r * Math.sin(a2) + jitter(2);
    p.push(`Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }

  for (let i = 0; i < topN; i++) {
    const sx = ox + ow - r - i * topStep;
    const ex = sx - topStep + jitter(4);
    const bumpSize = bump + jitter(6);
    const cpx = (sx + ex) / 2 + jitter(5);
    const cpy = oy + oh + bumpSize + jitter(3);
    const ey = oy + oh + jitter(2);
    p.push(`Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }

  const lcx = ox + r;
  const lcy = oy + r;
  for (let i = 0; i < capN; i++) {
    const a1 = Math.PI / 2 + (i / capN) * Math.PI;
    const a2 = Math.PI / 2 + ((i + 1) / capN) * Math.PI;
    const am = (a1 + a2) / 2;
    const bumpR = bump + jitter(5);
    const cpx = lcx + (r + bumpR) * Math.cos(am) + jitter(3);
    const cpy = lcy + (r + bumpR) * Math.sin(am) + jitter(3);
    const ex = lcx + r * Math.cos(a2) + jitter(2);
    const ey = lcy + r * Math.sin(a2) + jitter(2);
    p.push(`Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }

  p.push("Z");
  return { d: p.join(" "), vw: svgW, vh: svgH, offset: gap + extra };
}

export default function ExploreButton({
  onClick,
  loading,
  variant = "landing",
}: ExploreButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = btnRef.current;
    if (!el || variant === "small") return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setDims({ w: width, h: height });
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [variant]);

  const sketch = useMemo(
    () => (dims ? generateSketchyPath(dims.w, dims.h) : null),
    [dims]
  );

  if (variant === "small") {
    return (
      <motion.button
        onClick={onClick}
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative px-6 py-2.5 rounded-full font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white/40 text-[#EF3922] border border-[#EF3922]/25 hover:bg-white/60 hover:border-[#EF3922]/50"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block w-4 h-4 border-2 border-[#EF3922]/30 border-t-[#EF3922] rounded-full"
            />
            Digging...
          </span>
        ) : (
          "Explore Again"
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      disabled={loading}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative group px-12 py-5 rounded-full font-bold text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {sketch && (
        <svg
          className="absolute pointer-events-none"
          style={{
            top: -sketch.offset,
            left: -sketch.offset,
            right: -sketch.offset,
            bottom: -sketch.offset,
          }}
          viewBox={`0 0 ${sketch.vw} ${sketch.vh}`}
          fill="none"
        >
          <path
            d={sketch.d}
            stroke={hovered ? "rgba(239, 57, 34, 0.9)" : "rgba(239, 57, 34, 0.7)"}
            strokeWidth={2}
            fill={hovered ? "rgba(239, 57, 34, 0.95)" : "none"}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <path
            d={sketch.d}
            stroke={hovered ? "rgba(239, 57, 34, 0.3)" : "rgba(239, 57, 34, 0.15)"}
            strokeWidth={1}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="4 3"
            className="transition-all duration-300"
            style={{ transform: "translate(1px, 1px)" }}
          />
        </svg>
      )}
      <span
        className={`relative z-10 transition-colors duration-300 ${hovered ? "text-[#FFAAFA]" : "text-[#EF3922]"}`}
      >
        {loading ? (
          <span className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block w-5 h-5 border-2 border-[#EF3922]/30 border-t-white rounded-full"
            />
            Tunneling...
          </span>
        ) : (
          <span className="flex items-center gap-3">
            Start exploring
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="text-xl"
            >
              &#x2192;
            </motion.span>
          </span>
        )}
      </span>
    </motion.button>
  );
}
