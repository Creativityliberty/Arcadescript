"use client";

import React, { useRef, useState, useEffect } from "react";
import {
    RotateCcw, Home, Download, Share2,
    Loader2, Smartphone, Play, Pause,
    Wand2, Type
} from "lucide-react";
import { SubtitleSegment, VideoFilter } from "@/types";
import { SubtitleRenderer } from "./SubtitleRenderer";

interface Props {
    videoBlob: Blob;
    subtitles: SubtitleSegment[];
    onRetry: () => void;
    onHome: () => void;
}

const EXPORT_FORMATS = [
    { id: 'story', name: 'Stories (9:16)', width: 1080, height: 1920, label: 'TikTok / Reels' },
    { id: 'portrait', name: 'Portrait (4:5)', width: 1080, height: 1350, label: 'Insta Post' },
    { id: 'square', name: 'Square (1:1)', width: 1080, height: 1080, label: 'Universal' },
    { id: 'landscape', name: 'Landscape (16:9)', width: 1920, height: 1080, label: 'YouTube' },
];

import { ArcadeLogoOverlay } from './ArcadeLogoOverlay';
import { useStyle } from "@/context/StyleContext";

export const ResultScreen: React.FC<Props> = ({ videoBlob, subtitles, onRetry, onHome }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoUrl, setVideoUrl] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [selectedFormat, setSelectedFormat] = useState(EXPORT_FORMATS[0]);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editableSubtitles, setEditableSubtitles] = useState<SubtitleSegment[]>(subtitles);
    const [syncOffset, setSyncOffset] = useState(0); // in ms

    // Reset editable subs when new file comes in
    useEffect(() => {
        setEditableSubtitles(subtitles);
        setSyncOffset(0);
    }, [subtitles]);

    const getSyncedSubtitles = () => {
        return editableSubtitles.map(s => ({
            ...s,
            start: s.start + (syncOffset / 1000),
            end: s.end + (syncOffset / 1000)
        }));
    };

    const { currentTheme } = useStyle();

    useEffect(() => {
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [videoBlob]);

    const handleTimeUpdate = () => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            isPlaying ? videoRef.current.pause() : videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleExport = async (format = selectedFormat) => {
        setIsExporting(true);
        setRenderProgress(0);
        setShowExportMenu(false);

        // Use current edits
        const finalSubtitles = getSyncedSubtitles();

        try {
            const offlineVideo = document.createElement('video');
            offlineVideo.src = URL.createObjectURL(videoBlob);
            await new Promise(res => offlineVideo.onloadedmetadata = res);

            const canvas = document.createElement('canvas');
            canvas.width = format.width;
            canvas.height = format.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("No context");

            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioCtx.createMediaElementSource(offlineVideo);
            const dest = audioCtx.createMediaStreamDestination();
            source.connect(dest);

            const stream = canvas.captureStream(30);
            stream.addTrack(dest.stream.getAudioTracks()[0]);

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

            mediaRecorder.onstop = () => {
                const finalBlob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(finalBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `arcadescript-${format.id}-${Date.now()}.webm`;
                a.click();
                setIsExporting(false);
                audioCtx.close();
            };

            mediaRecorder.start();
            offlineVideo.play();

            const draw = () => {
                if (offlineVideo.ended) {
                    mediaRecorder.stop();
                    return;
                }

                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Smart scaling: "Cover" mode
                const scale = Math.max(canvas.width / offlineVideo.videoWidth, canvas.height / offlineVideo.videoHeight);
                const w = offlineVideo.videoWidth * scale;
                const h = offlineVideo.videoHeight * scale;
                const x = (canvas.width - w) / 2;
                const y = (canvas.height - h) / 2;

                ctx.drawImage(offlineVideo, x, y, w, h);

                const t = offlineVideo.currentTime;
                const duration = offlineVideo.duration || 10; // fallback

                // --- ARCADE LOGO ANIMATION ---
                // Show at 0-3s and (End-3s)-End
                const fadeInDuration = 0.5;
                const holdDuration = 2.0;
                const fadeOutDuration = 0.5;
                const introEnd = fadeInDuration + holdDuration + fadeOutDuration;

                let logoAlpha = 0;

                // Intro Logic
                if (t < introEnd) {
                    if (t < fadeInDuration) logoAlpha = t / fadeInDuration;
                    else if (t < fadeInDuration + holdDuration) logoAlpha = 1;
                    else logoAlpha = 1 - ((t - (fadeInDuration + holdDuration)) / fadeOutDuration);
                }
                // Outro Logic
                else if (t > duration - introEnd) {
                    const timeLeft = duration - t;
                    if (timeLeft < fadeOutDuration) logoAlpha = timeLeft / fadeOutDuration;
                    else if (timeLeft < fadeOutDuration + holdDuration) logoAlpha = 1;
                    else logoAlpha = 1 - ((timeLeft - (fadeOutDuration + holdDuration)) / fadeInDuration);
                }

                if (logoAlpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = logoAlpha;

                    // Logo Frame
                    const borderT = 20;
                    const pad = 40;

                    // Draw stylish border frame
                    ctx.strokeStyle = currentTheme.colors.primary;
                    ctx.lineWidth = 4;
                    ctx.strokeRect(pad, pad, canvas.width - pad * 2, canvas.height - pad * 2);

                    // Inner accent lines
                    ctx.strokeStyle = currentTheme.colors.accent;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(pad, pad + 100);
                    ctx.lineTo(pad, pad);
                    ctx.lineTo(pad + 100, pad);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(canvas.width - pad, canvas.height - pad - 100);
                    ctx.lineTo(canvas.width - pad, canvas.height - pad);
                    ctx.lineTo(canvas.width - pad - 100, canvas.height - pad);
                    ctx.stroke();

                    // LOGO TEXT
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const logoSize = Math.floor(canvas.width * 0.1);
                    ctx.font = `900 italic ${logoSize}px "Rubik Glitch", "Russo One", sans-serif`;

                    // Text Shadow/Glow
                    ctx.shadowColor = currentTheme.colors.primary;
                    ctx.shadowBlur = 20;
                    ctx.fillStyle = '#fff';
                    ctx.fillText("ARCADE", canvas.width / 2, canvas.height / 2 - logoSize * 0.6);

                    ctx.fillStyle = currentTheme.colors.primary;
                    ctx.fillText("SCRIPT", canvas.width / 2, canvas.height / 2 + logoSize * 0.6);

                    // Scanline overlay on logo
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    for (let i = canvas.height / 2 - logoSize; i < canvas.height / 2 + logoSize * 2; i += 4) {
                        ctx.fillRect(canvas.width / 2 - logoSize * 3, i, logoSize * 6, 1);
                    }

                    ctx.restore();
                }
                // --- END LOGO ---

                // Subtitle Positioning Logic
                const sub = finalSubtitles.find(s => t >= s.start && t <= s.end);

                if (sub) {
                    ctx.save();
                    ctx.textAlign = 'center';
                    // Font size relative to canvas width
                    const fSize = Math.floor(canvas.width * 0.06);
                    // Use theme font title, strip quotes if needed or just use as is
                    ctx.font = `italic bold ${fSize}px ${currentTheme.fonts.title.replace(/"/g, '')}`;

                    // Position at 80% height for vertical, 90% for landscape
                    const textY = format.height > format.width ? canvas.height * 0.8 : canvas.height * 0.9;
                    ctx.translate(canvas.width / 2, textY);

                    if (sub.emotion === 'anger') {
                        ctx.translate(Math.random() * 8 - 4, Math.random() * 8 - 4);
                        ctx.fillStyle = '#ff2626'; // Always Red for Anger
                        ctx.shadowColor = 'rgba(255,0,0,0.8)';
                        ctx.shadowBlur = 30;
                    } else if (sub.emotion === 'hype') {
                        ctx.scale(1.1, 1.1);
                        ctx.fillStyle = currentTheme.colors.primary; // Dynamic Hype Color
                        ctx.shadowColor = `${currentTheme.colors.primary}cc`; // Hex + Alpha
                        ctx.shadowBlur = 30;
                    } else {
                        ctx.fillStyle = 'white';
                        ctx.shadowColor = 'rgba(0,0,0,0.8)';
                        ctx.shadowBlur = 10;
                    }

                    // Stroke for readability
                    ctx.lineWidth = fSize * 0.1;
                    ctx.strokeStyle = 'black';

                    // Text Wrapping Logic
                    const maxWidth = canvas.width * 0.8;
                    const words = sub.text.toUpperCase().split(' ');
                    let line = '';
                    const lines = [];

                    for (let n = 0; n < words.length; n++) {
                        const testLine = line + words[n] + ' ';
                        const metrics = ctx.measureText(testLine);
                        const testWidth = metrics.width;
                        if (testWidth > maxWidth && n > 0) {
                            lines.push(line);
                            line = words[n] + ' ';
                        } else {
                            line = testLine;
                        }
                    }
                    lines.push(line);

                    // Draw lines stacked upwards
                    lines.forEach((l, i) => {
                        // If multiple lines, move them up so the block ends at textY
                        const totalHeight = lines.length * (fSize * 1.2);
                        const yOffset = (i * fSize * 1.2) - (totalHeight / 2); // Center block
                        ctx.strokeText(l, 0, yOffset);
                        ctx.fillText(l, 0, yOffset);
                    });

                    ctx.restore();
                }

                setRenderProgress(Math.floor((offlineVideo.currentTime / offlineVideo.duration) * 100));
                requestAnimationFrame(draw);
            };
            draw();

        } catch (err) {
            console.error("Export failed", err);
            setIsExporting(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-row bg-brand-dark overflow-hidden relative">

            {/* LEFT: Video Preview Area */}
            <div className={`flex-1 flex flex-col relative transition-all duration-300 ${isEditing ? 'w-2/3' : 'w-full'}`}>
                <div className="absolute top-0 inset-x-0 z-30 p-6 pointer-events-none flex justify-center">
                    <h1 className="text-4xl font-arcade text-[var(--color-primary)] drop-shadow-[0_4px_0_rgba(0,0,0,1)] animate-bounce uppercase transition-colors"
                        style={{ fontFamily: currentTheme.fonts.title }}>
                        Victory!
                    </h1>
                </div>

                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/60 relative z-20">
                    <h2 className="font-arcade text-[var(--color-primary)] text-[10px] md:text-sm uppercase tracking-tighter" style={{ fontFamily: currentTheme.fonts.title }}>
                        REPLAY_DATA_SYNC_V1.5
                    </h2>
                    <button onClick={onHome} className="p-2 glass hover:bg-[var(--color-primary)] hover:text-black transition-all text-white">
                        <Home className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 relative bg-black flex items-center justify-center p-4">
                    <div
                        className="relative w-full h-full max-w-md md:max-w-2xl aspect-video border-4 border-white/10 shadow-2xl overflow-hidden ring-4 ring-[var(--color-primary)]/20 flex items-center justify-center transition-all"
                        style={{ borderColor: `${currentTheme.colors.primary}40` }}
                    >
                        {videoUrl && (
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                autoPlay
                                loop
                                onTimeUpdate={handleTimeUpdate}
                                className="w-full h-full object-cover"
                                onClick={togglePlay}
                            />
                        )}

                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                                <Play className="w-20 h-20 text-white fill-current opacity-50" />
                            </div>
                        )}

                        <SubtitleRenderer subtitles={getSyncedSubtitles()} currentTime={currentTime} />
                        <ArcadeLogoOverlay currentTime={currentTime} duration={videoRef.current?.duration || 10} />

                        <div className="absolute top-4 left-4 font-arcade text-[8px] md:text-[10px] text-white/40">KOF_01_REPLAY</div>
                        <div className="absolute bottom-4 right-4 font-arcade text-[8px] md:text-[10px] text-[var(--color-accent)] animate-pulse">RECORDING_SYNC</div>
                    </div>
                </div>

                <div className="bg-zinc-950 border-t border-white/10 flex flex-col items-center pb-8 min-h-[160px]">
                    <div className="w-full h-2 bg-white/5 relative">
                        <div className="h-full bg-[var(--color-primary)] transition-all duration-100"
                            style={{ width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%` }} />
                    </div>

                    <div className="p-6 w-full flex flex-wrap justify-center gap-4 relative">
                        <button onClick={onRetry} className="flex items-center gap-2 px-6 py-3 glass border-white/10 text-white hover:bg-white/10 transition-all font-title uppercase text-sm">
                            <RotateCcw className="w-4 h-4" /> Retry
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                disabled={isExporting}
                                className="flex items-center gap-2 px-8 py-3 bg-[var(--color-primary)] text-black font-title uppercase text-sm hover:scale-105 transition-transform shadow-[0_0_20px_var(--color-primary-alpha)]"
                                style={{ boxShadow: `0 0 20px ${currentTheme.colors.primary}60` }}
                            >
                                {!isExporting && <Smartphone className="w-4 h-4" />}
                                {isExporting ? `Rendering ${renderProgress}%` : "Export Video"}
                            </button>

                            {showExportMenu && !isExporting && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-zinc-900 border border-white/20 shadow-xl rounded-lg overflow-hidden animate-in slide-in-from-bottom-2 fade-in z-50">
                                    <div className="p-2 bg-zinc-950/50 text-[10px] font-mono text-center text-slate-400 uppercase tracking-widest border-b border-white/10">Select Format</div>
                                    {EXPORT_FORMATS.map(fmt => (
                                        <button
                                            key={fmt.id}
                                            onClick={() => handleExport(fmt)}
                                            className="w-full text-left px-4 py-3 hover:bg-[var(--color-primary)] hover:text-black text-white transition-colors flex flex-col gap-0.5"
                                        >
                                            <span className="font-title text-sm uppercase">{fmt.name}</span>
                                            <span className="text-[10px] opacity-60 font-mono">{fmt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isExporting && (
                    <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center space-y-6 animate-fadeIn">
                        <Loader2 className="w-16 h-16 text-[var(--color-primary)] animate-spin" />
                        <h3 className="font-arcade text-2xl text-white">RENDERING {renderProgress}%</h3>
                        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--color-primary)] transition-all duration-100" style={{ width: `${renderProgress}%` }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: Subtitle Editor Panel */}
            {isEditing && (
                <div className="w-96 bg-[#111] border-l border-white/10 flex flex-col shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300 z-40">
                    <div className="p-4 border-b border-white/10 bg-black/40">
                        <h3 className="font-arcade text-white text-sm mb-4">SYNC & EDIT</h3>

                        {/* Global Sync Slider */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs font-mono text-slate-400">
                                <span>AUDIO DELAY</span>
                                <span className={syncOffset !== 0 ? "text-[var(--color-primary)]" : ""}>{syncOffset > 0 ? '+' : ''}{syncOffset}ms</span>
                            </div>
                            <input
                                type="range"
                                min="-2000"
                                max="2000"
                                step="100"
                                value={syncOffset}
                                onChange={(e) => setSyncOffset(Number(e.target.value))}
                                className="w-full accent-[var(--color-primary)] h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {editableSubtitles.map((sub, idx) => (
                            <div key={idx} className={`p-3 rounded bg-zinc-900 border ${currentTime >= sub.start + (syncOffset / 1000) && currentTime <= sub.end + (syncOffset / 1000) ? 'border-[var(--color-primary)]' : 'border-white/5'} hover:border-white/20 transition-colors`}>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        value={sub.text}
                                        onChange={(e) => {
                                            const newSubs = [...editableSubtitles];
                                            newSubs[idx].text = e.target.value;
                                            setEditableSubtitles(newSubs);
                                        }}
                                        className="bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white w-full font-mono focus:border-[var(--color-primary)] outline-none"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-1">
                                        {['neutral', 'hype', 'anger'].map(emo => (
                                            <button
                                                key={emo}
                                                onClick={() => {
                                                    const newSubs = [...editableSubtitles];
                                                    newSubs[idx].emotion = emo as any;
                                                    setEditableSubtitles(newSubs);
                                                }}
                                                className={`w-2 h-2 rounded-full ${sub.emotion === emo ? (emo === 'anger' ? 'bg-red-500 box-shadow-glow' : emo === 'hype' ? 'bg-orange-500' : 'bg-white') : 'bg-slate-700'}`}
                                                title={emo}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {(sub.start + (syncOffset / 1000)).toFixed(1)}s
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
