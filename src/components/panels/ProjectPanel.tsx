/* eslint-disable @next/next/no-img-element */
'use client';

import { useStore } from '@/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Asset } from '@/types/store';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/types/dnd';
import { Upload, Trash2, Play, Activity } from 'lucide-react';
import { useRef } from 'react';

export function ProjectPanel({ onImportClick, searchQuery = '' }: { onImportClick: () => void, searchQuery?: string }) {
    const assets = useStore(s => s.assets);
    const removeAsset = useStore(s => s.removeAsset);

    const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
            <ScrollArea className="flex-1">
                <div className="p-2 flex flex-col gap-2">
                    {filteredAssets.map((asset) => (
                        <AssetItem key={asset.id} asset={asset} onRemove={() => removeAsset(asset.id)} />
                    ))}

                    {filteredAssets.length === 0 && searchQuery && (
                        <div className="h-32 flex items-center justify-center text-text-muted text-[11px] font-medium tracking-wide">
                            No assets found
                        </div>
                    )}

                    {assets.length === 0 && !searchQuery && (
                        <div
                            className="h-32 flex flex-col items-center justify-center text-text-muted text-[11px] font-medium tracking-wide bg-workspace border-2 border-dashed border-border rounded-lg m-2 cursor-pointer hover:bg-hover hover:border-border-strong transition-all group"
                            onClick={onImportClick}
                        >
                            <Upload className="w-6 h-6 mb-2 opacity-60 group-hover:text-primary transition-colors" />
                            <span>Drop Assets Here</span>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

function AssetItem({ asset, onRemove }: { asset: Asset; onRemove: () => void }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.ASSET,
        item: { id: asset.id, type: asset.type, duration: asset.duration },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [asset.id, asset.type, asset.duration]);

    const formatTime = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const ss = s % 60;
        return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
    };

    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (asset.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(() => {});
        }
    };

    const handleMouseLeave = () => {
        if (asset.type === 'video' && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div
            ref={drag as unknown as React.RefObject<HTMLDivElement>}
            className={`group flex flex-col gap-1.5 p-1.5 hover:bg-hover bg-workspace rounded-lg border border-border cursor-pointer transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`relative aspect-video rounded-md overflow-hidden bg-black/40 border-l-2 ${asset.type === 'video' ? 'border-primary' : asset.type === 'audio' ? 'border-[#334155]' : 'border-[#475569]'
                }`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity z-10">
                    <Play className="w-6 h-6 text-primary fill-primary" />
                </div>

                {asset.type === 'image' && <img src={asset.src} className="w-full h-full object-cover" alt={asset.name} />}
                {asset.type === 'video' && <video ref={videoRef} src={asset.src} className="w-full h-full object-cover" muted loop />}
                {asset.type === 'audio' && (
                    <div className="w-full h-full flex items-center justify-center bg-black/60 text-text-muted">
                        <Activity className="w-8 h-8 opacity-40" />
                    </div>
                )}

                <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded font-medium text-text-primary border border-border">
                    {formatTime(asset.duration)}
                </div>
            </div>

            <div className="flex justify-between items-center px-1">
                <span className="text-[11px] truncate font-medium text-text-secondary group-hover:text-text-primary transition-colors tracking-tight">
                    {asset.name}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-error/20 rounded hover:text-error"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
