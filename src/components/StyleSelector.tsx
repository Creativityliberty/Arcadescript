"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStyle } from "@/context/StyleContext";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

export const StyleSelector: React.FC = () => {
    const { currentTheme, setThemeId, availableThemes } = useStyle();

    const currentIndex = availableThemes.findIndex(t => t.id === currentTheme.id);

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % availableThemes.length;
        setThemeId(availableThemes[nextIndex].id);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + availableThemes.length) % availableThemes.length;
        setThemeId(availableThemes[prevIndex].id);
    };

    return (
        <div className="flex items-center justify-center gap-4 bg-black/40 backdrop-blur-sm p-4 border-y border-white/10 w-full animate-fadeIn" style={{
            borderTopColor: currentTheme.colors.primary,
            borderBottomColor: currentTheme.colors.primary,
            boxShadow: `0 0 20px ${currentTheme.colors.secondary}40`
        }}>
            <button
                onClick={handlePrev}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTheme.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center w-full max-w-[200px]"
                >
                    <h3
                        className="text-xl font-bold uppercase tracking-widest leading-none drop-shadow-lg"
                        style={{
                            fontFamily: currentTheme.fonts.title,
                            color: currentTheme.colors.primary
                        }}
                    >
                        {currentTheme.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <Zap className="w-3 h-3" style={{ color: currentTheme.colors.accent }} />
                        <p className="text-[10px] text-white/80 font-mono tracking-widest uppercase">
                            {currentTheme.description}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            <button
                onClick={handleNext}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
};
