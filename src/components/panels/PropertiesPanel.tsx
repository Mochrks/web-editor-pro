'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, ChevronDown, RefreshCcw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PropertiesPanel() {
    const selectedClipId = useStore(s => s.selectedClipId);
    const project = useStore(s => s.project);
    const updateClip = useStore(s => s.updateClip);
    const updateEffect = useStore(s => s.updateEffect);
    const removeEffectFromClip = useStore(s => s.removeEffectFromClip);
    const resetClipProperties = useStore(s => s.resetClipProperties);
    
    const [activeTab, setActiveTab] = useState<'effect' | 'lumetri' | 'audio'>('effect');

    if (!project || !selectedClipId) return (
        <div className="p-8 text-text-muted text-[11px] font-semibold tracking-wider flex flex-col items-center justify-center h-full gap-4 opacity-50">
            <Zap className="w-8 h-8 opacity-40" />
            No clip selected
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

    if (!clip) return <div className="p-4 text-text-muted text-xs flex items-center justify-center h-full font-semibold">Searching for Source...</div>;

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
        <aside className="w-full h-full flex flex-col bg-panel border-l border-border overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Panel Tabs */}
            <div className="flex items-center bg-workspace border-b border-border h-9 overflow-x-auto scrollbar-none shrink-0">
                <button 
                    onClick={() => setActiveTab('effect')}
                    className={cn(
                        "px-4 h-full text-[10px] font-semibold tracking-wider uppercase transition-colors",
                        activeTab === 'effect' ? "text-primary border-b-2 border-primary bg-primary/5" : "text-text-muted hover:text-text-primary border-b-2 border-transparent"
                    )}
                >
                    Effect Controls
                </button>
                <button 
                    onClick={() => setActiveTab('lumetri')}
                    className={cn(
                        "px-4 h-full text-[10px] font-semibold tracking-wider uppercase transition-colors",
                        activeTab === 'lumetri' ? "text-primary border-b-2 border-primary bg-primary/5" : "text-text-muted hover:text-text-primary border-b-2 border-transparent"
                    )}
                >
                    Lumetri Color
                </button>
                <button 
                    onClick={() => setActiveTab('audio')}
                    className={cn(
                        "px-4 h-full text-[10px] font-semibold tracking-wider uppercase transition-colors",
                        activeTab === 'audio' ? "text-primary border-b-2 border-primary bg-primary/5" : "text-text-muted hover:text-text-primary border-b-2 border-transparent"
                    )}
                >
                    Audio
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-custom p-4 flex flex-col gap-8">
                {activeTab === 'effect' && (
                    <>
                        {/* Basic Correction Section */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between group cursor-pointer">
                        <span className="text-[11px] font-semibold text-text-primary tracking-wider uppercase flex items-center gap-2">
                            <span className="w-1 h-3 bg-primary rounded-full shadow-sm"></span>
                            Basic Transforms
                        </span>
                        <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
                    </div>

                    <div className="flex flex-col gap-5 pl-2">
                        {/* Scale */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-[11px] font-medium text-text-secondary tracking-wide">
                                <span>Scale</span>
                                <span className="text-primary font-mono font-medium">{(clip.properties.scale * 100).toFixed(1)}%</span>
                            </div>
                            <Slider
                                min={0} max={3} step={0.01}
                                value={[clip.properties.scale]}
                                onValueChange={([v]) => handleChange('scale', v)}
                                className="[&>[role=slider]]:bg-white [&>[role=slider]]:border-primary [&>[role=slider]]:h-3.5 [&>[role=slider]]:w-3.5"
                            />
                        </div>

                        {/* Rotation */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-[11px] font-medium text-text-secondary tracking-wide">
                                <span>Rotation</span>
                                <span className="text-text-primary font-mono font-medium">{clip.properties.rotation}°</span>
                            </div>
                            <Slider
                                min={-180} max={180} step={1}
                                value={[clip.properties.rotation]}
                                onValueChange={([v]) => handleChange('rotation', v)}
                                className="[&>[role=slider]]:bg-white [&>[role=slider]]:border-primary [&>[role=slider]]:h-3.5 [&>[role=slider]]:w-3.5"
                            />
                        </div>

                        {/* Opacity */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-[11px] font-medium text-text-secondary tracking-wide">
                                <span>Opacity</span>
                                <span className="text-text-primary font-mono font-medium">{Math.round(clip.properties.opacity * 100)}%</span>
                            </div>
                            <Slider
                                min={0} max={1} step={0.01}
                                value={[clip.properties.opacity]}
                                onValueChange={([v]) => handleChange('opacity', v)}
                                className="[&>[role=slider]]:bg-white [&>[role=slider]]:border-primary [&>[role=slider]]:h-3.5 [&>[role=slider]]:w-3.5"
                            />
                        </div>

                        {/* Position inputs */}
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">X-Pos</Label>
                                <Input
                                    type="number"
                                    value={clip.properties.position.x}
                                    onChange={(e) => handlePosChange('x', parseFloat(e.target.value) || 0)}
                                    className="h-8 text-[12px] font-mono bg-workspace border-border focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-text-primary rounded-md"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Y-Pos</Label>
                                <Input
                                    type="number"
                                    value={clip.properties.position.y}
                                    onChange={(e) => handlePosChange('y', parseFloat(e.target.value) || 0)}
                                    className="h-8 text-[12px] font-mono bg-workspace border-border focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-text-primary rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Effects Section */}
                {clip.effects && clip.effects.length > 0 && (
                    <section className="flex flex-col gap-4 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-text-primary tracking-wider uppercase flex items-center gap-2">
                                <span className="w-1 h-3 bg-primary rounded-full shadow-sm"></span>
                                FX Engine
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {clip.effects.map(effect => (
                                <div key={effect.id} className="bg-workspace p-3 rounded-lg border border-border group/fx transition-all hover:border-primary/40">
                                    <div className="flex justify-between items-center mb-2">
                                        <Label className="text-[11px] font-semibold uppercase text-text-secondary group-hover/fx:text-primary transition-colors">{effect.name}</Label>
                                        <button
                                            onClick={() => removeEffectFromClip(trackId, clip!.id, effect.id)}
                                            className="opacity-0 group-hover/fx:opacity-100 transition-opacity p-1 hover:bg-error/10 rounded text-error"
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
                                        <span className="text-[11px] font-mono w-8 text-right text-primary font-medium">{Math.round(effect.value * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                    </>
                )}
                
                {activeTab === 'lumetri' && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Lumetri Color</span>
                        <span className="text-[10px] font-medium text-text-secondary">(Coming Soon)</span>
                    </div>
                )}
                
                {activeTab === 'audio' && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Audio Controls</span>
                        <span className="text-[10px] font-medium text-text-secondary">(Coming Soon)</span>
                    </div>
                )}
            </div>

            {/* Panel Footer */}
            <div className="p-2 border-t border-border bg-workspace flex items-center justify-between shrink-0">
                <button
                    onClick={() => resetClipProperties(trackId, clip!.id)}
                    className="text-[10px] font-semibold text-text-muted hover:text-text-primary flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                >
                    <RefreshCcw className="w-3 h-3" /> Reset
                </button>
                <div className="flex items-center gap-2">
                    <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Type: {clip.type}</div>
                </div>
            </div>
        </aside>
    )
}
