
'use client';

import { useStore } from '@/store/useStore';
import { EffectType, Effect } from '@/types/store';
const VIDEO_EFFECTS: { name: string; type: EffectType }[] = [
    { name: 'Gaussian Blur', type: 'blur' },
    { name: 'Grayscale', type: 'grayscale' },
    { name: 'Brightness', type: 'brightness' },
    { name: 'Contrast', type: 'contrast' },
    { name: 'Sepia', type: 'sepia' },
];

export function EffectsPanel() {
    const selectedClipId = useStore(s => s.selectedClipId);
    const project = useStore(s => s.project);
    const setFeedback = useStore(s => s.setFeedback);
    const addEffectToClip = useStore(s => s.addEffectToClip);

    const handleAddEffect = (effectType: EffectType, name: string) => {
        if (!project || !selectedClipId) {
            setFeedback("SELECT A CLIP FIRST TO APPLY EFFECT");
            return;
        }

        // Find track of selected clip
        let trackId = '';
        for (const t of project.tracks) {
            if (t.clips.find(c => c.id === selectedClipId)) {
                trackId = t.id;
                break;
            }
        }

        if (trackId) {
            const effect: Effect = {
                id: crypto.randomUUID(),
                type: effectType,
                name: name,
                value: 0.5 // Default intensity
            };
            addEffectToClip(trackId, selectedClipId, effect);
            setFeedback(`EFFECT ADDED: ${name.toUpperCase()}`);
        }
    };

    return (
        <div className="w-full h-full bg-sidebar p-2 overflow-y-auto">
            <div className="text-xs font-bold text-muted-foreground mb-2 px-1">Video Effects</div>
            <div className="space-y-1">
                {VIDEO_EFFECTS.map(effect => (
                    <div
                        key={effect.name}
                        className="flex items-center px-1 py-1.5 hover:bg-white/10 cursor-pointer text-xs select-none rounded group transition-colors"
                        onClick={() => handleAddEffect(effect.type, effect.name)}
                        title="Click to add to selected clip"
                    >
                        <span className="opacity-50 mr-2 group-hover:text-blue-400">⚡</span>
                        {effect.name}
                    </div>
                ))}
            </div>

            <div className="text-xs font-bold text-muted-foreground mt-4 mb-2 px-1">Audio Effects</div>
            <div className="space-y-1 opacity-50 pointer-events-none">
                {['Amplitude', 'Delay', 'Filter', 'Modulation'].map(folder => (
                    <div key={folder} className="flex items-center px-1 py-1 hover:bg-white/5 cursor-pointer text-xs select-none">
                        <span className="opacity-50 mr-1">🔊</span> {folder} (Coming Soon)
                    </div>
                ))}
            </div>
        </div>
    )
}
