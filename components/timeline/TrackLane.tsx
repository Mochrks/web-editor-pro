'use client';

import { useStore } from '@/store/useStore';
import { useDrop } from 'react-dnd';
import { ItemTypes, DraggableAsset } from '@/types/dnd';
import { Track } from '@/types/store';
import { useRef } from 'react';
import { ClipItem } from './ClipItem';

export function TrackLane({ track, zoom }: { track: Track; zoom: number }) {
    const addClip = useStore((s) => s.addClip);
    const updateClip = useStore((s) => s.updateClip);
    const removeClip = useStore((s) => s.removeClip);
    const project = useStore((s) => s.project);
    const assets = useStore((s) => s.assets);

    const ref = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: [ItemTypes.ASSET, ItemTypes.CLIP],
        drop: (item: any, monitor) => {
            if (monitor.didDrop()) return;

            const offset = monitor.getClientOffset();
            const laneRect = ref.current?.getBoundingClientRect();

            if (!offset || !laneRect) return;

            // Important: Account for scroll of the timeline container
            const scrollContainer = ref.current?.parentElement?.parentElement; // scrollContainerRef in Timeline
            const scrollLeft = scrollContainer?.scrollLeft || 0;

            const relativeX = (offset.x - laneRect.left) + scrollLeft;
            const startTime = Math.max(0, (relativeX / zoom) * 1000);

            if (monitor.getItemType() === ItemTypes.ASSET) {
                const asset = assets.find(a => a.id === item.id);
                const newClip = {
                    id: crypto.randomUUID(),
                    assetId: item.id,
                    name: asset?.name || 'Clip',
                    type: item.type,
                    start: startTime,
                    duration: item.duration,
                    offset: 0,
                    volume: 1,
                    properties: { opacity: 1, scale: 1, position: { x: 0, y: 0 }, rotation: 0, speed: 1 },
                    effects: []
                };
                // @ts-ignore
                addClip(track.id, newClip);
            } else if (monitor.getItemType() === ItemTypes.CLIP) {
                const { id: clipId, trackId: oldTrackId } = item;
                if (oldTrackId === track.id) {
                    updateClip(track.id, clipId, { start: startTime });
                } else {
                    const oldTrack = project?.tracks.find(t => t.id === oldTrackId);
                    const clip = oldTrack?.clips.find(c => c.id === clipId);
                    if (clip) {
                        removeClip(oldTrackId, clipId);
                        // @ts-ignore
                        addClip(track.id, { ...clip, start: startTime });
                    }
                }
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [track.id, zoom, project, assets]);

    drop(ref);

    return (
        <div
            ref={ref}
            className={`h-20 border-b border-white/5 relative min-w-full overflow-visible ${isOver ? 'bg-primary/5' : 'bg-transparent'} transition-colors`}
            style={{ width: `${(Math.max(project?.duration || 0, 60000) / 1000) * zoom + 500}px` }}
        >
            {/* Background pattern for track grid if needed */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_100%]" />

            {track.clips.map(c => <ClipItem key={c.id} clip={c} trackId={track.id} zoom={zoom} />)}
        </div>
    )
}
