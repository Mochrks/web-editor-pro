'use client';

import { useStore } from '@/store/useStore';
import { useRef, useEffect } from 'react';
import { getVideoElement } from '@/lib/videoPool';

export function Player() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastTimeRef = useRef<number>(0);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = useStore.getState();
        const { project, currentTime, isPlaying, aspectRatio, programZoom } = state;

        // Determine project dimensions based on aspect ratio
        let pW = 1920, pH = 1080;
        if (aspectRatio === '9:16') { pW = 1080; pH = 1920; }
        else if (aspectRatio === '1:1') { pW = 1080; pH = 1080; }

        if (containerRef.current) {
            const { clientWidth: w, clientHeight: h } = containerRef.current;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
        }

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!project) return;

        const scaleFit = Math.min(canvas.width / pW, canvas.height / pH) * programZoom;
        const offsetX = (canvas.width - pW * scaleFit) / 2;
        const offsetY = (canvas.height - pH * scaleFit) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scaleFit, scaleFit);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, pW, pH);

        ctx.beginPath();
        ctx.rect(0, 0, pW, pH);
        ctx.clip();

        // Render Tracks (Bottom to Top)
        project.tracks.forEach(track => {
            if (track.visible === false || track.muted) return;
            if (track.type !== 'video' && track.type !== 'image' && track.type !== 'text') return;

            const clip = track.clips.find(c => currentTime >= c.start && currentTime < c.start + c.duration);
            if (clip) {
                ctx.save();

                const { position, scale, rotation, opacity } = clip.properties;
                ctx.translate(pW / 2 + position.x, pH / 2 + position.y);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.scale(scale, scale);
                ctx.globalAlpha = opacity;

                if (clip.effects && clip.effects.length > 0) {
                    ctx.filter = clip.effects.map(e => {
                        if (e.type === 'blur') return `blur(${e.value * 20}px)`;
                        if (e.type === 'grayscale') return `grayscale(${e.value * 100}%)`;
                        if (e.type === 'brightness') return `brightness(${1 + (e.value - 0.5) * 2})`;
                        if (e.type === 'contrast') return `contrast(${1 + (e.value - 0.5) * 2})`;
                        if (e.type === 'sepia') return `sepia(${e.value * 100}%)`;
                        return '';
                    }).join(' ');
                }

                if (clip.type === 'video') {
                    const video = getVideoElement(clip.assetId);
                    if (video) {
                        const localTime = (currentTime - clip.start + clip.offset) / 1000;

                        if (isPlaying) {
                            if (video.paused && video.readyState >= 2) {
                                video.play().catch(err => {
                                    if (err.name !== 'AbortError') console.warn('Video play interrupted', err);
                                });
                            }
                            if (Math.abs(video.currentTime - localTime) > 0.3) {
                                video.currentTime = localTime;
                            }
                        } else {
                            if (!video.paused) video.pause();
                            if (Math.abs(video.currentTime - localTime) > 0.1) {
                                video.currentTime = localTime;
                            }
                        }

                        if (video.readyState >= 2) {
                            ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2, video.videoWidth, video.videoHeight);
                        }
                    }
                } else if (clip.type === 'image') {
                    ctx.fillStyle = '#f59e0b20';
                    ctx.fillRect(-200, -112, 400, 225);
                    ctx.fillStyle = '#f59e0b';
                    ctx.font = '20px font-sans';
                    ctx.textAlign = 'center';
                    ctx.fillText(`[IMAGE: ${clip.name}]`, 0, 0);
                } else if (clip.type === 'text') {
                    const style = clip.textStyle || { fontSize: 40, color: '#white', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center' };

                    ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
                    ctx.textAlign = (style.textAlign as CanvasTextAlign) || 'center';
                    ctx.textBaseline = 'middle';

                    if (style.background) {
                        const metrics = ctx.measureText(clip.text || '');
                        const bgW = metrics.width + 20;
                        const bgH = style.fontSize + 10;
                        ctx.fillStyle = style.background;

                        if (ctx.roundRect) {
                            ctx.beginPath();
                            ctx.roundRect(-bgW / 2, -bgH / 2, bgW, bgH, 10);
                            ctx.fill();
                        } else {
                            ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH);
                        }
                    }

                    ctx.fillStyle = style.color;
                    ctx.fillText(clip.text || '', 0, 0);
                }

                ctx.restore();
            }
        });

        // Render Grid Overlay
        if (state.showGrid) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;

            // Vertical lines
            for (let x = pW / 3; x < pW; x += pW / 3) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, pH);
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = pH / 3; y < pH; y += pH / 3) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(pW, y);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }

        ctx.restore();
    };

    useEffect(() => {
        let id: number;
        const loop = () => {
            const now = Date.now();
            if (lastTimeRef.current === 0) lastTimeRef.current = now;
            const delta = now - lastTimeRef.current;
            lastTimeRef.current = now;

            const state = useStore.getState();
            if (state.isPlaying) {
                const nextTime = state.currentTime + delta;
                if (state.project && nextTime >= state.project.duration) {
                    state.setIsPlaying(false);
                    state.setTime(state.project.duration);
                } else {
                    state.setTime(nextTime);
                }
            }

            draw();
            id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative shadow-inner select-none">
            <canvas ref={canvasRef} className="block pointer-events-none" />
        </div>
    );
}
