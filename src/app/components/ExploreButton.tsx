"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { generateSketchyPath } from "@/lib/sketchy-path";

interface ExploreButtonProps {
  onClick?: () => void;
  href?: string;
  loading?: boolean;
  variant?: "landing" | "small";
  label?: string;
}

export default function ExploreButton({
  onClick,
  href,
  loading = false,
  variant = "landing",
  label,
}: ExploreButtonProps) {
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

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
        onClick={handleClick}
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
      onClick={handleClick}
      disabled={loading}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.96 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative group px-12 py-5 rounded-full font-bold text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed overflow-visible font-display"
      style={{
        background: hovered
          ? "rgba(239, 57, 34, 0.95)"
          : "rgba(255, 255, 255, 0.85)",
        boxShadow: hovered
          ? "0 8px 30px rgba(239, 57, 34, 0.3), 0 2px 8px rgba(239, 57, 34, 0.15)"
          : "0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)",
        transition: "background 0.35s ease, box-shadow 0.35s ease",
      }}
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
            stroke={hovered ? "rgba(239, 57, 34, 0.5)" : "rgba(239, 57, 34, 0.55)"}
            strokeWidth={hovered ? 1.8 : 1.5}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <path
            d={sketch2.d}
            stroke={hovered ? "rgba(239, 57, 34, 0.2)" : "rgba(239, 57, 34, 0.15)"}
            strokeWidth={0.7}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      )}
      <span
        className={`relative z-10 transition-colors duration-300 ${hovered ? "text-white" : "text-brand"}`}
      >
        {loading ? (
          <span className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            Tunneling...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {label || "Start exploring"}
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              &rarr;
            </motion.span>
          </span>
        )}
      </span>
    </motion.button>
  );
}
