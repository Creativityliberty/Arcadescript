"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Terminal, Sparkles, Loader2 } from "lucide-react";
import { generateScript } from "@/lib/gemini";

export const GeminiChat: React.FC = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await generateScript(userMessage);
            setMessages((prev) => [...prev, { role: "ai", content: response }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: "ai", content: "CRITICAL_ERROR: Orochi network synchronization failed. Check API key." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto glass border-brand-orange/20 flex flex-col h-[600px] mt-12 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-brand-orange" />
                    <span className="font-arcade text-[10px] tracking-tighter">OROCHI_SCRIPT_ENGINE_V1.5</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white/50 uppercase">Sync Active</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                        <Sparkles className="w-12 h-12" />
                        <p className="font-arcade text-xs">Awaiting Input Signal...</p>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: msg.role === "user" ? 20 : -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`
                  max-w-[80%] p-4 font-mono text-sm
                  ${msg.role === "user"
                                        ? "bg-brand-orange text-black font-bold"
                                        : "bg-white/5 border border-white/10 text-white"}
                `}
                            >
                                <div className="text-[10px] uppercase opacity-50 mb-1 border-b border-current/20 pb-1">
                                    {msg.role === "user" ? "> FTR_COMMAND" : "> OROCHI_RESPONSE"}
                                </div>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                            <span className="text-[10px] font-arcade animate-pulse">Computing Combo...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-black/60 border-t border-white/10">
                <div className="relative group">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        placeholder="ENTER_PROMPT_HERE"
                        className="w-full bg-black/40 border border-white/10 px-4 py-4 pr-16 text-white outline-none focus:border-brand-orange focus:bg-black transition-all font-mono placeholder:opacity-20"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-orange text-black hover:bg-white transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};
