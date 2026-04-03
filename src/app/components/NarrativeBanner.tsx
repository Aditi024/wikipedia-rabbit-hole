"use client";

import { motion } from "framer-motion";
import type { RabbitHoleNarrative } from "@/lib/narrative";

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
      <div className="relative bg-surface-translucent backdrop-blur-md border border-brand-subtle rounded-2xl px-6 py-5 hover:border-brand-light transition-all hover:bg-surface-frosted/85 shadow-lg shadow-black/5">
        <span className="absolute -top-4 left-5 text-3xl text-brand-medium select-none font-display">
          &ldquo;
        </span>

        <p className="text-base md:text-lg text-foreground font-medium leading-relaxed capitalize font-body">
          {narrative.pullQuote}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-text-secondary font-medium font-body">
            {narrative.steps.length} articles connected
          </span>
          <span className="text-sm font-semibold text-brand group-hover:text-brand-hover transition-colors flex items-center gap-1 font-body">
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
