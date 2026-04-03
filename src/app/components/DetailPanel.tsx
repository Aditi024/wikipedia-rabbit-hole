"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RabbitHoleArticle } from "@/app/api/generate/route";
import GemBadge from "./GemBadge";
import { GemRarity } from "@/lib/scoring";

interface DetailPanelProps {
  article: RabbitHoleArticle | null;
  rarity?: GemRarity;
  rarityColor?: string;
  onClose: () => void;
}

export default function DetailPanel({
  article,
  rarity,
  rarityColor,
  onClose,
}: DetailPanelProps) {
  return (
    <AnimatePresence>
      {article && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/95 backdrop-blur-lg border-l border-[#EF3922]/10 z-50 overflow-y-auto"
          >
            <div className="p-8">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#1a1520]/5 hover:bg-[#1a1520]/10 flex items-center justify-center text-[#1a1520]/60 hover:text-[#1a1520] transition-colors text-lg"
              >
                &times;
              </button>

              {article.thumbnail && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="w-full h-56 rounded-2xl overflow-hidden mb-6"
                  style={
                    rarityColor
                      ? { boxShadow: `0 0 40px ${rarityColor}30` }
                      : undefined
                  }
                >
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {rarity && (
                  <div className="mb-4">
                    <GemBadge rarity={rarity} />
                  </div>
                )}

                <h2
                  className="text-2xl md:text-3xl font-bold text-[#1a1520] mb-3 leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {article.title}
                </h2>

                {article.description && (
                  <p
                    className="text-base text-[#1a1520]/75 mb-5"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {article.description}
                  </p>
                )}

                <p
                  className="text-base text-[#1a1520]/80 leading-[1.75] mb-8"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {article.extract}
                </p>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EF3922] text-white font-medium text-sm hover:bg-[#d42f1a] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Read on Wikipedia &#x2192;
                </a>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
