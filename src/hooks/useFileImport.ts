import { useStore } from '@/store/useStore';
import { processAndImportFile } from '@/features/media/utils/importAsset';

export function useFileImport() {
  const addAsset = useStore(s => s.addAsset);

  const importFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const asset = await processAndImportFile(file);
      if (asset) {
        addAsset(asset);
      }
    }
  };

  return { importFiles };
}
