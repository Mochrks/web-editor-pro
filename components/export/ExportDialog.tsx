
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const project = useStore(s => s.project);
    const [format, setFormat] = useState('mp4');
    const [resolution, setResolution] = useState('1080p');
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleExport = async () => {
        setIsExporting(true);
        setProgress(0);
        // Simulate export for now
        for (let i = 0; i <= 100; i += 5) {
            setProgress(i);
            await new Promise(r => setTimeout(r, 100));
        }
        setIsExporting(false);
        onOpenChange(false);
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
                        <Label htmlFor="format" className="text-right">Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mp4">H.264 (MP4)</SelectItem>
                                <SelectItem value="webm">VP9 (WebM)</SelectItem>
                                <SelectItem value="gif">GIF</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="resolution" className="text-right">Resolution</Label>
                        <Select value={resolution} onValueChange={setResolution}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Resolution" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="4k">4K (2160p)</SelectItem>
                                <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                                <SelectItem value="720p">HD (720p)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isExporting && (
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting ? `Exporting ${progress}%` : 'Export'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
