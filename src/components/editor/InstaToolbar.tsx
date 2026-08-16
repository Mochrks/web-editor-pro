'use client';

import { MediaType, EffectType, Clip } from '@/types/store';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Type, Music, Smile, Filter, Layout, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function InstaToolbar() {
    const { aspectRatio, setAspectRatio, setFeedback, project, currentTime, addClip } = useStore();

    const handleAddText = () => {
        if (!project) return;
        const videoTrack = project.tracks.find(t => t.type === 'video');
        if (!videoTrack) return;

        const newClip: Clip = {
            id: crypto.randomUUID(),
            assetId: 'text-asset',
            name: 'New Text',
            type: 'text' as MediaType,
            start: currentTime,
            duration: 3000,
            offset: 0,
            volume: 1,
            text: 'EDIT ME',
            textStyle: {
                fontSize: 80,
                color: '#ffffff',
                fontFamily: 'Inter',
                fontWeight: '900',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.5)'
            },
            properties: {
                position: { x: 0, y: 0 },
                scale: 1,
                rotation: 0,
                opacity: 1,
                speed: 1
            },
            effects: []
        };

        addClip(videoTrack.id, newClip);
        setFeedback('Text clip added to timeline');
    };

    const handleSave = async () => {
        if (!project) return;
        setFeedback('Saving project...');
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                body: JSON.stringify(project),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) setFeedback('Project saved to cloud');
            else throw new Error('Failed to save');
        } catch {
            setFeedback('Save failed');
        }
    };

    const handleAddFilter = () => {
        const selectedId = useStore.getState().selectedClipId;
        if (!selectedId || !project) {
            setFeedback('Select a clip first');
            return;
        }

        // Find track and clip
        let targetTrackId = '';
        project.tracks.forEach(t => {
            if (t.clips.find(c => c.id === selectedId)) targetTrackId = t.id;
        });

        if (targetTrackId) {
            const effect = { id: crypto.randomUUID(), type: 'grayscale' as EffectType, value: 1, name: 'Grayscale' };
            useStore.getState().addEffectToClip(targetTrackId, selectedId, effect);
            setFeedback('Grayscale filter added');
        }
    };

    return (
        <TooltipProvider>
            <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-3 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl z-40 shadow-2xl">
                <ToolItem icon={<Type className="w-5 h-5" />} label="Add Text" onClick={handleAddText} />
                <ToolItem icon={<Music className="w-5 h-5" />} label="Add Music" onClick={() => { }} />
                <ToolItem icon={<Smile className="w-5 h-5" />} label="Stickers" onClick={() => { }} />
                <ToolItem icon={<Filter className="w-5 h-5" />} label="Filters" onClick={handleAddFilter} />

                <div className="w-full h-[1px] bg-white/10 my-1" />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-10 h-10 rounded-xl hover:bg-primary/20 hover:text-primary transition-all"
                            onClick={() => setAspectRatio(aspectRatio === '9:16' ? '16:9' : aspectRatio === '16:9' ? '1:1' : '9:16')}
                        >
                            <Layout className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Change Ratio: {aspectRatio}</TooltipContent>
                </Tooltip>

                <ToolItem icon={<Save className="w-5 h-5" />} label="Save Project" onClick={handleSave} />
            </div>
        </TooltipProvider>
    );
}

function ToolItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-xl hover:bg-primary/20 hover:text-primary transition-all"
                    onClick={onClick}
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
    );
}
