import { useStore } from '@/store/useStore';
import { saveAsset } from '@/lib/storage';
import { Asset, MediaType } from '@/types/store';

export function useFileImport() {
  const addAsset = useStore(s => s.addAsset);

  const importFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      let type: MediaType = 'image';
      
      if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('image/')) type = 'image';
      else continue; // Skip unsupported

      // Save to IDB
      await saveAsset(id, file);

      // Get Metadata (Duration)
      let duration = 0;
      if (type === 'video' || type === 'audio') {
        duration = await getMediaDuration(file);
      }

      const asset: Asset = {
        id,
        name: file.name,
        type,
        src: URL.createObjectURL(file), // Transient URL
        duration,
      };

      addAsset(asset);
    }
  };

  return { importFiles };
}

async function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const element = document.createElement(file.type.startsWith('audio') ? 'audio' : 'video');
    element.preload = 'metadata';
    element.onloadedmetadata = () => {
      resolve(element.duration * 1000); // return in ms
    };
    element.onerror = () => {
      resolve(0);
    };
    element.src = URL.createObjectURL(file);
  });
}
