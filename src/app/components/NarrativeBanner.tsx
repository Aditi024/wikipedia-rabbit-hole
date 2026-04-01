"use client";

import { motion } from "framer-motion";
import { RabbitHoleNarrative } from "@/lib/narrative";

interface NarrativeBannerProps {
  narrative: RabbitHoleNarrative;
  onClick: () => void;
}

export default function NarrativeBanner({
  narrative,
  onClick,
}: NarrativeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, type: "spring", stiffness: 200, damping: 25 }}
      onClick={onClick}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer group max-w-xl w-full px-4"
    >
      <div className="relative bg-[#1a1520]/90 backdrop-blur-md border border-amber-200/15 rounded-2xl px-6 py-5 hover:border-amber-200/30 transition-all hover:bg-[#1a1520]/95">
        <span
          className="absolute -top-4 left-5 text-3xl text-amber-300/40 select-none"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          &ldquo;
        </span>

        <p
          className="text-base md:text-lg text-amber-50 font-medium leading-relaxed capitalize"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {narrative.pullQuote}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span
            className="text-sm text-amber-100/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {narrative.steps.length} articles connected
          </span>
          <span
            className="text-sm text-amber-100/80 group-hover:text-white transition-colors flex items-center gap-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            See the full story
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              &#x2192;
            </motion.span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
