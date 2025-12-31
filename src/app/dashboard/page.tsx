"use client";

import React, { useState } from "react";
import { BattleArenaScreen } from "@/components/BattleArenaScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { AnimatedGlobe } from "@/components/AnimatedGlobe";
import { AppState, SubtitleSegment } from "@/types";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();
    const [state, setState] = useState<AppState>({
        currentScreen: 'arena',
        recordedBlob: null,
        subtitles: [],
        selectedStyleId: 'ryu_classic'
    });

    const handleComplete = (blob: Blob, subs: SubtitleSegment[]) => {
        setState(prev => ({
            ...prev,
            currentScreen: 'result',
            recordedBlob: blob,
            subtitles: subs,
        }));
    };

    const handleRetry = () => {
        setState(prev => ({
            ...prev,
            currentScreen: 'arena',
            recordedBlob: null,
            subtitles: [],
        }));
    };

    const handleHome = () => {
        router.push("/");
    };

    return (
        <main className="relative min-h-screen h-screen overflow-hidden bg-brand-dark">
            <AnimatedGlobe />

            <div className="relative z-10 h-full">
                {state.currentScreen === 'arena' && (
                    <BattleArenaScreen
                        onComplete={handleComplete}
                        onBack={handleHome}
                    />
                )}

                {state.currentScreen === 'result' && state.recordedBlob && (
                    <ResultScreen
                        videoBlob={state.recordedBlob}
                        subtitles={state.subtitles}
                        onRetry={handleRetry}
                        onHome={handleHome}
                    />
                )}
            </div>
        </main>
    );
}
