"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Play, ChevronRight } from "lucide-react";
import Link from "next/link";

export const YashiroHero: React.FC = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
            {/* Background Hero Image - Using the generated asset */}
            <div className="absolute inset-0 z-0 flex justify-end items-center opacity-40 md:opacity-60">
                <motion.img
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    src="/yashiro.png" // We'll need to move the generated image here
                    alt="Yashiro Nanakase"
                    className="h-[80%] md:h-[100%] object-contain"
                />
            </div>

            <div className="container mx-auto z-10 grid md:grid-cols-2 items-center">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 text-brand-orange font-arcade text-xs mb-4"
                    >
                        <Zap className="w-4 h-4 fill-brand-orange" />
                        <span>KOF XV / OROCHI EDITION</span>
                    </motion.div>

                    <motion.h1
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-6xl md:text-8xl font-title uppercase leading-none mb-6 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Arcade <br />
                        <span className="text-brand-orange">Script</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-lg md:text-xl text-white/70 font-sans max-w-lg mb-8"
                    >
                        Unleash the power of the <span className="text-white font-bold">Four Heavenly Kings</span>.
                        Generate premium video scripts with the speed and precision of Yashiro Nanakase.
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-brand-orange text-black font-title uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Start Engine
                        </Link>
                        <button className="px-8 py-4 border border-white/20 glass text-white font-title uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                            Learn Specs
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Aggressive Graphic Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[20px] border-white/5 opacity-50" />
            <div className="absolute bottom-0 left-0 p-8 flex gap-8 items-center opacity-30">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-brand-red animate-pulse" />
                    <span className="text-[10px] font-arcade">SYSTEM ONLINE</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500" />
                    <span className="text-[10px] font-arcade">GEMINI CONNECTED</span>
                </div>
            </div>
        </section>
    );
};
