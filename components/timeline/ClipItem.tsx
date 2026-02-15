'use client';

import { useDrag } from 'react-dnd';
import { Clip } from '@/types/store';
import { useStore } from '@/store/useStore';
import { ItemTypes } from '@/types/dnd';
import { useEffect, useRef } from 'react';
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

    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CLIP,
        canDrag: !isLocked,
        item: { id: clip.id, trackId, type: ItemTypes.CLIP, start: clip.start, duration: clip.duration },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [clip.id, trackId, clip.start, clip.duration, isLocked]);

    drag(ref);

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
            const minDelta = -initialOffset;
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

    return (
        <div
            ref={ref}
            data-clip={clip.id}
            className={cn(
                "absolute top-1 bottom-1 rounded-md border-l-4 overflow-hidden cursor-move select-none transition-all group shadow-lg",
                isLocked && "cursor-not-allowed opacity-80",
                isSelected
                    ? "border-primary bg-primary/20 ring-1 ring-primary shadow-[0_0_15px_rgba(0,242,255,0.2)] z-30"
                    : "border-white/20 bg-white/5 hover:bg-white/10 z-20"
            )}
            style={{
                left: `${left}px`,
                width: `${width}px`,
                borderLeftColor: clip.type === 'video' ? '#00f2ff' : clip.type === 'audio' ? '#10b981' : '#f59e0b',
                backgroundColor: isSelected
                    ? undefined
                    : clip.type === 'video' ? 'rgba(0, 242, 255, 0.1)'
                        : clip.type === 'audio' ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
            }}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedClip(clip.id);
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                useStore.getState().setTime(clip.start);
            }}
        >
            {/* Visual content placeholder/waveform */}
            {asset?.src && (clip.type === 'audio' || clip.type === 'video') && (
                <ClipWaveform src={asset.src} duration={clip.duration} zoom={zoom} />
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="relative px-2 py-1.5 flex flex-col justify-between h-full pointer-events-none">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-[10px] font-black uppercase tracking-tight text-white drop-shadow-md truncate">
                        {clip.name}
                    </span>
                </div>

                <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-mono text-white/60">
                        {((clip.duration) / 1000).toFixed(1)}s
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-white/40">
                        {clip.type}
                    </span>
                </div>
            </div>

            {/* Trimming Handles - Only show visual cues on hover or selected */}
            <div
                className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/20 active:bg-white/40 cursor-w-resize z-40"
                onMouseDown={handleTrimStart}
            />
            <div
                className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/20 active:bg-white/40 cursor-e-resize z-40"
                onMouseDown={handleTrimEnd}
            />

            {/* Selection indicators */}
            {isSelected && (
                <div className="absolute inset-0 border border-primary/50 pointer-events-none animate-pulse" />
            )}
        </div>
    );
}
