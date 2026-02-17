import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { ProjectData, Asset } from '@/types/store';

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg() {
    if (ffmpeg) return ffmpeg;
    
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    return ffmpeg;
}

export async function renderProject(project: ProjectData, assets: Asset[], onProgress: (p: number) => void) {
    const ff = await loadFFmpeg();
    
    ff.on('log', ({ message }) => {
        console.log('[FFMPEG]', message);
    });

    ff.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100));
    });

    // 1. Write Assets to FS
    for (const asset of assets) {
        const data = await fetchFile(asset.src);
        await ff.writeFile(asset.id, data);
    }

    // 2. Generate FFmpeg command
    const track = project.tracks[0];
    if (!track) throw new Error('No tracks found');

    const filterComplex: string[] = [];
    const inputs: string[] = [];
    
    track.clips.forEach((clip, i) => {
        inputs.push('-i', clip.assetId);
        const start = clip.offset / 1000;
        const dur = clip.duration / 1000;
        filterComplex.push(`[${i}:v]trim=start=${start}:duration=${dur},setpts=PTS-STARTPTS[v${i}];`);
        filterComplex.push(`[${i}:a]atrim=start=${start}:duration=${dur},asetpts=PTS-STARTPTS[a${i}];`);
    });

    const concatV = track.clips.map((_, i) => `[v${i}]`).join('');
    const concatA = track.clips.map((_, i) => `[a${i}]`).join('');
    filterComplex.push(`${concatV}concat=n=${track.clips.length}:v=1:a=0[outv];`);
    filterComplex.push(`${concatA}concat=n=${track.clips.length}:v=0:a=1[outa];`);

    const command = [
        ...inputs,
        '-filter_complex', filterComplex.join(''),
        '-map', '[outv]',
        '-map', '[outa]',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        'output.mp4'
    ];

    await ff.exec(command);

    const data = await ff.readFile('output.mp4');
    return new Blob([data as any], { type: 'video/mp4' });
}
