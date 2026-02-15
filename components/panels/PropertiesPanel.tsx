'use client';

import { useStore } from '@/store/useStore';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash, ChevronDown, RefreshCcw, Zap } from 'lucide-react';

export function PropertiesPanel() {
    const selectedClipId = useStore(s => s.selectedClipId);
    const project = useStore(s => s.project);
    const updateClip = useStore(s => s.updateClip);
    const updateEffect = useStore(s => s.updateEffect);
    const removeEffectFromClip = useStore(s => s.removeEffectFromClip);
    const resetClipProperties = useStore(s => s.resetClipProperties);

    if (!project || !selectedClipId) return (
        <div className="p-8 text-slate-600 text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center h-full gap-4 opacity-50">
            <Zap className="w-8 h-8 opacity-20" />
            No Neural Link Established
        </div>
    );

    let clip = null;
    let trackId = '';
    for (const t of project.tracks) {
        const c = t.clips.find(clip => clip.id === selectedClipId);
        if (c) {
            clip = c;
            trackId = t.id;
            break;
        }
    }

    if (!clip) return <div className="p-4 text-primary text-xs flex items-center justify-center h-full font-black uppercase tracking-widest">Searching for Source...</div>;

    const handleChange = (key: keyof typeof clip.properties, value: number) => {
        if (clip && trackId) {
            updateClip(trackId, clip.id, { properties: { ...clip.properties, [key]: value } });
        }
    };

    const handlePosChange = (axis: 'x' | 'y', value: number) => {
        if (clip && trackId) {
            updateClip(trackId, clip.id, { properties: { ...clip.properties, position: { ...clip.properties.position, [axis]: value } } });
        }
    }

    return (
        <aside className="w-full h-full flex flex-col bg-panel backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Panel Tabs */}
            <div className="flex items-center bg-black/30 border-b border-white/5 h-9 overflow-x-auto scrollbar-none shrink-0">
                <button className="px-4 h-full text-[9px] font-black text-primary border-b border-primary bg-primary/5 tracking-widest uppercase">EFFECT CONTROLS</button>
                <button className="px-4 h-full text-[9px] font-black text-slate-500 hover:text-white transition-colors tracking-widest uppercase">LUMETRI COLOR</button>
                <button className="px-4 h-full text-[9px] font-black text-slate-500 hover:text-white transition-colors tracking-widest uppercase">AUDIO</button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-custom p-4 flex flex-col gap-8">
                {/* Basic Correction Section */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between group cursor-pointer">
                        <span className="text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-2">
                            <span className="w-1 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(0,242,255,0.6)]"></span>
                            BASIC TRANSFORMS
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                    </div>

                    <div className="flex flex-col gap-5 pl-2">
                        {/* Scale */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                <span>Scale</span>
                                <span className="text-primary font-mono">{(clip.properties.scale * 100).toFixed(1)}%</span>
                            </div>
                            <Slider
                                min={0} max={3} step={0.01}
                                value={[clip.properties.scale]}
                                onValueChange={([v]) => handleChange('scale', v)}
                                className="[&>[role=slider]]:bg-white [&>[role=slider]]:border-primary [&>[role=slider]]:h-3 [&>[role=slider]]:w-3"
                            />
                        </div>

                        {/* Rotation */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                <span>Rotation</span>
                                <span className="text-white font-mono">{clip.properties.rotation}°</span>
                            </div>
                            <Slider
                                min={-180} max={180} step={1}
                                value={[clip.properties.rotation]}
                                onValueChange={([v]) => handleChange('rotation', v)}
                                className="[&>[role=slider]]:bg-white [&>[role=slider]]:border-primary [&>[role=slider]]:h-3 [&>[role=slider]]:w-3"
                            />
                        </div>

                        {/* Opacity */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                <span>Opacity</span>
                                <span className="text-white font-mono">{Math.round(clip.properties.opacity * 100)}%</span>
                            </div>
                            <Slider
                                min={0} max={1} step={0.01}
                                value={[clip.properties.opacity]}
                                onValueChange={([v]) => handleChange('opacity', v)}
                                className="[&>[role=slider]]:bg-white [&>[role=slider]]:border-primary [&>[role=slider]]:h-3 [&>[role=slider]]:w-3"
                            />
                        </div>

                        {/* Position inputs */}
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">X-Pos</Label>
                                <Input
                                    type="number"
                                    value={clip.properties.position.x}
                                    onChange={(e) => handlePosChange('x', parseFloat(e.target.value) || 0)}
                                    className="h-7 text-[11px] font-mono bg-black/40 border-white/5 focus:border-primary/50 transition-all text-primary"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Y-Pos</Label>
                                <Input
                                    type="number"
                                    value={clip.properties.position.y}
                                    onChange={(e) => handlePosChange('y', parseFloat(e.target.value) || 0)}
                                    className="h-7 text-[11px] font-mono bg-black/40 border-white/5 focus:border-primary/50 transition-all text-primary"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Effects Section */}
                {clip.effects && clip.effects.length > 0 && (
                    <section className="flex flex-col gap-4 border-t border-white/5 pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-2">
                                <span className="w-1 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(0,242,255,0.6)]"></span>
                                FX ENGINE
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {clip.effects.map(effect => (
                                <div key={effect.id} className="bg-black/40 p-2.5 rounded-lg border border-white/5 group/fx transition-all hover:border-primary/20">
                                    <div className="flex justify-between items-center mb-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 group-hover/fx:text-primary transition-colors">{effect.name}</Label>
                                        <button
                                            onClick={() => removeEffectFromClip(trackId, clip!.id, effect.id)}
                                            className="opacity-0 group-hover/fx:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-500"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <Slider
                                            min={0} max={1} step={0.05}
                                            value={[effect.value]}
                                            onValueChange={([v]) => updateEffect(trackId, clip!.id, effect.id, v)}
                                            className="flex-1 py-1"
                                        />
                                        <span className="text-[10px] font-mono w-8 text-right text-primary font-bold">{Math.round(effect.value * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Panel Footer */}
            <div className="p-2 border-t border-white/5 bg-black/20 flex items-center justify-between shrink-0">
                <button
                    onClick={() => resetClipProperties(trackId, clip!.id)}
                    className="text-[9px] font-black text-slate-500 hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                >
                    <RefreshCcw className="w-3 h-3" /> RESET ALL
                </button>
                <div className="flex items-center gap-2">
                    <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Selected: {clip.type}</div>
                </div>
            </div>
        </aside>
    )
}
