'use client';

import { useStore } from '@/store/useStore';
import { Ruler } from './Ruler';
import { TrackHeader } from './TrackHeader';
import { TrackLane } from './TrackLane';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Pause, Play, ChevronRight, SkipBack, SkipForward, Scissors, Eye, Lock, Move, Magnet, Link, Layers } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

function TimecodeDisplay({ currentTime, totalDuration }: { currentTime: number, totalDuration: number }) {
    const formatTimecode = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const f = Math.floor((ms % 1000) / 33.33);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
    };
    return (
        <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium font-mono text-primary bg-primary/10 px-2.5 py-1 rounded border border-primary/20 shadow-sm select-all cursor-text tracking-tighter">
                {formatTimecode(currentTime)}
            </span>
            <span className="text-[10px] font-semibold text-text-muted font-mono tracking-tighter opacity-80">
                / {formatTimecode(totalDuration)}
            </span>
        </div>
    );
}

export function Timeline() {
    const project = useStore(s => s.project);
    const zoom = useStore(s => s.zoom);
    const setZoom = useStore(s => s.setZoom);
    const currentTime = useStore(s => s.currentTime);
    const setTime = useStore(s => s.setTime);
    const isPlaying = useStore(s => s.isPlaying);
    const setIsPlaying = useStore(s => s.setIsPlaying);
    const splitClip = useStore(s => s.splitClip);
    const activeTool = useStore(s => s.activeTool);
    const setActiveTool = useStore(s => s.setActiveTool);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const tracksContainerRef = useRef<HTMLDivElement>(null);

    const [snapping, setSnapping] = useState(true);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const getSnappingPoints = () => {
        if (!project) return [];
        const points = new Set<number>([0, project.duration]);
        project.tracks.forEach(track => {
            track.clips.forEach(clip => {
                points.add(clip.start);
                points.add(clip.start + clip.duration);
            });
        });
        return Array.from(points).sort((a, b) => a - b);
    };

    const findNearestSnapPoint = (time: number) => {
        if (!snapping) return time;
        const snapThreshold = (10 / zoom) * 1000;
        const points = getSnappingPoints();
        const nearest = points.reduce((prev, curr) => Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev, points[0]);
        if (Math.abs(nearest - time) < snapThreshold) return nearest;
        return time;
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

            // Space: Play/Pause
            if (e.code === 'Space') {
                e.preventDefault();
                setIsPlaying(!useStore.getState().isPlaying);
            }

            // Delete / Backspace: Remove selected clip
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                useStore.getState().deleteSelected();
            }

            // V: Selection Tool
            if (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                useStore.getState().setActiveTool('cursor');
            }

            // Ctrl+K or C: Split clip (or switch to blade)
            if ((e.ctrlKey && e.key === 'k') || (e.key === 'c' && !e.ctrlKey && !e.metaKey)) {
                e.preventDefault();
                if (e.key === 'c') {
                    useStore.getState().setActiveTool('blade');
                } else {
                    splitClip();
                }
            }

            // S: Toggle Snapping
            if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setSnapping(prev => !prev);
            }

            // Navigation
            if (e.key === 'Home') {
                e.preventDefault();
                setTime(0);
            }
            if (e.key === 'End') {
                e.preventDefault();
                const proj = useStore.getState().project;
                if (proj) setTime(proj.duration);
            }

            // J, K, L (Standard Editor Keys)
            if (e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsPlaying(!useStore.getState().isPlaying);
            }
            if (e.key.toLowerCase() === 'l') {
                e.preventDefault();
                setIsPlaying(true);
            }
            if (e.key.toLowerCase() === 'j') {
                e.preventDefault();
                // For now just jump back 1s, true reverse play requires more logic
                setTime(Math.max(0, useStore.getState().currentTime - 1000));
            }

            // Arrow keys: Frame by frame (33ms approx 30fps)
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const step = e.shiftKey ? 1000 : 33.33;
                setTime(Math.max(0, useStore.getState().currentTime - step));
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const step = e.shiftKey ? 1000 : 33.33;
                const duration = useStore.getState().project?.duration || 0;
                setTime(Math.min(duration, useStore.getState().currentTime + step));
            }

            // Zoom with + -
            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                const newZoom = Math.min(500, useStore.getState().zoom * 1.2);
                useStore.setState({ zoom: newZoom });
            }
            if (e.key === '-') {
                e.preventDefault();
                const newZoom = Math.max(10, useStore.getState().zoom / 1.2);
                useStore.setState({ zoom: newZoom });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setIsPlaying, setTime, splitClip]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const verifyZoom = (z: number) => Math.max(10, Math.min(500, z));
                if (e.deltaY < 0) setZoom(verifyZoom(useStore.getState().zoom * 1.1));
                else setZoom(verifyZoom(useStore.getState().zoom / 1.1));
            }
        };
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [setZoom]);

    if (!project) return <div className="flex h-full items-center justify-center text-text-muted font-semibold text-xs tracking-wider uppercase">Loading Timeline...</div>;

    const durationSec = Math.max(project.duration, 60000) / 1000;
    const timelineWidth = durationSec * zoom;

    return (
        <div className="flex flex-col h-full bg-background border-t border-border select-none outline-none overflow-hidden">
            {/* Timeline Toolbar */}
            <div className="h-9 border-b border-border flex items-center px-3 justify-between bg-panel z-20 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-primary">Sequence_01</span>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-workspace rounded-md border border-border">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-6 w-6 rounded transition-all", snapping ? "text-primary bg-primary/10" : "text-text-muted hover:text-text-primary hover:bg-hover")}
                            onClick={() => setSnapping(!snapping)}
                            title="Snap (S)"
                        >
                            <Magnet className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-text-muted hover:text-text-primary hover:bg-hover" title="Link Clips">
                            <Link className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-text-muted hover:text-text-primary hover:bg-hover" onClick={() => splitClip()} title="Split (Ctrl+K)">
                            <Scissors className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <TimecodeDisplay currentTime={currentTime} totalDuration={project.duration} />

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-text-muted hover:text-text-primary hover:bg-hover" onClick={() => setTime(0)}>
                            <SkipBack className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-primary text-white hover:bg-primary-active rounded-full shadow-sm" onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-text-muted hover:text-text-primary hover:bg-hover" onClick={() => setTime(project.duration)}>
                            <SkipForward className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    <div className="h-4 w-px bg-border" />

                    <div className="flex items-center gap-2">
                        <ZoomOut
                            className="w-3 h-3 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                            onClick={() => setZoom(Math.max(10, zoom / 1.2))}
                        />
                        <div className="w-24 h-1.5 bg-workspace rounded-full overflow-hidden relative border border-border">
                            <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (zoom / 500) * 100)}%` }} />
                        </div>
                        <ZoomIn
                            className="w-3 h-3 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                            onClick={() => setZoom(Math.min(500, zoom * 1.2))}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>
                {/* Timeline Tools Vertical */}
                <div className="w-9 border-r border-border flex flex-col items-center py-4 gap-4 bg-panel shrink-0">
                    <button 
                        onClick={() => setActiveTool('cursor')}
                        className={cn("p-1.5 rounded-md transition-colors", activeTool === 'cursor' ? "text-primary bg-primary/10" : "text-text-muted hover:text-text-primary")}
                        title="Selection Tool (V)"
                    >
                        <Move className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveTool('blade')}
                        className={cn("p-1.5 rounded-md transition-colors", activeTool === 'blade' ? "text-primary bg-primary/10" : "text-text-muted hover:text-text-primary")}
                        title="Blade Tool (C)"
                    >
                        <Scissors className="w-4 h-4" />
                    </button>
                    <button className="text-text-muted hover:text-text-primary p-1.5 transition-colors" title="Ripple Edit"><ChevronRight className="w-4 h-4" /></button>
                    <button className="text-text-muted hover:text-text-primary p-1.5 transition-colors" title="Track Selection"><Layers className="w-4 h-4" /></button>
                </div>

                <div className="absolute inset-0 left-9 flex overflow-auto scrollbar-custom" ref={scrollContainerRef}>
                    <div className="flex min-h-full" style={{ width: Math.max(containerWidth, timelineWidth + 240) }}>

                        {/* Track Headers */}
                        <div className="sticky left-0 z-40 w-[160px] bg-panel border-r border-border flex flex-col shrink-0 min-h-full">
                            <div className="h-7 border-b border-border bg-workspace flex items-center justify-between px-3 text-[10px] text-text-muted font-semibold uppercase tracking-wider shrink-0 sticky top-0 z-50">
                                <span>Track Control</span>
                                <div className="flex gap-1.5">
                                    <Lock className="w-3 h-3 opacity-50" />
                                    <Eye className="w-3 h-3 opacity-50" />
                                </div>
                            </div>
                            <div className="flex-1 bg-transparent">
                                {project.tracks.map(t => (
                                    <TrackHeader key={t.id} track={t} />
                                ))}
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 min-w-0 bg-transparent flex flex-col relative">
                            <div
                                className="sticky top-0 z-30 w-full h-7 bg-panel border-b border-border overflow-hidden cursor-crosshair"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
                                    const x = (e.clientX - rect.left) + scrollLeft;
                                    const rawTime = (x / zoom) * 1000;
                                    setTime(findNearestSnapPoint(Math.max(0, Math.min(project.duration, rawTime))));
                                }}
                            >
                                <Ruler duration={Math.max(project.duration, 60000)} zoom={zoom} />
                            </div>

                            <div
                                className="relative flex-1 bg-background min-h-full cursor-pointer"
                                ref={tracksContainerRef}
                                onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('[data-clip]')) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
                                    const x = (e.clientX - rect.left) + scrollLeft;
                                    const rawTime = (x / zoom) * 1000;
                                    setTime(findNearestSnapPoint(Math.max(0, Math.min(project.duration, rawTime))));
                                    useStore.getState().setSelectedClip(null);
                                }}
                            >
                                {project.tracks.map(t => (
                                    <TrackLane key={t.id} track={t} zoom={zoom} />
                                ))}

                                {/* Playhead Hit Area */}
                                <div
                                    className="absolute top-0 bottom-0 z-50 cursor-ew-resize w-10 -ml-5 flex justify-center group/playhead"
                                    style={{ left: (currentTime / 1000) * zoom }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        const rect = tracksContainerRef.current?.getBoundingClientRect();
                                        if (!rect) return;

                                        const wasPlaying = isPlaying;
                                        if (wasPlaying) setIsPlaying(false);

                                        const updateFromEvent = (moveEvent: MouseEvent) => {
                                            const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
                                            const x = (moveEvent.clientX - rect.left) + scrollLeft;
                                            const rawTime = (x / zoom) * 1000;
                                            const newTime = findNearestSnapPoint(Math.max(0, Math.min(project.duration, rawTime)));
                                            setTime(newTime);
                                        };

                                        updateFromEvent(e as unknown as MouseEvent);

                                        const handleMouseMove = (moveEvent: MouseEvent) => {
                                            updateFromEvent(moveEvent);
                                        };

                                        const handleMouseUp = () => {
                                            document.removeEventListener('mousemove', handleMouseMove);
                                            document.removeEventListener('mouseup', handleMouseUp);
                                            if (wasPlaying) setIsPlaying(true);
                                        };
                                        document.addEventListener('mousemove', handleMouseMove);
                                        document.addEventListener('mouseup', handleMouseUp);
                                    }}
                                >
                                    <div className="w-[1.5px] h-full bg-primary shadow-sm pointer-events-none relative">
                                        <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-primary rounded-sm rotate-45 border border-white/20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
