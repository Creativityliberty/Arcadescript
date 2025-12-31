"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export const AuthForms: React.FC<{ mode: "login" | "signup" }> = ({ mode }) => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-8 glass border-brand-orange/20 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24 fill-brand-orange" />
            </div>

            <div className="mb-8">
                <h2 className="text-3xl font-title uppercase text-white mb-2">
                    {mode === "login" ? "User Access" : "Join the Clan"}
                </h2>
                <p className="text-white/50 text-sm font-sans">
                    {mode === "login"
                        ? "Enter your credentials to synchronize with the Orochi network."
                        : "Complete the initiation to access prime script generation."}
                </p>
            </div>

            <form className="space-y-6">
                {mode === "signup" && (
                    <div className="space-y-2">
                        <label className="block text-[10px] font-arcade text-brand-orange">Fighter Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="text"
                                placeholder="YASHIRO_97"
                                className="w-full bg-black/40 border border-white/10 px-10 py-3 text-white focus:border-brand-orange outline-none transition-all font-mono text-sm"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-[10px] font-arcade text-brand-orange">Identity Token (Email)</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="email"
                            placeholder="fighter@orochi.com"
                            className="w-full bg-black/40 border border-white/10 px-10 py-3 text-white focus:border-brand-orange outline-none transition-all font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-arcade text-brand-orange">Security Phase (Password)</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-black/40 border border-white/10 px-10 py-3 text-white focus:border-brand-orange outline-none transition-all font-mono text-sm"
                        />
                    </div>
                </div>

                <Link
                    href="/dashboard"
                    className="w-full py-4 bg-brand-orange text-black font-title uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 group"
                >
                    {mode === "login" ? "Initialize Logic" : "Execute Contract"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-white/30 text-xs font-sans">
                    {mode === "login" ? "New recruit?" : "Already initiated?"}
                    <button className="ml-2 text-brand-orange hover:text-white transition-colors underline underline-offset-4">
                        {mode === "login" ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        </motion.div>
    );
};
