'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectPanel } from "./ProjectPanel"
import { EffectsPanel } from "./EffectsPanel"
import { Search, FolderPlus, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useFileImport } from '@/hooks/useFileImport';
import { useStore } from '@/store/useStore';

export function LeftSidebar() {
    const { importFiles } = useFileImport();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const setFeedback = useStore(s => s.setFeedback);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            importFiles(e.target.files);
            setFeedback(`IMPORTING ${e.target.files.length} ASSETS...`);
        }
    };

    return (
        <aside className="w-full h-full flex flex-col border-r border-white/5 bg-panel backdrop-blur-md overflow-hidden">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="video/*,audio/*,image/*"
                onChange={handleFileChange}
            />

            <Tabs defaultValue="project" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between px-3 h-9 border-b border-white/5 bg-black/20">
                    <TabsList className="h-9 justify-start gap-4 bg-transparent p-0">
                        <TabsTrigger
                            value="project"
                            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-[10px] font-black uppercase tracking-widest text-slate-500 data-[state=active]:text-primary transition-all"
                        >
                            Project
                        </TabsTrigger>
                        <TabsTrigger
                            value="effects"
                            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-[10px] font-black uppercase tracking-widest text-slate-500 data-[state=active]:text-primary transition-all"
                        >
                            Effects
                        </TabsTrigger>
                    </TabsList>
                    <Search className="w-3.5 h-3.5 text-slate-500 hover:text-primary cursor-pointer transition-colors" />
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <TabsContent value="project" className="h-full m-0 p-0 overflow-hidden">
                        <ProjectPanel onImportClick={() => fileInputRef.current?.click()} />
                    </TabsContent>
                    <TabsContent value="effects" className="h-full m-0 p-0 overflow-auto scrollbar-custom">
                        <EffectsPanel />
                    </TabsContent>
                </div>
            </Tabs>

            <div className="p-2 border-t border-white/5 bg-black/20 flex gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-white/5 hover:bg-white/10 h-7 rounded text-[10px] font-black text-white tracking-widest transition-all flex items-center justify-center gap-2"
                >
                    <Upload className="w-3 h-3" />
                    IMPORT
                </button>
                <button className="w-7 h-7 bg-white/5 flex items-center justify-center rounded text-slate-400 hover:text-primary transition-colors">
                    <FolderPlus className="w-4 h-4" />
                </button>
            </div>
        </aside>
    )
}
