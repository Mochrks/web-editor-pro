
'use client';

import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

export function ClipWaveform({ src }: { src: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    useEffect(() => {
        if (!containerRef.current || !src) return;

        // We use a dummy or minimal wavesurfer for rendering
        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: 'rgba(255, 255, 255, 0.3)',
            progressColor: 'transparent',
            cursorWidth: 0,
            height: 40,
            normalize: true,
            interact: false,
            hideScrollbar: true,
        });

        ws.load(src).catch(err => {
            if (err && (err as Error).name !== 'AbortError') console.error('WaveSurfer load error:', err);
        });
        wavesurferRef.current = ws;

        return () => {
            try {
                ws.destroy();
            } catch {
                // Ignore destruction errors
            }
        };
    }, [src]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
                width: '100%',
                height: '100%'
            }}
        />
    );
}
