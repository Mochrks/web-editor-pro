import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { getSetting, getProject, getAllProjects } from '@/lib/storage';
import { ProjectData } from '@/types/store';

export function useProjectInit() {
  const setProject = useStore(s => s.setProject);
  const initialized = useRef(false);

  useEffect(() => {
    async function init() {
      if (initialized.current) return;
      initialized.current = true;

      try {
        const lastProjectId = await getSetting('lastActiveProjectId') as string | undefined;
        let projectToLoad: ProjectData | undefined;

        if (lastProjectId && typeof lastProjectId === 'string') {
           projectToLoad = await getProject(lastProjectId);
        }

        if (!projectToLoad) {
           // Maybe find the most recent one
           const all = await getAllProjects();
           if (all.length > 0) {
              projectToLoad = all.sort((a, b) => b.lastModified - a.lastModified)[0];
           }
        }

        if (projectToLoad) {
           // We found a project!
           // Restore it
           setProject(projectToLoad);
           useStore.getState().setFeedback(`Loaded project: ${projectToLoad.name}`);
        } else {
           // Create new default
           const defaultProject: ProjectData = {
              id: crypto.randomUUID(),
              name: 'Untitled Project',
              width: 1920,
              height: 1080,
              fps: 30,
              duration: 60000,
              lastModified: Date.now(),
              assets: [],
              tracks: [
                { id: crypto.randomUUID(), type: 'video', name: 'Video 1', clips: [], muted: false, solo: false, locked: false, visible: true },
                { id: crypto.randomUUID(), type: 'video', name: 'Video 2', clips: [], muted: false, solo: false, locked: false, visible: true },
                { id: crypto.randomUUID(), type: 'audio', name: 'Audio 1', clips: [], muted: false, solo: false, locked: false, visible: true },
                { id: crypto.randomUUID(), type: 'text', name: 'Text', clips: [], muted: false, solo: false, locked: false, visible: true },
              ]
           };
           setProject(defaultProject);
        }
      } catch (err) {
        console.error("Failed to init project", err);
      }
    }

    init();
  }, [setProject]);
}
