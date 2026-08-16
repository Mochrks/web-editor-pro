/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useStore } from '@/store/useStore';
import { useRef, useEffect, useState } from 'react';
import { Clip } from '@/types/store';

export function Player() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastTimeRef = useRef<number>(0);

    const [activeVideoClip, setActiveVideoClip] = useState<{clip: Clip, muted: boolean} | null>(null);
    const [activeAudioClips, setActiveAudioClips] = useState<{clip: Clip, muted: boolean}[]>([]);
    const [containerSize, setContainerSize] = useState({ w: 1920, h: 1080 });
    const audioRefs = useRef<{ [id: string]: HTMLAudioElement }>({});

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
            
            // Sync active clip
            const { project, currentTime } = state;
            if (project) {
                // Find active video clip
                let currentActiveVideo: {clip: Clip, muted: boolean} | null = null;
                const currentActiveAudio: {clip: Clip, muted: boolean}[] = [];

                for (let i = 0; i < project.tracks.length; i++) {
                    const track = project.tracks[i];
                    
                    if (track.type === 'video' && track.visible !== false) {
                        const clip = track.clips.find(c => currentTime >= c.start && currentTime < c.start + c.duration);
                        if (clip && !currentActiveVideo) {
                            currentActiveVideo = { clip, muted: track.muted || false };
                        }
                    } else if (track.type === 'audio') {
                        const clip = track.clips.find(c => currentTime >= c.start && currentTime < c.start + c.duration);
                        if (clip) {
                            currentActiveAudio.push({ clip, muted: track.muted || false });
                        }
                    }
                }
                
                setActiveVideoClip(prev => prev?.clip.id === currentActiveVideo?.clip.id && prev?.muted === currentActiveVideo?.muted ? prev : currentActiveVideo);
                
                setActiveAudioClips(prev => {
                    const prevIds = prev.map(p => p.clip.id + p.muted).join(',');
                    const nextIds = currentActiveAudio.map(p => p.clip.id + p.muted).join(',');
                    if (prevIds !== nextIds) return currentActiveAudio;
                    return prev;
                });
            }

            id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Sync video play state and time
    useEffect(() => {
        const video = videoRef.current;
        
        const unsubscribe = useStore.subscribe((state) => {
            if (video && activeVideoClip) {
                const localTime = (state.currentTime - activeVideoClip.clip.start + activeVideoClip.clip.offset) / 1000;
                if (state.isPlaying) {
                    if (video.paused && video.readyState >= 2) video.play().catch(() => {});
                    if (Math.abs(video.currentTime - localTime) > 0.3) video.currentTime = localTime;
                } else {
                    if (!video.paused) video.pause();
                    if (Math.abs(video.currentTime - localTime) > 0.05) video.currentTime = localTime;
                }
            }

            // Sync audio clips
            activeAudioClips.forEach(({clip}) => {
                const audio = audioRefs.current[clip.id];
                if (audio) {
                    const localTime = (state.currentTime - clip.start + clip.offset) / 1000;
                    if (state.isPlaying) {
                        if (audio.paused && audio.readyState >= 2) audio.play().catch(() => {});
                        if (Math.abs(audio.currentTime - localTime) > 0.3) audio.currentTime = localTime;
                    } else {
                        if (!audio.paused) audio.pause();
                        if (Math.abs(audio.currentTime - localTime) > 0.05) audio.currentTime = localTime;
                    }
                }
            });
        });
        return unsubscribe;
    }, [activeVideoClip, activeAudioClips]);

    const state = useStore();
    const { project, currentTime, aspectRatio, programZoom, showGrid } = state;

    let pW = 1920, pH = 1080;
    if (aspectRatio === '9:16') { pW = 1080; pH = 1920; }
    else if (aspectRatio === '1:1') { pW = 1080; pH = 1080; }

    const containerW = containerSize.w || pW;
    const containerH = containerSize.h || pH;
    
    const scaleFit = Math.min(containerW / pW, containerH / pH) * programZoom;

    // Active overlays
    const overlays = [];
    if (project) {
        for (let i = 0; i < project.tracks.length; i++) {
            const track = project.tracks[i];
            if (track.visible === false) continue;
            if (track.type === 'text' || track.type === 'image') {
                const clip = track.clips.find(c => currentTime >= c.start && currentTime < c.start + c.duration);
                if (clip) overlays.push(clip);
            }
        }
    }

    const activeAsset = activeVideoClip ? state.assets.find(a => a.id === activeVideoClip.clip.assetId) : null;

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative shadow-inner select-none">
            {/* Audio players */}
            {activeAudioClips.map(({clip, muted}) => {
                const asset = state.assets.find(a => a.id === clip.assetId);
                if (!asset) return null;
                return (
                    <audio
                        key={clip.id}
                        ref={(el) => { if (el) audioRefs.current[clip.id] = el; }}
                        src={asset.src}
                        muted={muted}
                    />
                )
            })}
            
            <div 
                className="relative bg-black overflow-hidden" 
                style={{ 
                    width: pW, 
                    height: pH, 
                    transform: `scale(${scaleFit})`,
                    transformOrigin: 'center'
                }}
            >
                {activeAsset && (
                    <video 
                        ref={videoRef}
                        src={activeAsset.src}
                        className="absolute w-full h-full object-cover"
                        style={{
                            transform: `translate(${activeVideoClip?.clip.properties.position.x}px, ${activeVideoClip?.clip.properties.position.y}px) scale(${activeVideoClip?.clip.properties.scale}) rotate(${activeVideoClip?.clip.properties.rotation}deg)`,
                            opacity: activeVideoClip?.clip.properties.opacity ?? 1,
                            filter: activeVideoClip?.clip.effects?.map(e => {
                                if (e.type === 'blur') return `blur(${e.value * 20}px)`;
                                if (e.type === 'grayscale') return `grayscale(${e.value * 100}%)`;
                                if (e.type === 'brightness') return `brightness(${1 + (e.value - 0.5) * 2})`;
                                if (e.type === 'contrast') return `contrast(${1 + (e.value - 0.5) * 2})`;
                                if (e.type === 'sepia') return `sepia(${e.value * 100}%)`;
                                return '';
                            }).join(' ') || 'none'
                        }}
                        crossOrigin="anonymous" 
                        muted={activeVideoClip?.muted || false}
                        playsInline
                    />
                )}
                
                {overlays.map(clip => {
                    const { position, scale, rotation, opacity } = clip.properties;
                    if (clip.type === 'text') {
                        const style = clip.textStyle || { fontSize: 40, color: 'white', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center' };
                        return (
                            <div 
                                key={clip.id}
                                className="absolute left-1/2 top-1/2"
                                style={{
                                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                                    opacity,
                                    fontSize: style.fontSize,
                                    color: style.color,
                                    fontFamily: style.fontFamily,
                                    fontWeight: style.fontWeight,
                                    textAlign: style.textAlign,
                                    backgroundColor: style.background,
                                    padding: style.background ? '10px 20px' : '0',
                                    borderRadius: style.background ? '10px' : '0'
                                }}
                            >
                                {clip.text}
                            </div>
                        )
                    }
                    if (clip.type === 'image') {
                        const asset = state.assets.find(a => a.id === clip.assetId);
                        if (!asset) return null;
                        return (
                            <img 
                                key={clip.id}
                                src={asset.src}
                                alt="Overlay"
                                className="absolute left-1/2 top-1/2"
                                style={{
                                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                                    opacity,
                                    maxWidth: '100%',
                                    maxHeight: '100%'
                                }}
                            />
                        )
                    }
                    return null;
                })}

                {showGrid && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/20">
                            <div className="border-r border-b border-white/20 border-dashed" />
                            <div className="border-r border-b border-white/20 border-dashed" />
                            <div className="border-b border-white/20 border-dashed" />
                            <div className="border-r border-b border-white/20 border-dashed" />
                            <div className="border-r border-b border-white/20 border-dashed" />
                            <div className="border-b border-white/20 border-dashed" />
                            <div className="border-r border-white/20 border-dashed" />
                            <div className="border-r border-white/20 border-dashed" />
                            <div />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
