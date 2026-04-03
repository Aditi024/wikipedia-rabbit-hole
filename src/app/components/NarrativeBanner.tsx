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
      <div className="relative bg-white/70 backdrop-blur-md border border-[#EF3922]/10 rounded-2xl px-6 py-5 hover:border-[#EF3922]/25 transition-all hover:bg-white/85 shadow-lg shadow-black/5">
        <span
          className="absolute -top-4 left-5 text-3xl text-[#EF3922]/40 select-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          &ldquo;
        </span>

        <p
          className="text-base md:text-lg text-[#1a1520] font-medium leading-relaxed capitalize"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {narrative.pullQuote}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span
            className="text-sm text-[#1a1520]/80 font-medium"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {narrative.steps.length} articles connected
          </span>
          <span
            className="text-sm font-semibold text-[#EF3922] group-hover:text-[#d42f1a] transition-colors flex items-center gap-1"
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
