'use client';

import { TopBar } from '@/components/editor/TopBar';
import { StatusBar } from '@/components/editor/StatusBar';
import { LeftSidebar } from '@/components/panels/LeftSidebar';
import { ProgramMonitor } from '@/components/panels/ProgramMonitor';
import { Timeline } from '@/components/timeline/Timeline';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { useProjectInit } from '@/hooks/useProjectInit';
import { VideoPool } from '@/components/player/VideoPool';

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

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#020606] text-slate-200 selection:bg-primary/30">
            <VideoPool />
            <TopBar />

            <main className="flex-1 overflow-hidden relative flex flex-col">

                {/* TOP HALF: SOURCE/PREVIEW/EFFECTS */}
                <div className="h-[58%] flex flex-row min-h-0 border-b border-white/5">

                    {/* LEFT: Project / Assets */}
                    <div className="w-[18%] min-w-[220px] border-r border-white/5 h-full overflow-hidden bg-black/20 backdrop-blur-md">
                        <LeftSidebar />
                    </div>

                    {/* CENTER: Program Monitor/Preview */}
                    <div className="flex-1 min-w-0 border-r border-white/5 h-full bg-[#000] relative">
                        <ProgramMonitor />
                    </div>

                    {/* RIGHT: Effect Controls */}
                    <div className="w-[22%] min-w-[280px] h-full overflow-hidden bg-black/20 backdrop-blur-md">
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
