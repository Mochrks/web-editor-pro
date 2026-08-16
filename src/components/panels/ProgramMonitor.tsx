'use client';

import { Player } from '@/components/player/Player';
import { InstaToolbar } from '@/components/editor/InstaToolbar';
import { Pause, SkipBack, SkipForward, ZoomIn, Grid3X3, Play } from 'lucide-react';
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
        <div className="w-full h-full flex flex-col bg-background border-none relative overflow-hidden group">
            <div className="flex items-center justify-between px-3 h-9 border-b border-border bg-workspace z-20 shrink-0">
                <div className="flex gap-4">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-error shadow-sm"></div>
                        Program Monitor
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <select className="bg-panel border border-border text-[10px] font-semibold uppercase tracking-wider text-text-secondary rounded px-2 h-5 outline-none focus:ring-1 focus:ring-primary/50 transition-all">
                        <option>Full Res</option>
                        <option>1/2 Res</option>
                        <option>1/4 Res</option>
                    </select>
                    <div className="text-[11px] font-medium font-mono text-primary bg-elevated px-2 py-0.5 rounded border border-border">
                        {formatTimecode(currentTime)}
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                    <Player />
                </div>

                <InstaToolbar />

                {/* Professional subtle overlays */}
                <div className="absolute top-4 left-4 border-l-2 border-t-2 border-primary/40 w-6 h-6 pointer-events-none" />
                <div className="absolute top-4 right-4 border-r-2 border-t-2 border-primary/40 w-6 h-6 pointer-events-none" />
                <div className="absolute bottom-4 left-4 border-l-2 border-b-2 border-primary/40 w-6 h-6 pointer-events-none" />
                <div className="absolute bottom-4 right-4 border-r-2 border-b-2 border-primary/40 w-6 h-6 pointer-events-none" />

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-panel px-5 py-2.5 rounded-full border border-border shadow-lg transition-all translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-200 z-30">
                    <button className="text-text-secondary hover:text-primary transition-colors" onClick={() => setTime(Math.max(0, currentTime - 5000))}><SkipBack className="w-4 h-4" /></button>
                    <button
                        className="text-text-primary hover:text-primary transition-colors hover:scale-105 active:scale-95"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                    </button>
                    <button className="text-text-secondary hover:text-primary transition-colors" onClick={() => setTime(currentTime + 5000)}><SkipForward className="w-4 h-4" /></button>
                </div>

                <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 transition-all translate-x-10 group-hover:translate-x-0 duration-200">
                    <button
                        className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                            useStore.getState().programZoom > 1 ? "bg-primary text-white border-primary-active" : "bg-elevated border-border text-text-secondary hover:bg-hover hover:text-text-primary"
                        )}
                        onClick={() => useStore.getState().setProgramZoom(useStore.getState().programZoom > 1 ? 0.9 : 1.5)}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                            showGrid ? "bg-primary text-white border-primary-active" : "bg-elevated border-border text-text-secondary hover:bg-hover hover:text-text-primary"
                        )}
                        onClick={() => setShowGrid(!showGrid)}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="h-1 bg-panel flex items-center">
                <div className="h-full bg-primary transition-all duration-75" style={{ width: `${(currentTime / (project?.duration || 1)) * 100}%` }}></div>
            </div>
        </div>
    )
}
