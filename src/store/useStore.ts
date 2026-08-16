import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProjectData, Track, Clip, Asset, Effect } from '@/types/store';

export type LayoutMode = 'standard' | 'classic';

interface StoreState {
  project: ProjectData | null;
  selectedClipId: string | null;
  selectedTrackId: string | null;
  
  past: ProjectData[];
  future: ProjectData[];

  isPlaying: boolean;
  currentTime: number; 
  duration: number; 
  aspectRatio: '16:9' | '9:16' | '1:1';
  zoom: number;
  layoutMode: LayoutMode;
  activeMainTab: string;
  feedbackMsg: string | null;
  assets: Asset[];
  showGrid: boolean;
  programZoom: number;
  activeTool: 'cursor' | 'blade';

  setProject: (project: ProjectData | null) => void;
  updateProject: (updates: Partial<ProjectData>) => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  addClip: (trackId: string, clip: Clip) => void;
  updateClip: (trackId: string, clipId: string, updates: Partial<Clip>) => void;
  removeClip: (trackId: string, clipId: string) => void;
  
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
  setAssets: (assets: Asset[]) => void;

  setMsg: (msg: string) => void;

  setTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  setSelectedClip: (clipId: string | null) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setActiveMainTab: (tab: string) => void;
  setFeedback: (msg: string | null) => void;
  setAspectRatio: (ratio: '16:9' | '9:16' | '1:1') => void;
  setShowGrid: (show: boolean) => void;
  setProgramZoom: (zoom: number) => void;
  setActiveTool: (tool: 'cursor' | 'blade') => void;
  
  splitClip: (atTime?: number) => void;
  deleteSelected: () => void;
  resetClipProperties: (trackId: string, clipId: string) => void;
  addEffectToClip: (trackId: string, clipId: string, effect: Effect) => void;
  removeEffectFromClip: (trackId: string, clipId: string, effectId: string) => void;
  updateEffect: (trackId: string, clipId: string, effectId: string, value: number) => void;

  commit: () => void;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 50;

const pushHistory = (state: StoreState) => {
    if (!state.project) return { past: state.past, future: state.future };
    const newPast = [...state.past, state.project];
    if (newPast.length > MAX_HISTORY) newPast.shift();
    return { past: newPast, future: [] };
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      project: null,
      selectedClipId: null,
      selectedTrackId: null,
      past: [],
      future: [],
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      aspectRatio: '16:9',
      zoom: 50,
      layoutMode: 'standard',
      activeMainTab: 'Editing',
      feedbackMsg: null,
      assets: [],
      showGrid: false,
      programZoom: 0.9,
      activeTool: 'cursor',

      setProject: (project) => set({ project, duration: project?.duration || 0, past: [], future: [] }),
      
      updateProject: (updates) => set((state) => ({
        ...pushHistory(state),
        project: state.project ? { ...state.project, ...updates, lastModified: Date.now() } : null
      })),

      addTrack: (track) => set((state) => ({
        ...pushHistory(state),
        project: state.project ? { 
          ...state.project, 
          tracks: [...state.project.tracks, track],
          lastModified: Date.now()
        } : null
      })),

      removeTrack: (trackId) => set((state) => ({
        ...pushHistory(state),
        project: state.project ? {
          ...state.project,
          tracks: state.project.tracks.filter(t => t.id !== trackId),
          lastModified: Date.now()
        } : null
      })),

      addClip: (trackId, clip) => set((state) => {
        if (!state.project) return state;
        const newTracks = state.project.tracks.map(t => {
          if (t.id === trackId) {
            return { ...t, clips: [...t.clips, clip] };
          }
          return t;
        });
        return { ...pushHistory(state), project: { ...state.project, tracks: newTracks, lastModified: Date.now() } };
      }),

      updateClip: (trackId, clipId, updates) => set((state) => {
        if (!state.project) return state;
        const newTracks = state.project.tracks.map(t => {
          if (t.id !== trackId) return t;
          return {
            ...t,
            clips: t.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
          };
        });
        return { ...pushHistory(state), project: { ...state.project, tracks: newTracks, lastModified: Date.now() } };
      }),

      removeClip: (trackId, clipId) => set((state) => {
        if (!state.project) return state;
        const newTracks = state.project.tracks.map(t => {
          if (t.id !== trackId) return t;
          return {
            ...t,
            clips: t.clips.filter(c => c.id !== clipId)
          };
        });
        return { ...pushHistory(state), project: { ...state.project, tracks: newTracks, lastModified: Date.now() } };
      }),

      addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
      removeAsset: (assetId) => set((state) => ({ assets: state.assets.filter(a => a.id !== assetId) })),
      setAssets: (assets) => set({ assets }),

      setMsg: (msg) => console.log(msg),

      setTime: (time) => set({ currentTime: time }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setZoom: (zoom) => set({ zoom }),
      setSelectedClip: (clipId) => set({ selectedClipId: clipId }),
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      setActiveMainTab: (tab) => set({ activeMainTab: tab }),
      setFeedback: (feedbackMsg) => {
          set({ feedbackMsg });
          if (feedbackMsg) setTimeout(() => set({ feedbackMsg: null }), 3000);
      },
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setShowGrid: (show) => set({ showGrid: show }),
      setProgramZoom: (programZoom) => set({ programZoom }),
      setActiveTool: (tool) => set({ activeTool: tool }),

      splitClip: (atTime) => set((state) => {
        if (!state.project) return state;
        const time = atTime ?? state.currentTime;
        
        let targetClip: Clip | undefined;
        let targetTrackId: string | undefined;

        if (state.selectedClipId) {
            for (const track of state.project.tracks) {
                const clip = track.clips.find(c => c.id === state.selectedClipId);
                if (clip) {
                    targetClip = clip;
                    targetTrackId = track.id;
                    break;
                }
            }
        } else {
            for (const track of state.project.tracks) {
                const clip = track.clips.find(c => time > c.start && time < c.start + c.duration);
                if (clip) {
                    targetClip = clip;
                    targetTrackId = track.id;
                    break;
                }
            }
        }

        if (!targetClip || !targetTrackId) return state;
        if (time <= targetClip.start || time >= targetClip.start + targetClip.duration) return state;

        const splitPoint = time - targetClip.start;
        const firstDuration = splitPoint;
        const secondDuration = targetClip.duration - splitPoint;

        const clip1: Clip = { ...targetClip, duration: firstDuration };
        const clip2: Clip = {
            ...targetClip,
            id: crypto.randomUUID(),
            start: targetClip.start + firstDuration,
            duration: secondDuration,
            offset: targetClip.offset + firstDuration,
        };

        const newTracks = state.project.tracks.map(t => {
            if (t.id === targetTrackId) {
                const newClips = t.clips.filter(c => c.id !== targetClip!.id);
                newClips.push(clip1, clip2);
                return { ...t, clips: newClips };
            }
            return t;
        });

        return { 
           ...pushHistory(state),
           project: { ...state.project, tracks: newTracks, lastModified: Date.now() },
           selectedClipId: clip2.id 
        };
      }),

      resetClipProperties: (trackId, clipId) => set((state) => {
          if (!state.project) return state;
          const newTracks = state.project.tracks.map(t => {
              if (t.id !== trackId) return t;
              return {
                  ...t,
                  clips: t.clips.map(c => c.id === clipId ? {
                      ...c,
                      properties: {
                          position: { x: 0, y: 0 },
                          scale: 1,
                          rotation: 0,
                          opacity: 1,
                          speed: 1
                      }
                  } : c)
              };
          });
          return { ...pushHistory(state), project: { ...state.project, tracks: newTracks, lastModified: Date.now() } };
      }),

      deleteSelected: () => set((state) => {
        if (!state.project || !state.selectedClipId) return state;
        
        let targetTrackId: string | undefined;
        for (const track of state.project.tracks) {
            if (track.clips.some(c => c.id === state.selectedClipId)) {
                targetTrackId = track.id;
                break;
            }
        }

        if (!targetTrackId) return state;

        const newTracks = state.project.tracks.map(t => {
            if (t.id !== targetTrackId) return t;
            return {
                ...t,
                clips: t.clips.filter(c => c.id !== state.selectedClipId)
            };
        });

        return {
            ...pushHistory(state),
            project: { ...state.project, tracks: newTracks, lastModified: Date.now() },
            selectedClipId: null
        };
      }),

      addEffectToClip: (trackId, clipId, effect) => set((state) => {
         if (!state.project) return state;
         const newTracks = state.project.tracks.map(t => {
             if (t.id !== trackId) return t;
             return {
                 ...t,
                 clips: t.clips.map(c => c.id === clipId ? { ...c, effects: [...(c.effects || []), effect] } : c)
             };
         });
         return { ...pushHistory(state), project: { ...state.project, tracks: newTracks, lastModified: Date.now() } };
      }),
      
      removeEffectFromClip: (trackId, clipId, effectId) => set((state) => {
         if (!state.project) return state;
         const newTracks = state.project.tracks.map(t => {
             if (t.id !== trackId) return t;
             return {
                 ...t,
                 clips: t.clips.map(c => c.id === clipId ? { ...c, effects: (c.effects || []).filter(e => e.id !== effectId) } : c)
             };
         });
         return { ...pushHistory(state), project: { ...state.project, tracks: newTracks, lastModified: Date.now() } };
      }),

      updateEffect: (trackId, clipId, effectId, value) => set((state) => {
         if (!state.project) return state;
         const newTracks = state.project.tracks.map(t => {
             if (t.id !== trackId) return t;
             return {
                 ...t,
                 clips: t.clips.map(c => {
                     if (c.id !== clipId) return c;
                     return {
                         ...c,
                         effects: (c.effects || []).map(e => e.id === effectId ? { ...e, value } : e)
                     };
                 })
             };
         });
         return { ...pushHistory(state), project: { ...state.project, tracks: newTracks, lastModified: Date.now() } };
      }),

      commit: () => set((state) => ({ ...pushHistory(state) })),
      undo: () => set((state) => {
          if (state.past.length === 0 || !state.project) return state;
          const previous = state.past[state.past.length - 1];
          const newPast = state.past.slice(0, state.past.length - 1);
          return {
              past: newPast,
              future: [state.project, ...state.future],
              project: previous
          };
      }),
      redo: () => set((state) => {
          if (state.future.length === 0 || !state.project) return state;
          const next = state.future[0];
          const newFuture = state.future.slice(1);
          return {
              past: [...state.past, state.project],
              future: newFuture,
              project: next
          };
      })

  }),
  {
    name: 'editor-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ 
       // DO NOT PERSIST PROJECT OR ASSETS TO LOCAL STORAGE
       // THEY ARE HANDLED VIA INDEXEDDB
       zoom: state.zoom,
       aspectRatio: state.aspectRatio,
       layoutMode: state.layoutMode,
       showGrid: state.showGrid,
       programZoom: state.programZoom
    }), 
  }
 )
);
