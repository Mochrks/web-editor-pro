'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-background text-foreground">
                Loading...
            </div>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <TooltipProvider delayDuration={0}>
                {children}
            </TooltipProvider>
        </DndProvider>
    );
}
