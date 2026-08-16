import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { saveProject, saveSetting } from '@/lib/storage';

export function useAutoSave() {
  const project = useStore(s => s.project);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setFeedback = useStore(s => s.setFeedback);

  useEffect(() => {
    if (!project) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveProject(project);
        await saveSetting('lastActiveProjectId', project.id);
        // setFeedback('✓ Saved locally'); // Too noisy, better to show a subtle indicator somewhere else, or only on manual save
      } catch (err) {
        console.error("Failed to auto-save project", err);
        setFeedback('Failed to save project');
      }
    }, 1000); // Debounce 1 second

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [project, setFeedback]);
}
