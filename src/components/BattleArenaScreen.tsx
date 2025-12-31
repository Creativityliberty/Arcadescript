"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, Square, Zap, Loader2, Upload, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { Emotion, SubtitleSegment, StyleConfig, FighterTheme } from '@/types';
import { generateSubtitlesFromAudio } from '@/services/gemini';
import { StyleSelector } from './StyleSelector';
import { ScriptCoach } from './ScriptCoach';
// import { SelfieSegmentation } from '@mediapipe/selfie_segmentation'; // Removing broken import
import { useStyle } from '@/context/StyleContext';

// Define global type for the script loaded instance
declare global {
    interface Window {
        SelfieSegmentation: any;
    }
}

export const BattleArenaScreen: React.FC<{
    onComplete: (blob: Blob, subs: SubtitleSegment[]) => void;
    onBack: () => void;
}> = ({ onComplete, onBack }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCoach, setShowCoach] = useState(false);
    const [bgSwap, setBgSwap] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audioVolume, setAudioVolume] = useState(0);
    const [simulatedEmotion, setSimulatedEmotion] = useState<Emotion>('neutral');
    const [timer, setTimer] = useState(0);
    const { currentTheme } = useStyle();

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const segmentationRef = useRef<any>(null);

    useEffect(() => {
        // Dynamic load of MediaPipe script
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
        script.async = true;
        script.onload = () => {
            if (window.SelfieSegmentation) {
                const selfieSegmentation = new window.SelfieSegmentation({
                    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
                });
                selfieSegmentation.setOptions({
                    modelSelection: 1,
                });
                selfieSegmentation.onResults(onResults);
                segmentationRef.current = selfieSegmentation;
            }
        };
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, []);

    const onResults = (results: any) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Background (Theme based Gradient)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, currentTheme.colors.background);
        gradient.addColorStop(1, currentTheme.colors.secondary);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Optional: Draw some "Stage" elements (Particles)
        // For simplicity, just static for now, or random noise

        // 2. Draw User on top using mask
        // Draw video first? No, we need to mask it.
        // Canvas compositing magic:

        // Step A: Draw the mask
        ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

        // Step B: Source In (Keep only where mask is)
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        // Step C: Destination Over (Draw BG behind the existing user content)
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.restore();
    };

    // Loop to send frames to MediaPipe
    useEffect(() => {
        let active = true;
        const process = async () => {
            if (active && bgSwap && videoRef.current && segmentationRef.current && videoRef.current.readyState >= 2) {
                await segmentationRef.current.send({ image: videoRef.current });
            }
            if (active && bgSwap) requestAnimationFrame(process);
        };
        if (bgSwap) process();
        return () => { active = false; };
    }, [bgSwap]);

    useEffect(() => {
        async function setupMedia() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                if (videoRef.current) videoRef.current.srcObject = mediaStream;

                // Sync canvas size
                if (canvasRef.current && videoRef.current) {
                    canvasRef.current.width = 640; // Standard resolution
                    canvasRef.current.height = 480;
                }

                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                analyserRef.current = analyser;

                const source = audioContext.createMediaStreamSource(mediaStream);
                source.connect(analyser);

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const updateVolume = () => {
                    analyser.getByteFrequencyData(dataArray);
                    const sum = dataArray.reduce((a, b) => a + b, 0);
                    const average = sum / dataArray.length;
                    const normalized = Math.min(1, average / 80);
                    setAudioVolume(normalized);

                    if (normalized > 0.6) setSimulatedEmotion('anger');
                    else if (normalized > 0.3) setSimulatedEmotion('hype');
                    else setSimulatedEmotion('neutral');

                    animationFrameRef.current = requestAnimationFrame(updateVolume);
                };
                updateVolume();
            } catch (err) {
                console.error("Media setup failed", err);
            }
        }
        setupMedia();
        return () => {
            stream?.getTracks().forEach(t => t.stop());
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    const startRecording = () => {
        // Decide whether to record stream directly or canvas stream
        const sourceStream = (bgSwap && canvasRef.current) ? canvasRef.current.captureStream(30) : stream;

        if (!sourceStream) return;

        // If recording canvas, we need to add audio track back!
        if (bgSwap && stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack && sourceStream.getAudioTracks().length === 0) {
                sourceStream.addTrack(audioTrack);
            }
        }

        let mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
        }

        const recorder = new MediaRecorder(sourceStream, { mimeType });
        mediaRecorderRef.current = recorder;
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            setIsProcessing(true);
            try {
                const subs = await generateSubtitlesFromAudio(blob);
                if (subs.length === 0) {
                    alert("No speech detected. The Arena demands your voice!");
                }
                onComplete(blob, subs);
            } catch (err) {
                console.error("Processing failed", err);
            } finally {
                setIsProcessing(false);
            }
        };
        recorder.start();
        setIsRecording(true);
        setTimer(0);
        timerIntervalRef.current = setInterval(() => setTimer(p => p + 1), 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setIsRecording(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-black z-50 absolute inset-0">
                <div className="w-64 h-8 border-4 border-slate-700 p-1 mb-4 relative overflow-hidden">
                    <div className="h-full bg-brand-orange animate-[width_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                </div>
                <h2 className="text-2xl font-arcade text-brand-orange animate-pulse text-center uppercase">
                    ANALYZING SPEECH...
                </h2>
                <p className="text-slate-500 font-mono mt-2 uppercase text-xs">Gemini AI is studying your moves</p>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full flex flex-col bg-slate-900 overflow-hidden">

            {/* Coach Modal */}
            <AnimatePresence>
                {showCoach && <ScriptCoach onClose={() => setShowCoach(false)} />}
            </AnimatePresence>

            <div className="absolute top-4 left-4 z-30">
                <button onClick={onBack} className="text-white hover:text-brand-orange transition-colors bg-black/50 p-2 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Header HUD */}
            <div className="absolute top-4 inset-x-0 flex justify-center z-20 pointer-events-none">
                <div className="bg-black/70 border-2 border-white/20 px-8 py-2 transform skew-x-[-12deg]">
                    <span className="font-arcade text-xl text-white drop-shadow-[0_0_5px_#fff]">
                        {isRecording ? "RECORDING" : "ROUND 1"}
                    </span>
                </div>
            </div>

            {/* Timer */}
            {isRecording && (
                <div className="absolute top-20 inset-x-0 flex justify-center z-20 pointer-events-none">
                    <span className="font-mono text-brand-red text-3xl font-bold">{formatTime(timer)}</span>
                </div>
            )}

            {/* Main Viewport */}
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`
            h-full w-full object-cover max-w-md md:max-w-2xl border-x-4 
            transition-all duration-75 border-brand-orange/30 shadow-[0_0_50px_rgba(255,140,0,0.2)]
            ${isRecording ? 'border-brand-red shadow-[inset_0_0_30px_#f00] animate-pulse' : ''}
            ${bgSwap ? 'opacity-0 absolute' : 'opacity-100'}
          `}
                    style={{ transform: `scale(${1 + audioVolume * 0.05})` }}
                />

                <canvas
                    ref={canvasRef}
                    className={`
                    h-full w-full object-cover max-w-md md:max-w-2xl border-x-4 
                    transition-all duration-75 border-brand-orange/30 shadow-[0_0_50px_rgba(255,140,0,0.2)]
                    ${isRecording ? 'border-brand-red shadow-[inset_0_0_30px_#f00] animate-pulse' : ''}
                    ${bgSwap ? 'opacity-100' : 'opacity-0 absolute'}
                    `}
                    style={{ transform: `scale(${1 + audioVolume * 0.05})` }}
                />

                {/* Dynamic Vibe Indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                        className={`
                transition-all duration-100 ease-out font-title text-center
                ${simulatedEmotion === 'anger' ? 'animate-[shake_0.1s_infinite] text-brand-red scale-110 drop-shadow-[0_0_10px_#f00]' :
                                simulatedEmotion === 'hype' ? 'animate-bounce text-brand-orange scale-105' : 'text-white opacity-40'}
            `}
                        style={{ fontSize: `${4 + audioVolume * 4}rem` }}
                    >
                        {audioVolume < 0.1 ? "READY?" : simulatedEmotion === 'anger' ? "LOUD!!" : simulatedEmotion === 'hype' ? "HYPE!" : "SPEAK"}
                    </div>
                </div>

                {/* Power Level Bar (Real Viz) */}
                <div className="absolute right-4 top-1/4 bottom-1/4 w-4 bg-slate-800 border border-slate-600 rounded-full overflow-hidden flex flex-col justify-end z-20">
                    <div
                        className={`w-full transition-all duration-75 ${simulatedEmotion === 'anger' ? 'bg-brand-red' : simulatedEmotion === 'hype' ? 'bg-brand-orange' : 'bg-blue-500'}`}
                        style={{ height: `${Math.min(100, audioVolume * 100 * 1.5)}%` }}
                    ></div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-950 border-t-2 border-white/10 flex flex-col items-center justify-center relative z-20 pb-8 pt-4">
                <div className="mb-6 w-full max-w-md">
                    <StyleSelector />
                </div>

                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setShowCoach(true)}
                        className="p-4 rounded-full bg-slate-800 border border-slate-600 hover:border-white hover:bg-slate-700 transition-all group"
                        title="AI Script Coach"
                    >
                        <MessageSquare className="w-6 h-6 text-slate-400 group-hover:text-white" />
                    </button>

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${isRecording ? 'bg-brand-red border-white animate-pulse' : 'bg-slate-800 border-slate-600 hover:border-white'
                            }`}
                    >
                        {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className={`w-8 h-8 ${audioVolume > 0.1 ? 'text-white' : 'text-slate-500'}`} />}
                    </button>

                    <button
                        onClick={() => setBgSwap(!bgSwap)}
                        className={`p-4 rounded-full border border-slate-600 transition-all group ${bgSwap ? 'bg-white text-black' : 'bg-slate-800 hover:bg-slate-700'}`}
                        title="Toggle KOF Stage"
                    >
                        <ImageIcon className={`w-6 h-6 ${bgSwap ? 'text-black' : 'text-slate-400 group-hover:text-white'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};
