'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const project = useStore(s => s.project);
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleExport = async () => {
        if (!project) return;
        setIsExporting(true);
        setProgress(0);

        try {
            const { exportVideo } = await import('@/features/rendering/utils/export');
            const blob = await exportVideo(project, (p: number) => setProgress(p));

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
            <DialogContent className="sm:max-w-[425px] bg-panel border-border-strong text-text-primary">
                <DialogHeader>
                    <DialogTitle className="text-text-primary font-semibold">Export Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-text-secondary">Project</Label>
                        <span className="col-span-3 text-sm font-medium text-text-primary">{project?.name || 'Untitled'}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-text-secondary">Estimated</Label>
                        <span className="col-span-3 text-sm text-text-muted">Approx. {Math.round((project?.duration || 0) / 1000)} seconds</span>
                    </div>
                </div>

                {isExporting && (
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-[11px] uppercase font-semibold text-primary tracking-wider">
                            <span>Rendering Engine Active</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-workspace h-1.5 rounded-full overflow-hidden border border-border">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting} className="bg-workspace border-border text-text-secondary hover:text-text-primary hover:bg-hover">Cancel</Button>
                    <Button onClick={handleExport} disabled={isExporting} className="bg-primary text-white hover:bg-primary-active border-none shadow-sm">
                        {isExporting ? `Exporting ${progress}%` : 'Begin Render'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
