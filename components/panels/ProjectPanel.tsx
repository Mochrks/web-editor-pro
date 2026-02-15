'use client';

import { useStore } from '@/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Asset } from '@/types/store';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/types/dnd';
import { Upload, Trash2, Play, Activity } from 'lucide-react';

export function ProjectPanel({ onImportClick }: { onImportClick: () => void }) {
    const assets = useStore(s => s.assets);
    const removeAsset = useStore(s => s.removeAsset);

    return (
        <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
            <ScrollArea className="flex-1">
                <div className="p-2 flex flex-col gap-2">
                    {assets.map((asset) => (
                        <AssetItem key={asset.id} asset={asset} onRemove={() => removeAsset(asset.id)} />
                    ))}

                    {assets.length === 0 && (
                        <div
                            className="h-32 flex flex-col items-center justify-center text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-black/20 border-2 border-dashed border-white/5 rounded-lg m-2 cursor-pointer hover:bg-primary/5 hover:border-primary/20 transition-all group"
                            onClick={onImportClick}
                        >
                            <Upload className="w-6 h-6 mb-2 opacity-50 group-hover:text-primary transition-colors" />
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

    return (
        <div
            ref={drag as unknown as React.RefObject<HTMLDivElement>}
            className={`group flex flex-col gap-1.5 p-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 cursor-pointer transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            <div className={`relative aspect-video rounded-md overflow-hidden bg-black/40 border-l-2 ${asset.type === 'video' ? 'border-primary' : asset.type === 'audio' ? 'border-[#10b981]' : 'border-[#f59e0b]'
                }`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity z-10">
                    <Play className="w-6 h-6 text-primary fill-primary" />
                </div>

                {asset.type === 'image' && <img src={asset.src} className="w-full h-full object-cover" alt={asset.name} />}
                {asset.type === 'video' && <video src={asset.src} className="w-full h-full object-cover" muted />}
                {asset.type === 'audio' && (
                    <div className="w-full h-full flex items-center justify-center bg-black/60 text-slate-500">
                        <Activity className="w-8 h-8 opacity-20" />
                    </div>
                )}

                <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1.5 py-0.5 rounded font-bold text-white shadow-lg border border-white/5">
                    {formatTime(asset.duration)}
                </div>
            </div>

            <div className="flex justify-between items-center px-0.5">
                <span className="text-[11px] truncate font-bold text-slate-300 group-hover:text-white transition-colors tracking-tight">
                    {asset.name}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded hover:text-red-500"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
