'use client';

import { TopBar } from '@/components/editor/TopBar';
import { StatusBar } from '@/components/editor/StatusBar';
import { LeftSidebar } from '@/components/panels/LeftSidebar';
import { ProgramMonitor } from '@/components/panels/ProgramMonitor';
import { Timeline } from '@/components/timeline/Timeline';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { useProjectInit } from '@/hooks/useProjectInit';
import { useAutoSave } from '@/hooks/useAutoSave';
import { VideoPool } from '@/components/player/VideoPool';
import { useStore } from '@/store/useStore';

import { useEffect } from 'react';

/**
 * EditorLayout
 * 
 * Manually structure the layout using Flexbox to avoid any ResizablePanel bugs.
 * 
 * Order:
 * ROW 1 (60% height): [ Left Sidebar (20%) | Program Monitor (55%) | Properties Panel (25%) ]
 * ROW 2 (40% height): [ Timeline ]
 */
export function EditorLayout() {
    useProjectInit();
    useAutoSave();
    
    const activeMainTab = useStore(s => s.activeMainTab);

    useEffect(() => {
        const handleGlobalKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                import('@/store/useStore').then(({ useStore }) => {
                    useStore.getState().undo();
                });
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                import('@/store/useStore').then(({ useStore }) => {
                    useStore.getState().redo();
                });
            }
        };
        window.addEventListener('keydown', handleGlobalKey);
        return () => window.removeEventListener('keydown', handleGlobalKey);
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#020606] text-slate-200 selection:bg-primary/30">
            <VideoPool />
            <TopBar />

            <main className="flex-1 overflow-hidden relative flex flex-col">

                {/* TOP HALF: SOURCE/PREVIEW/EFFECTS */}
                <div className={`flex flex-row min-h-0 border-b border-white/5 transition-all duration-300 ${activeMainTab === 'Audio' ? 'h-[40%]' : 'h-[58%]'}`}>

                    {/* LEFT: Project / Assets */}
                    <div 
                        className={`border-r border-white/5 h-full overflow-hidden bg-black/20 backdrop-blur-md transition-all duration-300 ${
                            activeMainTab === 'Color' ? 'w-0 min-w-0 border-none opacity-0' : 
                            activeMainTab === 'Effects' ? 'w-[25%] min-w-[280px]' : 
                            'w-[18%] min-w-[220px]'
                        }`}
                    >
                        <LeftSidebar />
                    </div>

                    {/* CENTER: Program Monitor/Preview */}
                    <div className="flex-1 min-w-0 border-r border-white/5 h-full bg-[#000] relative">
                        <ProgramMonitor />
                    </div>

                    {/* RIGHT: Effect Controls */}
                    <div 
                        className={`h-full overflow-hidden bg-black/20 backdrop-blur-md transition-all duration-300 ${
                            activeMainTab === 'Color' ? 'w-[30%] min-w-[320px]' : 
                            activeMainTab === 'Audio' ? 'w-[18%] min-w-[220px]' : 
                            'w-[22%] min-w-[280px]'
                        }`}
                    >
                        <PropertiesPanel />
                    </div>
                </div>

                {/* BOTTOM HALF: TIMELINE */}
                <div className="flex-1 min-h-0 relative bg-black/10">
                    <Timeline />
                </div>
            </main>

            <StatusBar />
        </div>
    );
}
