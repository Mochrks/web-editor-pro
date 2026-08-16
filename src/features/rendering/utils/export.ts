import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { ProjectData } from '@/types/store';
import { getAsset } from '@/lib/storage';

export async function exportVideo(project: ProjectData, onProgress: (progress: number) => void): Promise<Blob> {
    const ffmpeg = new FFmpeg();
    
    ffmpeg.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100));
    });

    await ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
    });

    const inputFiles: string[] = [];
    const filterGraph: string[] = [];
    
    // We only process video tracks for a basic export to keep it simple initially
    // For a real NLE, we would map all tracks, trim them, and overlay them.
    
    const videoTracks = project.tracks.filter(t => t.type === 'video' && !t.muted && t.visible !== false);
    
    if (videoTracks.length === 0 || videoTracks[0].clips.length === 0) {
        throw new Error('No video clips to export');
    }

    // Very basic concat for the first track as a MVP
    // In a full NLE, this would be a complex filter_complex graph
    
    const firstTrack = videoTracks[0];
    const clips = [...firstTrack.clips].sort((a, b) => a.start - b.start);
    
    let concatString = '';
    
    for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        const blob = await getAsset(clip.assetId);
        if (!blob) continue;
        
        const fileName = `input_${i}.mp4`;
        await ffmpeg.writeFile(fileName, await fetchFile(blob));
        inputFiles.push(fileName);
        
        // Trim each input
        const trimStart = clip.offset / 1000;
        const trimDuration = clip.duration / 1000;
        
        filterGraph.push(`[${i}:v]trim=start=${trimStart}:duration=${trimDuration},setpts=PTS-STARTPTS,scale=${project.width}:${project.height}:force_original_aspect_ratio=decrease,pad=${project.width}:${project.height}:(ow-iw)/2:(oh-ih)/2[v${i}]`);
        concatString += `[v${i}]`;
    }

    if (inputFiles.length > 0) {
        filterGraph.push(`${concatString}concat=n=${inputFiles.length}:v=1:a=0[outv]`);
        
        const args = [];
        for (const file of inputFiles) {
            args.push('-i', file);
        }
        
        args.push('-filter_complex', filterGraph.join('; '));
        args.push('-map', '[outv]');
        args.push('-r', project.fps.toString());
        args.push('-c:v', 'libx264');
        args.push('-preset', 'ultrafast');
        args.push('output.mp4');

        await ffmpeg.exec(args);
        
        const data = await ffmpeg.readFile('output.mp4');
        return new Blob([data as unknown as BlobPart], { type: 'video/mp4' });
    }
    
    throw new Error('Export failed');
}
