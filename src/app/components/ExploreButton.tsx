"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { generateSketchyPath } from "@/lib/sketchy-path";

interface ExploreButtonProps {
  onClick: () => void;
  loading: boolean;
  variant?: "landing" | "small";
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

  const sketch2 = useMemo(
    () => (dims ? generateSketchyPath(dims.w, dims.h, 97) : null),
    [dims]
  );

  if (variant === "small") {
    return (
      <motion.button
        onClick={onClick}
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative px-6 py-2.5 rounded-full font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-surface-glass text-brand border border-brand-light hover:bg-surface-translucent hover:border-brand-medium font-display"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block w-4 h-4 border-2 border-brand-light border-t-brand rounded-full"
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
      className="relative group px-10 py-4 rounded-full font-bold text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed overflow-visible font-display"
    >
      {sketch && sketch2 && (
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
          overflow="visible"
        >
          <path
            d={sketch.d}
            stroke={hovered ? "rgba(239, 57, 34, 0.95)" : "rgba(239, 57, 34, 0.8)"}
            strokeWidth={hovered ? 2 : 1.6}
            fill={hovered ? "rgba(239, 57, 34, 0.92)" : "none"}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <path
            d={sketch2.d}
            stroke={hovered ? "rgba(239, 57, 34, 0.35)" : "rgba(239, 57, 34, 0.2)"}
            strokeWidth={0.8}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      )}
      <span
        className={`relative z-10 transition-colors duration-300 ${hovered ? "text-background" : "text-brand"}`}
      >
        {loading ? (
          <span className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block w-5 h-5 border-2 border-brand-light border-t-white rounded-full"
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
