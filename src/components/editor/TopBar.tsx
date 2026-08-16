'use client';

import { Button } from '@/components/ui/button';
import { Upload, Settings } from 'lucide-react';
import { useState } from 'react';
import { ExportDialog } from '@/components/export/ExportDialog';
import { useStore } from '@/store/useStore';

export function TopBar() {
    const [exportOpen, setExportOpen] = useState(false);

    const activeMainTab = useStore(s => s.activeMainTab);
    const setActiveMainTab = useStore(s => s.setActiveMainTab);

    return (
        <header className="h-10 bg-workspace border-b border-border backdrop-blur-md flex items-center justify-between px-3 shrink-0 select-none z-50">
            <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveMainTab('Editing')}>
                    <h1 className="text-[15px] font-semibold tracking-tight text-foreground">Cortex Editor</h1>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-panel rounded-md p-0.5 border border-border">
                {['Editing', 'Color', 'Effects', 'Audio'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveMainTab(tab)}
                        className={`px-3 py-1 text-[11px] font-medium rounded transition-all ${activeMainTab === tab ? 'bg-elevated text-primary' : 'text-text-muted hover:text-text-primary hover:bg-hover'
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
                    className="h-7 px-3 bg-primary text-white font-medium text-[11px] hover:bg-primary-active transition-all rounded shadow-sm border-none"
                    onClick={() => setExportOpen(true)}
                >
                    <Upload className="w-3 h-3 mr-1.5 stroke-[2]" />
                    Export
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[11px] font-medium bg-elevated border-border-strong text-text-secondary hover:bg-hover hover:text-text-primary"
                    onClick={async () => {
                        const project = useStore.getState().project;
                        const setFeedback = useStore.getState().setFeedback;
                        if (!project) return;
                        setFeedback('Saving locally...');
                        try {
                            const { saveProject } = await import('@/lib/storage');
                            await saveProject(project);
                            setFeedback('Project saved successfully');
                        } catch {
                            setFeedback('Failed to save project');
                        }
                    }}
                >
                    Save Project
                </Button>

                <div className="h-4 w-px bg-border" />

                <button className="text-text-muted hover:text-text-primary transition-colors">
                    <Settings className="w-4 h-4" />
                </button>

                <div className="w-6 h-6 rounded-full bg-elevated border border-border-strong flex items-center justify-center text-[10px] font-medium text-text-secondary hover:border-primary transition-colors cursor-pointer">
                    JD
                </div>
            </div>
        </header>
    );
}
