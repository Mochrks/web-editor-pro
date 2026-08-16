'use client';

import { useStore } from '@/store/useStore';
import { Asset } from '@/types/store';
import { useEffect, useRef } from 'react';
import { registerVideo, unregisterVideo } from '@/lib/videoPool';

function VideoSource({ asset }: { asset: Asset }) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (ref.current) {
            registerVideo(asset.id, ref.current);
            return () => unregisterVideo(asset.id);
        }
    }, [asset.id]);

    return <video ref={ref} src={asset.src} crossOrigin="anonymous" className="hidden" muted playsInline />;
}

export function VideoPool() {
    const assets = useStore(s => s.assets);
    return (
        <>
            {assets.filter(a => a.type === 'video').map(asset => (
                <VideoSource key={asset.id} asset={asset} />
            ))}
        </>
    );
}
