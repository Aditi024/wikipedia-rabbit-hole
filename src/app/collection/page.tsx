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
import Link from "next/link";

export default function CollectionPage() {
  const [holes, setHoles] = useState<SavedRabbitHole[]>([]);
  const [stats, setStats] = useState<ExplorerStats>({
    totalExplored: 0,
    totalGems: 0,
    rarestFind: null,
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setHoles(getSavedHoles());
    setStats(getStats());
  }, []);

  const handleDelete = (id: string) => {
    deleteRabbitHole(id);
    setHoles(getSavedHoles());
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your Collection
        </h1>
        <p
          className="text-lg text-amber-100/80 mb-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Rabbit holes you&apos;ve saved along the way.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-10"
      >
        <div className="bg-amber-100/5 border border-amber-200/15 rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{stats.totalExplored}</p>
          <p className="text-sm text-amber-100/80 mt-1" style={{ fontFamily: "var(--font-body)" }}>Holes Explored</p>
        </div>
        <div className="bg-amber-100/5 border border-amber-200/15 rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{stats.totalGems}</p>
          <p className="text-sm text-amber-100/80 mt-1" style={{ fontFamily: "var(--font-body)" }}>Total Gems</p>
        </div>
        <div className="bg-amber-100/5 border border-amber-200/15 rounded-2xl p-5 text-center">
          <p className="text-sm font-bold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>
            {stats.rarestFind?.title || "---"}
          </p>
          <p className="text-sm text-amber-100/80 mt-1" style={{ fontFamily: "var(--font-body)" }}>
            Rarest Find
            {stats.rarestFind && (
              <span className="text-amber-300 ml-1">
                ({stats.rarestFind.rarity})
              </span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Saved holes */}
      {holes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-20"
        >
          <p className="text-amber-100/70 text-lg mb-4" style={{ fontFamily: "var(--font-body)" }}>No saved rabbit holes yet.</p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 rounded-full bg-amber-100/10 text-amber-100 border border-amber-300/25 font-semibold text-sm hover:bg-amber-100/20 transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Start Exploring
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {holes.map((hole, i) => (
              <motion.div
                key={hole.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.05 }}
                className="bg-amber-100/5 border border-amber-200/15 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpanded(expanded === hole.id ? null : hole.id)
                  }
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex -space-x-2">
                      {hole.articles.slice(0, 3).map((a) => (
                        <div
                          key={a.title}
                          className="w-8 h-8 rounded-full border-2 border-zinc-800 overflow-hidden bg-zinc-700"
                        >
                          {a.thumbnail && (
                            <img
                              src={a.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {hole.articles[0]?.title} &rarr;{" "}
                        {hole.articles[hole.articles.length - 1]?.title}
                      </p>
                      <p className="text-sm text-amber-100/70" style={{ fontFamily: "var(--font-body)" }}>
                        {new Date(hole.createdAt).toLocaleDateString()} &middot;{" "}
                        {hole.articles.length} articles
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">
                      {hole.gemScore} pts
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {expanded === hole.id ? "v" : ">"}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {expanded === hole.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 space-y-2 border-t border-white/5 pt-3">
                        {hole.articles.map((article, j) => (
                          <div
                            key={article.title}
                            className="flex items-center gap-3"
                          >
                            <span className="text-xs text-zinc-600 w-4">
                              {j + 1}.
                            </span>
                            <div className="w-6 h-6 rounded overflow-hidden bg-zinc-700 shrink-0">
                              {article.thumbnail && (
                                <img
                                  src={article.thumbnail}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-zinc-300 hover:text-white transition-colors truncate"
                            >
                              {article.title}
                            </a>
                          </div>
                        ))}
                        <button
                          onClick={() => handleDelete(hole.id)}
                          className="mt-2 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
