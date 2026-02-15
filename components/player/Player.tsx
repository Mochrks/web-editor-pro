'use client';

import { useStore } from '@/store/useStore';
import { useRef, useEffect } from 'react';
import { getVideoElement } from '@/lib/videoPool';

export function Player() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        let id: number;
        const loop = () => {
            const now = Date.now();
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
        lastTimeRef.current = Date.now();
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, []);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Sync Canvas Size
        if (containerRef.current) {
            const { clientWidth: w, clientHeight: h } = containerRef.current;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
        }

        const state = useStore.getState();
        const { project, currentTime, isPlaying } = state;

        // Background
        ctx.fillStyle = '#050a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!project) return;

        // Composite Setup
        const scaleFit = Math.min(canvas.width / project.width, canvas.height / project.height) * 0.95;
        const offsetX = (canvas.width - project.width * scaleFit) / 2;
        const offsetY = (canvas.height - project.height * scaleFit) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scaleFit, scaleFit);

        // Project Canvas BG
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, project.width, project.height);

        // Clipping
        ctx.beginPath();
        ctx.rect(0, 0, project.width, project.height);
        ctx.clip();

        // Render Tracks (Bottom to Top)
        project.tracks.forEach(track => {
            if (track.visible === false || track.muted) return;
            if (track.type !== 'video' && track.type !== 'image') return;

            const clip = track.clips.find(c => currentTime >= c.start && currentTime < c.start + c.duration);
            if (clip) {
                ctx.save();

                const { position, scale, rotation, opacity } = clip.properties;
                ctx.translate(project.width / 2 + position.x, project.height / 2 + position.y);
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

                        // Sync Playback and Seek
                        if (isPlaying) {
                            if (video.paused && video.readyState >= 2) video.play().catch(() => { });
                            if (Math.abs(video.currentTime - localTime) > 0.2) {
                                video.currentTime = localTime;
                            }
                        } else {
                            if (!video.paused) video.pause();
                            if (Math.abs(video.currentTime - localTime) > 0.05) {
                                video.currentTime = localTime;
                            }
                        }

                        if (video.readyState >= 2) {
                            ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2, video.videoWidth, video.videoHeight);
                        }
                    }
                } else if (clip.type === 'image') {
                    // Logic for actual images would go here, using a similar pool or preloading
                    ctx.fillStyle = '#f59e0b20';
                    ctx.fillRect(-200, -112, 400, 225);
                    ctx.fillStyle = '#f59e0b';
                    ctx.font = '20px font-sans';
                    ctx.textAlign = 'center';
                    ctx.fillText(`[IMAGE: ${clip.name}]`, 0, 0);
                }

                ctx.restore();
            }
        });

        ctx.restore();
    };

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative shadow-inner select-none">
            <canvas ref={canvasRef} className="block pointer-events-none" />
        </div>
    );
}
