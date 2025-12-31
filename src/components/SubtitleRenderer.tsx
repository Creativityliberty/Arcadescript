"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SubtitleSegment } from "@/types";

import { useStyle } from "@/context/StyleContext";
import { useSoundFX } from "@/hooks/useSoundFX";

export const SubtitleRenderer: React.FC<{ subtitles: SubtitleSegment[]; currentTime: number }> = ({ subtitles, currentTime }) => {
    const currentSub = subtitles.find(s => currentTime >= s.start && currentTime <= s.end);
    const { currentTheme } = useStyle();
    const { playSound } = useSoundFX();
    const [lastPlayedText, setLastPlayedText] = useState<string | null>(null);

    useEffect(() => {
        if (currentSub && currentSub.text !== lastPlayedText) {
            if (currentSub.emotion === 'anger') playSound('hit');
            else if (currentSub.emotion === 'hype') playSound('combo');
            setLastPlayedText(currentSub.text);
        }
    }, [currentSub, lastPlayedText, playSound]);

    if (!currentSub) return null;

    const getAnimation = (emotion: string) => {
        switch (emotion) {
            case 'anger': return { x: [0, -5, 5, -5, 0], scale: [1, 1.1, 1], filter: `drop-shadow(0 0 15px ${currentTheme.colors.accent})` };
            case 'hype': return { y: [0, -10, 0], scale: [1, 1.2, 1], filter: `drop-shadow(0 0 20px ${currentTheme.colors.primary})` };
            case 'joy': return { rotate: [-5, 5, -5], scale: [1, 1.05, 1], filter: "drop-shadow(0 0 10px #ffea00)" };
            case 'sad': return { opacity: [0.6, 0.9, 0.6], scale: [0.95, 1, 0.95], filter: "grayscale(100%)" };
            default: return { y: 0, opacity: 1 };
        }
    };

    return (
        <div className="absolute bottom-[20%] inset-x-4 flex justify-center pointer-events-none z-50">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSub.text}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        ...getAnimation(currentSub.emotion)
                    }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                    className={`
                        text-center px-4 py-2 md:px-6 md:py-4 border-2 shadow-2xl backdrop-blur-md bg-black/60
                        uppercase tracking-tighter leading-tight
                        max-w-[90%] md:max-w-[80%]
                    `}
                    style={{
                        fontSize: "clamp(1rem, 5vw, 2.5rem)",
                        fontFamily: ['anger', 'hype'].includes(currentSub.emotion) ? currentTheme.fonts.title : currentTheme.fonts.body,
                        color: currentSub.emotion === 'anger' ? '#ff2626' :
                            currentSub.emotion === 'hype' ? currentTheme.colors.primary :
                                'white',
                        borderColor: ['anger', 'hype'].includes(currentSub.emotion) ? currentTheme.colors.primary : 'rgba(255,255,255,0.2)',
                        boxShadow: `0 0 30px ${['anger', 'hype'].includes(currentSub.emotion) ? currentTheme.colors.secondary : 'rgba(0,0,0,0.5)'}`
                    }}
                >
                    {currentSub.text}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
