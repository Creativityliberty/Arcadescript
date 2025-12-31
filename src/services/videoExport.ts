import { SubtitleSegment } from "../types";

export async function exportVideoWithSubtitles(
    videoBlob: Blob,
    subtitles: SubtitleSegment[]
): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoBlob);
        video.muted = true;

        await new Promise((res) => {
            video.onloadedmetadata = res;
        });

        const canvas = document.createElement('canvas');
        // Social Media Format: 9:16 (Vertical)
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Could not get canvas context");

        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 5000000 // 5Mbps for high quality
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const finalBlob = new Blob(chunks, { type: 'video/webm' });
            resolve(finalBlob);
        };

        video.play();
        mediaRecorder.start();

        const draw = () => {
            if (video.ended) {
                mediaRecorder.stop();
                return;
            }

            // Draw Background (Black)
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Video (Center Crop for vertical)
            const videoAspect = video.videoWidth / video.videoHeight;
            const targetAspect = canvas.width / canvas.height;

            let drawW, drawH, drawX, drawY;

            if (videoAspect > targetAspect) {
                // Video is wider than canvas
                drawH = canvas.height;
                drawW = drawH * videoAspect;
                drawX = (canvas.width - drawW) / 2;
                drawY = 0;
            } else {
                // Video is taller than canvas
                drawW = canvas.width;
                drawH = drawW / videoAspect;
                drawX = 0;
                drawY = (canvas.height - drawH) / 2;
            }

            ctx.drawImage(video, drawX, drawY, drawW, drawH);

            // Draw Subtitles
            const currentTime = video.currentTime;
            const sub = subtitles.find(s => currentTime >= s.start && currentTime <= s.end);

            if (sub) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Font styling based on emotion
                let fontSize = 80;
                let color = 'white';
                let strokeColor = 'black';
                let offsetY = 0;

                if (sub.emotion === 'anger') {
                    fontSize = 110;
                    color = '#ff2d2d';
                    // Shake effect
                    ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
                } else if (sub.emotion === 'hype') {
                    fontSize = 100;
                    color = '#ff8c00';
                    // Bounce
                    offsetY = -Math.abs(Math.sin(currentTime * 10)) * 20;
                }

                ctx.font = `bold ${fontSize}px "Russo One", sans-serif`;

                // Background box for readability
                const textMetrics = ctx.measureText(sub.text);
                const padding = 40;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(
                    canvas.width / 2 - textMetrics.width / 2 - padding,
                    canvas.height * 0.8 - fontSize / 2 - padding + offsetY,
                    textMetrics.width + padding * 2,
                    fontSize + padding * 2
                );

                // Text
                ctx.fillStyle = color;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 4;
                ctx.strokeText(sub.text.toUpperCase(), canvas.width / 2, canvas.height * 0.8 + offsetY);
                ctx.fillText(sub.text.toUpperCase(), canvas.width / 2, canvas.height * 0.8 + offsetY);

                ctx.restore();
            }

            // Add "ArcadeScript" Watermark
            ctx.fillStyle = 'rgba(255, 140, 0, 0.5)';
            ctx.font = '24px "Press Start 2P", cursive';
            ctx.fillText("ARCADESCRIPT_AI_V1.5", canvas.width / 2, 100);

            requestAnimationFrame(draw);
        };

        draw();
    });
}
