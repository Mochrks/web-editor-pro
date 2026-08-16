'use client';

import { useDrag } from 'react-dnd';
import { Clip } from '@/types/store';
import { useStore } from '@/store/useStore';
import { ItemTypes } from '@/types/dnd';
import { ClipWaveform } from './ClipWaveform';
import { cn } from '@/lib/utils';

export function ClipItem({ clip, trackId, zoom }: { clip: Clip; trackId: string; zoom: number }) {
    const setSelectedClip = useStore((s) => s.setSelectedClip);
    const updateClip = useStore((s) => s.updateClip);
    const selectedClipId = useStore((s) => s.selectedClipId);
    const assets = useStore((s) => s.assets);

    const asset = assets.find(a => a.id === clip.assetId);
    const project = useStore(s => s.project);
    const track = project?.tracks.find(t => t.id === trackId);
    const isLocked = track?.locked || false;

    // Calculate position
    const left = (clip.start / 1000) * zoom;
    const width = (clip.duration / 1000) * zoom;

    const [, drag] = useDrag(() => ({
        type: ItemTypes.CLIP,
        canDrag: !isLocked,
        item: { id: clip.id, trackId, type: ItemTypes.CLIP, start: clip.start, duration: clip.duration },
    }), [clip.id, trackId, clip.start, clip.duration, isLocked]);

    const handleTrimStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLocked) return;
        const startX = e.clientX;
        const initialStart = clip.start;
        const initialDuration = clip.duration;
        const initialOffset = clip.offset;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const deltaMs = (dx / zoom) * 1000;
            const maxDelta = initialDuration - 100;
            const minDelta = Math.max(-initialStart, -initialOffset);
            const effectiveDelta = Math.max(minDelta, Math.min(maxDelta, deltaMs));

            updateClip(trackId, clip.id, {
                start: initialStart + effectiveDelta,
                duration: initialDuration - effectiveDelta,
                offset: initialOffset + effectiveDelta
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleTrimEnd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLocked) return;
        const startX = e.clientX;
        const initialDuration = clip.duration;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const deltaMs = (dx / zoom) * 1000;
            const newDuration = Math.max(100, initialDuration + deltaMs);
            updateClip(trackId, clip.id, { duration: newDuration });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const isSelected = selectedClipId === clip.id;
    const activeTool = useStore(s => s.activeTool);
    const splitClip = useStore(s => s.splitClip);

    return (
        <div
            ref={(node) => {
                if (activeTool === 'cursor') drag(node);
            }}
            data-clip={clip.id}
            className={cn(
                "absolute top-1 bottom-1 rounded-md border-l-4 overflow-hidden select-none transition-all group shadow-sm",
                isLocked ? "cursor-not-allowed opacity-80" : (activeTool === 'blade' ? "cursor-crosshair" : "cursor-move"),
                isSelected
                    ? "border-primary ring-1 ring-primary z-30"
                    : "border-border-strong hover:border-primary/50 z-20"
            )}
            style={{
                left: `${left}px`,
                width: `${width}px`,
                borderLeftColor: isSelected ? '#3B82F6' : (clip.type === 'video' ? '#1C2533' : clip.type === 'audio' ? '#14202E' : '#171D2A'),
                backgroundColor: isSelected
                    ? 'rgba(59,130,246,0.15)'
                    : clip.type === 'video' ? '#10202A'
                        : clip.type === 'audio' ? '#14202E'
                            : '#171D2A',
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (activeTool === 'blade' && !isLocked) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const splitTime = clip.start + (clickX / zoom) * 1000;
                    setSelectedClip(clip.id); // select first
                    // Need a slight timeout to ensure state settles before split
                    setTimeout(() => splitClip(splitTime), 0);
                } else {
                    setSelectedClip(clip.id);
                }
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                useStore.getState().setTime(clip.start);
            }}
        >
            {/* Visual content placeholder/waveform */}
            {/* Waveform for audio clips */}
            {asset && asset.type === 'audio' && (
                <ClipWaveform src={asset.src} />
            )}

            {/* Label and Info */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="relative px-2 py-1.5 flex flex-col justify-between h-full pointer-events-none">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-[10px] font-semibold tracking-wide text-text-primary drop-shadow-md truncate">
                        {clip.name}
                    </span>
                </div>

                <div className="flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-mono font-medium text-text-primary">
                        {((clip.duration) / 1000).toFixed(1)}s
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                        {clip.type}
                    </span>
                </div>
            </div>

            {/* Trimming Handles - Only show visual cues on hover or selected */}
            <div
                className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/10 active:bg-white/20 cursor-w-resize z-40"
                onMouseDown={handleTrimStart}
            />
            <div
                className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/10 active:bg-white/20 cursor-e-resize z-40"
                onMouseDown={handleTrimEnd}
            />
        </div>
    );
}
