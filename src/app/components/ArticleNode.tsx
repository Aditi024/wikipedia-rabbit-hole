"use client";

import { forwardRef, useCallback } from "react";
import { motion, useDragControls } from "framer-motion";
import { RabbitHoleArticle } from "@/app/api/generate/route";

interface ArticleNodeProps {
  article: RabbitHoleArticle;
  index: number;
  position: { x: number; y: number; rotation: number };
  isSelected: boolean;
  isWiring: boolean;
  rarity?: string;
  rarityColor?: string;
  onClick: () => void;
  onRemove: () => void;
  onPortClick: (cardIndex: number) => void;
  onDragUpdate: () => void;
}

const ArticleNode = forwardRef<HTMLDivElement, ArticleNodeProps>(
  function ArticleNode(
    {
      article,
      index,
      position,
      isSelected,
      isWiring,
      rarity,
      rarityColor,
      onClick,
      onRemove,
      onPortClick,
      onDragUpdate,
    },
    ref
  ) {
    const portColor = rarityColor || "#666";
    const dragControls = useDragControls();

    const handlePortClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onPortClick(index);
      },
      [index, onPortClick]
    );

    const stopPointer = useCallback((e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
    }, []);

    const startDrag = useCallback(
      (e: React.PointerEvent) => {
        if (isWiring) return;
        dragControls.start(e);
      },
      [dragControls, isWiring]
    );

    const floatDuration = 5 + (index % 3) * 1.5;
    const floatAmplitude = 6 + (index % 2) * 3;

    return (
      <motion.div
        ref={ref}
        data-card-index={index}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 1,
          scale: isSelected ? 1.05 : 1,
          rotate: position.rotation,
          y: [0, -floatAmplitude, 0],
        }}
        exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: index * 0.25,
          y: {
            duration: floatDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.8,
          },
        }}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        onDrag={onDragUpdate}
        onDragEnd={onDragUpdate}
        whileHover={{ scale: 1.04, zIndex: 50 }}
        className="absolute group"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%)`,
          zIndex: isSelected ? 40 : 10 + index,
        }}
      >
        {/* Input port — left side — FILLED circle */}
        <div
          data-port="input"
          onPointerDown={stopPointer}
          onClick={handlePortClick}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
          style={{ padding: 10 }}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${isWiring ? "scale-[1.7] animate-pulse" : "hover:scale-150"}`}
            style={{
              backgroundColor: isWiring ? "#EF3922" : portColor,
              boxShadow: isWiring
                ? "0 0 16px rgba(239,57,34,0.8), 0 0 30px rgba(239,57,34,0.3)"
                : `0 0 6px ${portColor}40`,
            }}
          />
        </div>

        {/* Output port — right side — OUTLINED circle */}
        <div
          data-port="output"
          onPointerDown={stopPointer}
          onClick={handlePortClick}
          className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
          style={{ padding: 10 }}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full border-[2.5px] transition-all duration-150 ${isWiring ? "scale-[1.7] animate-pulse" : "hover:scale-150"}`}
            style={{
              borderColor: isWiring ? "#EF3922" : portColor,
              backgroundColor: "transparent",
              boxShadow: isWiring
                ? "0 0 16px rgba(239,57,34,0.8), 0 0 30px rgba(239,57,34,0.3)"
                : `0 0 6px ${portColor}40`,
            }}
          />
        </div>

        {/* Card body — drag handle, and wiring target when in wiring mode */}
        <div
          onPointerDown={startDrag}
          onClick={(e) => {
            e.stopPropagation();
            if (isWiring) {
              onPortClick(index);
            } else {
              onClick();
            }
          }}
          className={`
            w-44 rounded-2xl overflow-hidden select-none
            bg-[#1a1520]/95 backdrop-blur-sm
            border-2 transition-all duration-300
            ${isWiring ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}
            ${isSelected ? "border-[#EF3922]/40 shadow-[0_0_30px_rgba(239,57,34,0.15)]" : "border-white/20 hover:border-white/40"}
            ${isWiring ? "border-[#EF3922]/40 shadow-[0_0_20px_rgba(239,57,34,0.2)]" : ""}
          `}
          style={
            isSelected && rarityColor
              ? { boxShadow: `0 0 30px ${rarityColor}40, 0 0 60px ${rarityColor}20` }
              : undefined
          }
        >
          {article.thumbnail ? (
            <div className="w-full h-28 overflow-hidden">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                draggable={false}
              />
            </div>
          ) : (
            <div className="w-full h-28 bg-gradient-to-br from-[#F184EB]/15 to-[#EF3922]/10 flex items-center justify-center">
              <span className="text-3xl opacity-30">?</span>
            </div>
          )}

          <div className="p-3">
            <h3
              className="text-[13px] font-bold text-white leading-snug line-clamp-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {article.title}
            </h3>
            {article.description && (
              <p
                className="text-sm text-white/60 mt-1 line-clamp-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {article.description}
              </p>
            )}
            {rarity && (
              <div className="mt-2">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  style={{
                    color: rarityColor,
                    backgroundColor: `${rarityColor}20`,
                  }}
                >
                  {rarity}
                </span>
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.25 + 0.15, type: "spring", stiffness: 400 }}
          className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#EF3922] text-white text-xs font-bold flex items-center justify-center shadow-lg pointer-events-none"
        >
          {index + 1}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.25 + 0.2 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/80 border border-[#1a1520]/10 text-[#1a1520]/50 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:border-red-400 hover:text-white transition-all duration-200 z-20"
        >
          &times;
        </motion.button>
      </motion.div>
    );
  }
);

export default ArticleNode;
