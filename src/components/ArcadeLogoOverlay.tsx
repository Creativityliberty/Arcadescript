"use client";

import React from 'react';
import { useStyle } from "@/context/StyleContext";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    currentTime: number;
    duration: number;
}

export const ArcadeLogoOverlay: React.FC<Props> = ({ currentTime, duration }) => {
    const { currentTheme } = useStyle();

    // Animation Config
    const FADE_IN = 0.5;
    const HOLD = 2.0;
    const FADE_OUT = 0.5;
    const INTRO_END = FADE_IN + HOLD + FADE_OUT;

    // Determine visibility
    const isIntro = currentTime < INTRO_END;
    const isOutro = duration > 0 && currentTime > (duration - INTRO_END);
    const isVisible = isIntro || isOutro;

    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full flex items-center justify-center p-8"
            >
                {/* Border Frame */}
                <div className="absolute inset-8 border-4"
                    style={{ borderColor: currentTheme.colors.primary, boxShadow: `0 0 20px ${currentTheme.colors.primary}40` }}>
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4" style={{ borderColor: currentTheme.colors.accent }} />
                    <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4" style={{ borderColor: currentTheme.colors.accent }} />
                </div>

                {/* Logo Text */}
                <div className="flex flex-col items-center">
                    <h1 className="font-title italic font-black text-6xl md:text-8xl text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        style={{ fontFamily: currentTheme.fonts.title }}>
                        ARCADE
                    </h1>
                    <h1 className="font-title italic font-black text-6xl md:text-8xl tracking-widest drop-shadow-[0_0_20px_rgba(0,0,0,1)]"
                        style={{
                            fontFamily: currentTheme.fonts.title,
                            color: currentTheme.colors.primary,
                            marginTop: '-0.2em'
                        }}>
                        SCRIPT
                    </h1>
                </div>
            </motion.div>
        </div>
    );
};
