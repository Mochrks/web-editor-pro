'use client';

import { Player } from '@/components/player/Player';
import { InstaToolbar } from '@/components/editor/InstaToolbar';
import { Pause, SkipBack, SkipForward, ZoomIn, Grid3X3, PlayCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export function ProgramMonitor() {
    const isPlaying = useStore(s => s.isPlaying);
    const setIsPlaying = useStore(s => s.setIsPlaying);
    const setTime = useStore(s => s.setTime);
    const project = useStore(s => s.project);
    const currentTime = useStore(s => s.currentTime);
    const showGrid = useStore(s => s.showGrid);
    const setShowGrid = useStore(s => s.setShowGrid);

    const formatTimecode = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const f = Math.floor((ms % 1000) / 33.33);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#050a0a] border-none relative overflow-hidden group">
            <div className="flex items-center justify-between px-3 h-9 border-b border-white/5 bg-panel/50 backdrop-blur-sm z-20 shrink-0">
                <div className="flex gap-4">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] animate-pulse"></div>
                        Program Monitor
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <select className="bg-black/60 border border-white/5 text-[9px] font-black uppercase tracking-widest text-primary rounded px-2 h-5 outline-none focus:ring-1 focus:ring-primary/50 transition-all">
                        <option>Full Res</option>
                        <option>1/2 Res</option>
                        <option>1/4 Res</option>
                    </select>
                    <div className="text-[10px] font-black font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                        {formatTimecode(currentTime)}
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                    <Player />
                </div>

                <InstaToolbar />

                {/* Cyberpunk overlays */}
                <div className="absolute top-4 left-4 border-l border-t border-primary/30 w-8 h-8 pointer-events-none" />
                <div className="absolute top-4 right-4 border-r border-t border-primary/30 w-8 h-8 pointer-events-none" />
                <div className="absolute bottom-4 left-4 border-l border-b border-primary/30 w-8 h-8 pointer-events-none" />
                <div className="absolute bottom-4 right-4 border-r border-b border-primary/30 w-8 h-8 pointer-events-none" />

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/5 shadow-2xl transition-all translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300 z-30">
                    <button className="text-white hover:text-primary transition-colors" onClick={() => setTime(Math.max(0, currentTime - 5000))}><SkipBack className="w-4 h-4" /></button>
                    <button
                        className="text-primary hover:scale-110 transition-all active:scale-95"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <PlayCircle className="w-8 h-8 fill-current" />}
                    </button>
                    <button className="text-white hover:text-primary transition-colors" onClick={() => setTime(currentTime + 5000)}><SkipForward className="w-4 h-4" /></button>
                </div>

                <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 transition-all translate-x-10 group-hover:translate-x-0 duration-300">
                    <button
                        className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            useStore.getState().programZoom > 1 ? "bg-primary text-black" : "bg-black/60 border border-white/5 text-white hover:bg-primary/20 hover:text-primary"
                        )}
                        onClick={() => useStore.getState().setProgramZoom(useStore.getState().programZoom > 1 ? 0.9 : 1.5)}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            showGrid ? "bg-primary text-black" : "bg-black/60 border border-white/5 text-white hover:bg-primary/20 hover:text-primary"
                        )}
                        onClick={() => setShowGrid(!showGrid)}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="h-2 bg-black/80 flex items-center">
                <div className="h-full bg-primary/20 transition-all" style={{ width: `${(currentTime / (project?.duration || 1)) * 100}%` }}>
                    <div className="h-full bg-primary shadow-[0_0_10px_#00f2ff] animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}
