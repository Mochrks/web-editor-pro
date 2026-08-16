'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectPanel } from "./ProjectPanel"
import { EffectsPanel } from "./EffectsPanel"
import { Search, FolderPlus, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFileImport } from '@/hooks/useFileImport';
import { useStore } from '@/store/useStore';

export function LeftSidebar() {
    const { importFiles } = useFileImport();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const setFeedback = useStore(s => s.setFeedback);
    
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            importFiles(e.target.files);
            setFeedback(`Importing ${e.target.files.length} assets...`);
        }
    };

    return (
        <aside className="w-full h-full flex flex-col border-r border-border bg-panel overflow-hidden">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="video/*,audio/*,image/*"
                onChange={handleFileChange}
            />

            <Tabs defaultValue="project" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between px-3 h-9 border-b border-border bg-workspace">
                    {isSearching ? (
                        <div className="flex-1 flex items-center gap-2 h-full">
                            <Search className="w-3.5 h-3.5 text-text-muted" />
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Search assets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-[11px] font-medium outline-none text-text-primary placeholder:text-text-muted"
                            />
                            <X 
                                className="w-3.5 h-3.5 text-text-muted hover:text-error cursor-pointer transition-colors" 
                                onClick={() => {
                                    setIsSearching(false);
                                    setSearchQuery('');
                                }}
                            />
                        </div>
                    ) : (
                        <>
                            <TabsList className="h-9 justify-start gap-4 bg-transparent p-0">
                                <TabsTrigger
                                    value="project"
                                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-[11px] font-semibold tracking-wider text-text-muted data-[state=active]:text-primary transition-all"
                                >
                                    Project
                                </TabsTrigger>
                                <TabsTrigger
                                    value="effects"
                                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-[11px] font-semibold tracking-wider text-text-muted data-[state=active]:text-primary transition-all"
                                >
                                    Effects
                                </TabsTrigger>
                            </TabsList>
                            <Search onClick={() => setIsSearching(true)} className="w-3.5 h-3.5 text-text-muted hover:text-primary cursor-pointer transition-colors" />
                        </>
                    )}
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <TabsContent value="project" className="h-full m-0 p-0 overflow-hidden">
                        <ProjectPanel searchQuery={searchQuery} onImportClick={() => fileInputRef.current?.click()} />
                    </TabsContent>
                    <TabsContent value="effects" className="h-full m-0 p-0 overflow-auto scrollbar-custom">
                        <EffectsPanel />
                    </TabsContent>
                </div>
            </Tabs>

            <div className="p-2 border-t border-border bg-workspace flex gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-elevated hover:bg-hover border border-border-strong h-7 rounded text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2"
                >
                    <Upload className="w-3 h-3 text-text-muted" />
                    Import
                </button>
                <button className="w-7 h-7 bg-elevated border border-border-strong flex items-center justify-center rounded text-text-muted hover:text-primary transition-colors hover:bg-hover">
                    <FolderPlus className="w-4 h-4" />
                </button>
            </div>
        </aside>
    )
}
