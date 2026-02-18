import { Track } from '@/types/store';
import { Eye, EyeOff, Lock, Unlock, VolumeX } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export function TrackHeader({ track }: { track: Track }) {
    const updateProject = useStore(s => s.updateProject);
    const project = useStore(s => s.project);

    const toggleTrackAttr = <K extends keyof Track>(attr: K, val: Track[K]) => {
        if (!project) return;
        const newTracks = project.tracks.map(t => t.id === track.id ? { ...t, [attr]: val } : t);
        updateProject({ tracks: newTracks });
    };

    return (
        <div className="h-20 border-b border-white/5 flex flex-col bg-transparent px-2.5 py-1.5 select-none group shrink-0 relative hover:bg-white/[0.02] transition-colors overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className={cn(
                        "flex items-center justify-center font-black text-[9px] w-4 h-4 rounded-sm shrink-0 border",
                        track.type === 'video' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30'
                    )}>
                        {track.type === 'video' ? 'V' : 'A'}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-400 group-hover:text-white transition-all truncate">
                        {track.name}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-1 justify-end">
                <div className="flex gap-1">
                    <button
                        onClick={() => toggleTrackAttr('muted', !track.muted)}
                        className={cn(
                            "w-6 h-6 rounded-sm border flex items-center justify-center transition-all",
                            track.muted ? "bg-red-500/20 text-red-500 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "bg-black/40 text-slate-500 border-white/5 hover:text-white hover:border-white/10"
                        )}
                        title="Mute (M)"
                    >
                        {track.type === 'audio' ? <span className="text-[9px] font-black">M</span> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    <button
                        onClick={() => toggleTrackAttr('solo', !track.solo)}
                        className={cn(
                            "w-6 h-6 rounded-sm border flex items-center justify-center transition-all",
                            track.solo ? "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]" : "bg-black/40 text-slate-500 border-white/5 hover:text-white hover:border-white/10"
                        )}
                        title="Solo (S)"
                    >
                        <span className="text-[9px] font-black">S</span>
                    </button>

                    <button
                        onClick={() => toggleTrackAttr('locked', !track.locked)}
                        className={cn(
                            "w-6 h-6 rounded-sm border flex items-center justify-center transition-all",
                            track.locked ? "bg-white/10 text-white border-white/20" : "bg-black/40 text-slate-500 border-white/5 hover:text-white hover:border-white/10"
                        )}
                        title="Lock"
                    >
                        {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-30" />}
                    </button>

                    <button
                        onClick={() => toggleTrackAttr('visible', !track.visible)}
                        className={cn(
                            "w-6 h-6 rounded-sm border flex items-center justify-center transition-all",
                            track.visible === false ? "bg-black/20 text-slate-600 border-white/5" : "bg-primary/20 text-primary border-primary/30 shadow-[0_0_8px_rgba(0,242,255,0.2)]"
                        )}
                        title="Visibility"
                    >
                        {track.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-[2px] h-full opacity-0 group-hover:opacity-100 bg-primary/40 transition-opacity" />
        </div>
    );
}
