
import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { ProjectData } from '@/types/store';
import { getAsset } from '@/lib/storage';

export function useProjectInit() {
  const setProject = useStore(s => s.setProject);
  const project = useStore(s => s.project);
  const assets = useStore(s => s.assets);
  const initialized = useRef(false);

  useEffect(() => {
    async function hydrateAssets() {
      if (initialized.current) return;
      initialized.current = true;

      // Hydrate project if needed
      if (!project) {
        // Create default project
        const defaultProject: ProjectData = {
          id: crypto.randomUUID(),
          name: 'Untitled Project',
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 60000, // 60s initial
          lastModified: Date.now(),
          assets: [],
          tracks: [
            { id: crypto.randomUUID(), type: 'video', name: 'Video 1', clips: [], muted: false, solo: false, locked: false, visible: true },
            { id: crypto.randomUUID(), type: 'video', name: 'Video 2', clips: [], muted: false, solo: false, locked: false, visible: true },
            { id: crypto.randomUUID(), type: 'audio', name: 'Audio 1', clips: [], muted: false, solo: false, locked: false, visible: true },
            { id: crypto.randomUUID(), type: 'audio', name: 'Audio 2', clips: [], muted: false, solo: false, locked: false, visible: true },
          ]
        };
        setProject(defaultProject);
      }

      // Check existing assets for stale Blob URLs
      // In zustand persist, objects are restored. But Blob URLs are strings and revoked.
      // We need to re-fetch blobs from IDB and create new URLs.
      // However, assets state is restored from localStorage. 
      // We can iterate them.

      // Actually, if we use persist, assets ARE in the store.
      // But we can't easily update them in place without triggering re-renders or loops.
      // Let's just re-generate URLs for all assets.
      
      const newAssets = [...assets];
      let changed = false;

      for (let i = 0; i < newAssets.length; i++) {
        const asset = newAssets[i];
        try {
            // Check if URL is valid? Hard to check. Just refresh.
            const blob = await getAsset(asset.id);
            if (blob) {
                const newUrl = URL.createObjectURL(blob);
                if (newUrl !== asset.src) {
                    newAssets[i] = { ...asset, src: newUrl };
                    changed = true;
                }
            } else {
                console.warn(`Asset blob missing for ${asset.id}`);
            }
        } catch (e) {
            console.error(`Failed to hydrate asset ${asset.id}`, e);
        }
      }

      if (changed) {
          // Update store directly?
          // We don't have bulk setAssets.
          // Let's add a setAssets or just update them one by one? 
          // Updating one by one is slow.
          // Let's cheat and use useStore.setState({ assets: newAssets });
          useStore.setState({ assets: newAssets });
      }
    }

    hydrateAssets();
  }, [project, setProject, assets]);
}
