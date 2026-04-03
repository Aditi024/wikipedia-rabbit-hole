"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSavedHoles,
  deleteRabbitHole,
  getStats,
  SavedRabbitHole,
  ExplorerStats,
} from "@/lib/storage";
import { DEFAULT_STATS } from "@/lib/config";
import { encodeRabbitHole } from "@/lib/share";
import ExploreButton from "@/app/components/ExploreButton";
import Link from "next/link";

function StatCard({
  value,
  label,
  accent,
  delay,
}: {
  value: string | number;
  label: string;
  accent?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface-frosted backdrop-blur-sm border border-brand-subtle rounded-2xl p-6 text-center hover:border-brand-light transition-all overflow-hidden min-w-0"
    >
      <p className={`font-bold text-brand font-display truncate ${
        typeof value === "string" && value.length > 6 ? "text-base" : "text-3xl"
      }`}>{value}</p>
      <p className="text-sm text-text-muted font-medium mt-2 font-body">
        {label}
        {accent && (
          <span className="block text-brand text-xs mt-0.5">{accent}</span>
        )}
      </p>
    </motion.div>
  );
}

export default function CollectionPage() {
  const [holes, setHoles] = useState<SavedRabbitHole[]>([]);
  const [stats, setStats] = useState<ExplorerStats>({ ...DEFAULT_STATS });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setHoles(getSavedHoles());
    setStats(getStats());
  }, []);

  const handleDelete = (id: string) => {
    deleteRabbitHole(id);
    setHoles(getSavedHoles());
  };

  const handleShare = async (hole: SavedRabbitHole) => {
    const encoded = encodeRabbitHole(hole.articles.map((a) => a.title));
    const url = `${window.location.origin}/share/${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(hole.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const hasHoles = holes.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-5xl font-extrabold text-brand leading-tight font-display">
          Your
          <br />
          Collection
        </h1>
        <p className="text-base text-text-secondary mt-3 font-body">
          {hasHoles
            ? `${holes.length} rabbit hole${holes.length === 1 ? "" : "s"} saved so far.`
            : "Rabbit holes you save will appear here."}
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mb-12">
        <StatCard
          value={stats.totalExplored}
          label="Explored"
          delay={0.1}
        />
        <StatCard
          value={stats.totalGems}
          label="Gems Found"
          delay={0.15}
        />
        <StatCard
          value={stats.rarestFind?.title || "---"}
          label="Rarest Find"
          accent={stats.rarestFind?.rarity}
          delay={0.2}
        />
      </div>

      {!hasHoles ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center py-16 gap-5"
        >
          <p className="text-text-muted text-base font-body">
            Nothing here yet. Go explore.
          </p>
          <ExploreButton href="/" label="Start Exploring" />
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {holes.map((hole, i) => {
              const first = hole.articles[0];
              const last = hole.articles[hole.articles.length - 1];
              const isExpanded = expanded === hole.id;

              return (
                <motion.div
                  key={hole.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  className="bg-surface-frosted backdrop-blur-sm border border-brand-subtle rounded-2xl overflow-hidden hover:border-brand-light transition-all"
                >
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : hole.id)
                    }
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex -space-x-2">
                        {hole.articles.slice(0, 4).map((a) => (
                          <div
                            key={a.title}
                            className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-grid/20 shadow-sm"
                          >
                            {a.thumbnail ? (
                              <img
                                src={a.thumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-brand-subtle" />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate font-body">
                          {first?.title}
                          <span className="text-text-muted mx-1.5">&rarr;</span>
                          {last?.title}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 font-body">
                          {new Date(hole.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}{" "}
                          &middot; {hole.articles.length} articles
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-brand font-display">
                        {hole.gemScore}
                      </span>
                      <motion.span
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        className="text-text-faint text-xs"
                      >
                        &#x25B6;
                      </motion.span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-2.5 border-t border-foreground/5 pt-4">
                          {hole.articles.map((article, j) => (
                            <div
                              key={article.title}
                              className="flex items-center gap-3"
                            >
                              <span className="text-xs text-text-muted font-bold w-5 text-right font-display">
                                {j + 1}
                              </span>
                              <div className="w-7 h-7 rounded-lg overflow-hidden bg-grid/15 shrink-0">
                                {article.thumbnail ? (
                                  <img
                                    src={article.thumbnail}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-brand-subtle" />
                                )}
                              </div>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-text-secondary hover:text-brand transition-colors truncate font-body"
                              >
                                {article.title}
                              </a>
                            </div>
                          ))}

                          <div className="flex items-center gap-3 pt-2 border-t border-foreground/5">
                            <button
                              onClick={() => handleShare(hole)}
                              className="text-xs font-medium text-text-muted hover:text-brand transition-colors font-body"
                            >
                              {copiedId === hole.id
                                ? "Link copied!"
                                : "Share"}
                            </button>
                            <span className="text-foreground/10">|</span>
                            <button
                              onClick={() => handleDelete(hole.id)}
                              className="text-xs font-medium text-text-muted hover:text-red-500 transition-colors font-body"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
