
export type MediaType = 'video' | 'audio' | 'image' | 'text';

export type EffectType = 'grayscale' | 'blur' | 'brightness' | 'contrast' | 'sepia' | 'opacity';

export interface Effect {
  id: string;
  type: EffectType;
  name: string;
  value: number; // 0 to 1 or pixel value
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Track {
  id: string;
  type: MediaType;
  name: string;
  muted: boolean;
  solo: boolean;
  locked: boolean;
  visible: boolean;
  clips: Clip[];
}

export interface Clip {
  id: string;
  assetId: string;
  name: string;
  type: MediaType;
  start: number; // Start time on timeline (ms)
  duration: number; // Duration of the clip (ms)
  offset: number; // Offset into the source media
  volume: number;
  previewUrl?: string; // For images/video frames
  properties: ClipProperties;
  effects: Effect[];
  text?: string;
  textStyle?: {
    fontSize: number;
    color: string;
    fontFamily: string;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
    background?: string;
  };
}

export interface ClipProperties {
  opacity: number;
  scale: number;
  position: { x: number; y: number };
  rotation: number;
  speed: number;
}

export interface Asset {
  id: string;
  name: string;
  type: MediaType;
  src: string; // Blob URL or File handle
  duration: number; // Total duration of the asset
}

export interface ProjectData {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  tracks: Track[];
  assets: Asset[];
  lastModified: number;
}
