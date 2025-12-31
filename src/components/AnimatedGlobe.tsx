"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export const AnimatedGlobe: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let rotation = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        const drawGlobe = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.35;

            ctx.strokeStyle = "rgba(255, 140, 0, 0.4)";
            ctx.lineWidth = 1;

            // Draw Grid Lines (Latitudes)
            for (let i = -90; i <= 90; i += 15) {
                const r = radius * Math.cos((i * Math.PI) / 180);
                const y = centerY + radius * Math.sin((i * Math.PI) / 180);

                ctx.beginPath();
                ctx.ellipse(centerX, y, r, r * 0.2, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Draw Grid Lines (Longitudes)
            for (let i = 0; i < 360; i += 20) {
                const currentRotation = (i + rotation) % 360;
                const rad = (currentRotation * Math.PI) / 180;

                ctx.beginPath();
                const cp1x = centerX + radius * Math.sin(rad);
                const cp2x = centerX + radius * Math.sin(rad);

                // Simulating 3D curvature with quadratic curves
                ctx.moveTo(centerX, centerY - radius);
                ctx.quadraticCurveTo(cp1x * 1.5 - centerX * 0.5, centerY, centerX, centerY + radius);
                ctx.stroke();
            }

            // Outer Glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = "rgba(255, 140, 0, 0.5)";
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            rotation += 0.2;
            animationFrameId = requestAnimationFrame(drawGlobe);
        };

        drawGlobe();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] bg-black overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,140,0,0.05)_0%,transparent_70%)]" />
            <canvas
                ref={canvasRef}
                className="w-full h-full opacity-40 mix-blend-screen"
            />

            {/* Dynamic Text Ring (Inspiration from image) */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-12 right-12 w-64 h-64 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full fill-brand-orange/50 uppercase font-arcade text-[6px]">
                    <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
                    <text>
                        <textPath href="#circlePath">
                            WATCH THE WORLD SHOP LIVE • WATCH THE WORLD SHOP LIVE •
                        </textPath>
                    </text>
                </svg>
            </motion.div>
        </div>
    );
};
