'use client';

import { Button } from '@/components/ui/button';
import { Upload, Activity, Settings } from 'lucide-react';
import { useState } from 'react';
import { ExportDialog } from '@/components/export/ExportDialog';
import { useStore } from '@/store/useStore';

export function TopBar() {
    const [exportOpen, setExportOpen] = useState(false);

    const activeMainTab = useStore(s => s.activeMainTab);
    const setActiveMainTab = useStore(s => s.setActiveMainTab);

    return (
        <header className="h-10 bg-panel border-b border-white/5 backdrop-blur-md flex items-center justify-between px-3 shrink-0 select-none z-50">
            <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveMainTab('Editing')}>
                    <div className="w-6 h-6 bg-primary/20 rounded-md flex items-center justify-center border border-primary/30 group-hover:bg-primary/30 transition-all shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                        <Activity className="w-3.5 h-3.5 text-primary stroke-[3]" />
                    </div>
                    <h1 className="text-xs font-black tracking-widest text-white uppercase bg-clip-text">VideoEditor <span className="text-primary italic">Pro</span></h1>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-black/40 rounded-lg p-0.5 border border-white/5">
                {['Editing', 'Color', 'Effects', 'Audio'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveMainTab(tab)}
                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeMainTab === tab ? 'bg-primary/20 text-primary shadow-[inset_0_0_10px_rgba(0,242,255,0.1)]' : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-3 bg-primary text-[#050a0a] font-black text-[10px] hover:bg-primary/90 transition-all rounded shadow-[0_0_15px_rgba(0,242,255,0.4)] border-none"
                    onClick={() => setExportOpen(true)}
                >
                    <Upload className="w-3 h-3 mr-1.5 stroke-[3]" />
                    EXPORT
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[10px] font-bold border-white/10 hover:bg-white/5"
                    onClick={async () => {
                        const project = useStore.getState().project;
                        const setFeedback = useStore.getState().setFeedback;
                        if (!project) return;
                        setFeedback('Uploading to cloud...');
                        try {
                            const res = await fetch('/api/projects', {
                                method: 'POST',
                                body: JSON.stringify(project),
                                headers: { 'Content-Type': 'application/json' }
                            });
                            if (res.ok) setFeedback('Saved to cloud successfully!');
                            else throw new Error('Failed to save');
                        } catch {
                            setFeedback('Failed to save specifically to cloud.');
                        }
                    }}
                >
                    SAVE CLOUD
                </Button>

                <div className="h-4 w-px bg-white/10" />

                <button className="text-slate-400 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                </button>

                <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:border-primary/50 transition-colors cursor-pointer">
                    JD
                </div>
            </div>
        </header>
    );
}
