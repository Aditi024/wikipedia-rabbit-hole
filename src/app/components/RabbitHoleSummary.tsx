"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RabbitHoleArticle } from "@/app/api/generate/route";
import { RabbitHoleNarrative } from "@/lib/narrative";
import { GemRarity } from "@/lib/scoring";

interface ScoreInfo {
  title: string;
  rarity: GemRarity;
  color: string;
}

interface RabbitHoleSummaryProps {
  open: boolean;
  narrative: RabbitHoleNarrative | null;
  articles: RabbitHoleArticle[];
  scores: ScoreInfo[];
  onClose: () => void;
}

export default function RabbitHoleSummary({
  open,
  narrative,
  articles,
  scores,
  onClose,
}: RabbitHoleSummaryProps) {
  const scoreMap: Record<string, ScoreInfo> = {};
  scores.forEach((s) => (scoreMap[s.title] = s));

  return (
    <AnimatePresence>
      {open && narrative && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#14111e]/98 backdrop-blur-lg border-l border-amber-200/15 z-50 overflow-y-auto"
          >
            <div className="p-8">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors text-lg"
              >
                &times;
              </button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p
                  className="text-sm uppercase tracking-[0.2em] text-amber-300/80 mb-5"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  The Rabbit Hole
                </p>

                <h2
                  className="text-2xl md:text-3xl font-bold text-white leading-tight mb-5 capitalize"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  &ldquo;{narrative.pullQuote}&rdquo;
                </h2>

                <p
                  className="text-base text-amber-50/90 leading-[1.75] mb-8"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {narrative.summary}
                </p>
              </motion.div>

              <div className="space-y-0">
                {narrative.steps.map((step, i) => {
                  const article = articles[i];
                  const score = scoreMap[step.title];

                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <div className="flex gap-4 items-start">
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                            style={{
                              borderColor: score?.color || "#666",
                              color: score?.color || "#aaa",
                            }}
                          >
                            {i + 1}
                          </div>
                          {i < narrative.steps.length - 1 && (
                            <div className="w-px h-16 bg-gradient-to-b from-amber-200/25 to-transparent" />
                          )}
                        </div>

                        <div className="pb-6 min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            {article?.thumbnail && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-amber-200/15">
                                <img
                                  src={article.thumbnail}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3
                                className="text-base font-bold text-white"
                                style={{ fontFamily: "var(--font-display)" }}
                              >
                                {step.title}
                              </h3>
                              {article?.description && (
                                <p
                                  className="text-sm text-amber-100/80 mt-1"
                                  style={{ fontFamily: "var(--font-body)" }}
                                >
                                  {article.description}
                                </p>
                              )}
                              {score && (
                                <span
                                  className="inline-block text-[11px] font-bold uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-full"
                                  style={{
                                    color: score.color,
                                    backgroundColor: `${score.color}20`,
                                  }}
                                >
                                  {score.rarity}
                                </span>
                              )}
                            </div>
                          </div>

                          {i < narrative.steps.length - 1 && (
                            <p
                              className="text-sm text-amber-100/70 mt-2 ml-15"
                              style={{ fontFamily: "var(--font-body)" }}
                            >
                              {step.segue} &darr;
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 pt-6 border-t border-amber-200/15"
              >
                <p
                  className="text-sm uppercase tracking-[0.2em] text-amber-300/80 mb-4"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Read the articles
                </p>
                <div className="space-y-3">
                  {articles.map((article) => (
                    <a
                      key={article.title}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-base text-amber-100/85 hover:text-white transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <span className="text-amber-300/70">&#x2192;</span>
                      {article.title}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
