"use client";

import { motion } from "framer-motion";
import { RabbitHoleArticle, ScoreInfo } from "@/lib/types";
import { RabbitHoleNarrative } from "@/lib/narrative";
import { buildScoreMap } from "@/lib/graph";
import SlidePanel from "./SlidePanel";

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
  const scoreMap = buildScoreMap(scores);

  return (
    <SlidePanel open={open && !!narrative} onClose={onClose} maxWidth="max-w-lg">
      {narrative && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-brand font-semibold mb-5 font-body">
              The Rabbit Hole
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-5 capitalize font-display">
              &ldquo;{narrative.pullQuote}&rdquo;
            </h2>

            <p className="text-base text-text-secondary leading-[1.75] mb-8 font-body">
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
                        <div className="w-px h-16 bg-gradient-to-b from-brand-light to-transparent" />
                      )}
                    </div>

                    <div className="pb-6 min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        {article?.thumbnail && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-foreground/10">
                            <img
                              src={article.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-foreground font-display">
                            {step.title}
                          </h3>
                          {article?.description && (
                            <p className="text-sm text-text-secondary mt-1 font-body">
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

                      {i < narrative.steps.length - 1 && step.connection && (
                        <p className="text-sm text-text-secondary mt-2 leading-relaxed font-body">
                          {step.connection}
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
            className="mt-6 pt-6 border-t border-foreground/10"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-brand font-semibold mb-4 font-body">
              Read the articles
            </p>
            <div className="space-y-3">
              {articles.map((article) => (
                <a
                  key={article.title}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-text-secondary hover:text-brand transition-colors font-body"
                >
                  <span className="text-brand">&#x2192;</span>
                  {article.title}
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </SlidePanel>
  );
}
