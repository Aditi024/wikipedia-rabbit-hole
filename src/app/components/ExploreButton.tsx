"use client";

import { motion } from "framer-motion";

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
  if (variant === "small") {
    return (
      <motion.button
        onClick={onClick}
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative px-6 py-2.5 rounded-full font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-amber-100/10 text-amber-100 border border-amber-300/25 hover:bg-amber-100/15 hover:border-amber-300/40"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block w-4 h-4 border-2 border-amber-400/30 border-t-amber-200 rounded-full"
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
      onClick={onClick}
      disabled={loading}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      className="relative group px-12 py-5 rounded-full font-bold text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <svg
        className="absolute inset-[-3px] w-[calc(100%+6px)] h-[calc(100%+6px)] pointer-events-none"
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        fill="none"
      >
        <rect
          x="1"
          y="1"
          width="198"
          height="58"
          rx="30"
          stroke="rgba(252, 211, 77, 0.5)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          className="group-hover:stroke-[rgba(252,211,77,0.8)] transition-all"
          style={{ animation: "dash-march 1.5s linear infinite" }}
        />
      </svg>
      <span className="relative z-10 text-amber-100">
        {loading ? (
          <span className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block w-5 h-5 border-2 border-amber-400/30 border-t-amber-200 rounded-full"
            />
            Tunneling...
          </span>
        ) : (
          <span className="flex items-center gap-3">
            Start exploring
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
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
