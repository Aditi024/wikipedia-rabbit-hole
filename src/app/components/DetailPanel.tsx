"use client";

import { motion } from "framer-motion";
import { RabbitHoleArticle } from "@/lib/types";
import { GemRarity } from "@/lib/scoring";
import GemBadge from "./GemBadge";
import SlidePanel from "./SlidePanel";

interface DetailPanelProps {
  article: RabbitHoleArticle | null;
  rarity?: GemRarity;
  rarityColor?: string;
  connectionContext?: string;
  onClose: () => void;
}

export default function DetailPanel({
  article,
  rarity,
  rarityColor,
  connectionContext,
  onClose,
}: DetailPanelProps) {
  return (
    <SlidePanel open={!!article} onClose={onClose}>
      {article && (
        <>
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

            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight font-display">
              {article.title}
            </h2>

            {article.description && (
              <p className="text-base text-text-secondary mb-5 font-body">
                {article.description}
              </p>
            )}

            <p className="text-base text-text-secondary leading-[1.75] mb-6 font-body">
              {article.extract}
            </p>

            {connectionContext && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-brand/5 border border-brand-subtle">
                <p className="text-xs uppercase tracking-wider text-text-muted font-display mb-1.5">
                  How this connects
                </p>
                <p className="text-sm text-text-secondary leading-relaxed font-body">
                  {connectionContext}
                </p>
              </div>
            )}

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-white font-medium text-sm hover:bg-brand-hover transition-colors font-display"
            >
              Read on Wikipedia &#x2192;
            </a>
          </motion.div>
        </>
      )}
    </SlidePanel>
  );
}
