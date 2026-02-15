
import { useEffect, useRef } from 'react';

export function Ruler({ duration, zoom }: { duration: number, zoom: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions
        const width = (duration / 1000) * zoom + 500; // Extra space
        canvas.width = width;
        canvas.height = 24;

        // Draw
        ctx.fillStyle = '#262626'; // bg-sidebar
        ctx.fillRect(0, 0, width, 24);

        ctx.strokeStyle = '#525252'; // border color
        ctx.beginPath();
        ctx.moveTo(0, 24);
        ctx.lineTo(width, 24);
        ctx.stroke();

        ctx.fillStyle = '#a3a3a3'; // text color
        ctx.font = '10px Sans-serif';
        ctx.textAlign = 'left';

        // Draw ticks
        // Interval based on zoom
        let interval = 1000; // 1 second
        if (zoom < 10) interval = 5000;
        if (zoom > 50) interval = 500;
        if (zoom > 200) interval = 100;

        for (let t = 0; t <= duration + 5000; t += interval) {
            const x = (t / 1000) * zoom;
            const isMajor = t % (interval * 5) === 0; // Major tick every 5 intervals

            ctx.beginPath();
            ctx.moveTo(x, 24);
            ctx.lineTo(x, isMajor ? 12 : 18);
            ctx.strokeStyle = isMajor ? '#737373' : '#404040';
            ctx.stroke();

            if (isMajor) {
                // Format time
                const totalSeconds = Math.floor(t / 1000);
                const m = Math.floor(totalSeconds / 60);
                const s = totalSeconds % 60;
                const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                ctx.fillText(timeStr, x + 2, 10);
            }
        }
    }, [duration, zoom]);

    return <canvas ref={canvasRef} className="sticky top-0 z-20 block bg-sidebar h-6" />;
}
