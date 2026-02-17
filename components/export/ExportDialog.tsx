'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const project = useStore(s => s.project);
    const assets = useStore(s => s.assets);
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleExport = async () => {
        if (!project) return;
        setIsExporting(true);
        setProgress(0);

        try {
            const { renderProject } = await import('@/lib/ffmpeg');
            const blob = await renderProject(project, assets, (p: number) => setProgress(p));

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name || 'project'}.mp4`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Export failed. Check console for details.');
        } finally {
            setIsExporting(false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-sidebar border-border">
                <DialogHeader>
                    <DialogTitle>Export Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Project</Label>
                        <span className="col-span-3 text-sm font-medium">{project?.name || 'Untitled'}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Estimated</Label>
                        <span className="col-span-3 text-sm text-muted-foreground">Approx. {Math.round((project?.duration || 0) / 1000)} seconds</span>
                    </div>
                </div>

                {isExporting && (
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-primary">
                            <span>Rendering Engine Active</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_#00f2ff]" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>Cancel</Button>
                    <Button onClick={handleExport} disabled={isExporting} className="bg-primary text-black hover:bg-primary/90">
                        {isExporting ? `Exporting ${progress}%` : 'Begin Render'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
