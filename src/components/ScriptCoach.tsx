"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Copy, Zap, MessageSquare } from "lucide-react";
import { generateScriptHelp } from "@/services/gemini";
import { useStyle } from "@/context/StyleContext";

interface Props {
    onClose: () => void;
}

export const ScriptCoach: React.FC<Props> = ({ onClose }) => {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { currentTheme } = useStyle();

    const handleAsk = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        try {
            const result = await generateScriptHelp(prompt);
            setResponse(result);
        } catch (err) {
            setResponse("Coach is out to lunch. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900 border-2 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                style={{ borderColor: currentTheme.colors.primary }}
            >
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-white/10 bg-black/40">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 animate-pulse" style={{ color: currentTheme.colors.primary }} />
                        <h2 className="font-arcade text-white text-lg uppercase tracking-widest">
                            SCRIPT COACH <span className="opacity-50 text-xs">AI</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                    {/* Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase text-slate-400">Your Rough Idea</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. I want to talk about how Bun is faster than Node..."
                            className="w-full h-24 bg-black border border-white/20 p-3 text-white focus:outline-none focus:border-brand-orange transition-colors font-mono text-sm resize-none"
                            style={{ borderColor: currentTheme.colors.secondary }}
                        />
                    </div>

                    {/* Action */}
                    <button
                        onClick={handleAsk}
                        disabled={isLoading || !prompt.trim()}
                        className="w-full py-3 font-title uppercase tracking-wider text-black transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: currentTheme.colors.primary,
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? <span className="animate-spin text-xl">↻</span> : <Sparkles className="w-4 h-4 fill-black" />}
                        {isLoading ? "COACH IS THINKING..." : "PIMP MY SCRIPT"}
                    </button>

                    {/* Result */}
                    {response && (
                        <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-mono uppercase text-slate-400">Viral Rewrite</label>
                                <button
                                    onClick={() => navigator.clipboard.writeText(response)}
                                    className="text-[10px] flex items-center gap-1 text-white/60 hover:text-white uppercase font-mono"
                                >
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                            </div>
                            <div className="bg-black/50 border border-white/10 p-4 text-white font-mono text-sm whitespace-pre-wrap leading-relaxed relative">
                                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: currentTheme.colors.accent }} />
                                {response}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
