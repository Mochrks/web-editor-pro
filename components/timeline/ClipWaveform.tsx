
'use client';

import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

export function ClipWaveform({ src, duration, zoom }: { src: string; duration: number; zoom: number }) {
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

        ws.load(src).catch(e => {
            if (e.name !== 'AbortError') console.error('WaveSurfer load error:', e);
        });
        wavesurferRef.current = ws;

        return () => {
            try {
                ws.destroy();
            } catch (e) {
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
