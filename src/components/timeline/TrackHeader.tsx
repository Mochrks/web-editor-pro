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
        <div className="h-20 border-b border-border flex flex-col bg-panel px-2.5 py-1.5 select-none group shrink-0 relative hover:bg-hover transition-colors overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className={cn(
                        "flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded-sm shrink-0 border",
                        track.type === 'video' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-slate-700/20 text-slate-400 border-slate-700/40'
                    )}>
                        {track.type === 'video' ? 'V' : 'A'}
                    </span>
                    <span className="text-[11px] font-semibold tracking-wide text-text-secondary group-hover:text-text-primary transition-all truncate">
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
                            track.muted ? "bg-error/10 text-error border-error/30" : "bg-workspace text-text-muted border-border hover:text-text-primary hover:border-border-strong hover:bg-hover"
                        )}
                        title="Mute (M)"
                    >
                        {track.type === 'audio' ? <span className="text-[10px] font-bold">M</span> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    <button
                        onClick={() => toggleTrackAttr('solo', !track.solo)}
                        className={cn(
                            "w-6 h-6 rounded-sm border flex items-center justify-center transition-all",
                            track.solo ? "bg-warning/10 text-warning border-warning/30" : "bg-workspace text-text-muted border-border hover:text-text-primary hover:border-border-strong hover:bg-hover"
                        )}
                        title="Solo (S)"
                    >
                        <span className="text-[10px] font-bold">S</span>
                    </button>

                    <button
                        onClick={() => toggleTrackAttr('locked', !track.locked)}
                        className={cn(
                            "w-6 h-6 rounded-sm border flex items-center justify-center transition-all",
                            track.locked ? "bg-elevated text-text-primary border-border-strong" : "bg-workspace text-text-muted border-border hover:text-text-primary hover:border-border-strong hover:bg-hover"
                        )}
                        title="Lock"
                    >
                        {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-50" />}
                    </button>

                    <button
                        onClick={() => toggleTrackAttr('visible', !track.visible)}
                        className={cn(
                            "w-6 h-6 rounded-sm border flex items-center justify-center transition-all",
                            track.visible === false ? "bg-workspace text-text-muted border-border hover:text-text-primary" : "bg-primary/10 text-primary border-primary/30"
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
