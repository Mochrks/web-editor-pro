import { Asset } from '@/types/store';
import { saveAsset, saveThumbnail } from '@/lib/storage';

export async function processAndImportFile(file: File): Promise<Asset | null> {
  const id = crypto.randomUUID();
  const typeStr = file.type.split('/')[0];
  let type: 'video' | 'audio' | 'image' | 'text' = 'video';
  
  if (typeStr === 'audio') type = 'audio';
  else if (typeStr === 'image') type = 'image';
  else if (typeStr !== 'video') {
     console.error('Unsupported file type', file.type);
     return null;
  }

  const tempUrl = URL.createObjectURL(file);
  let duration = 0;
  let thumbnailBase64 = '';

  try {
      if (type === 'video') {
          const video = document.createElement('video');
          video.src = tempUrl;
          video.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve, reject) => {
              video.onloadedmetadata = () => resolve();
              video.onerror = (e) => reject(e);
          });
          
          duration = video.duration * 1000;

          video.currentTime = Math.max(0.1, video.duration * 0.1);
          await new Promise<void>((resolve) => {
              video.onseeked = () => resolve();
          });

          const canvas = document.createElement('canvas');
          const targetHeight = 120;
          const targetWidth = (video.videoWidth / video.videoHeight) * targetHeight;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
              thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.6);
          }
      } else if (type === 'audio') {
          const audio = document.createElement('audio');
          audio.src = tempUrl;
          await new Promise<void>((resolve, reject) => {
              audio.onloadedmetadata = () => resolve();
              audio.onerror = (e) => reject(e);
          });
          duration = audio.duration * 1000;
      } else if (type === 'image') {
          duration = 5000;
          const img = new Image();
          img.src = tempUrl;
          await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = (e) => reject(e);
          });
          
          const canvas = document.createElement('canvas');
          const targetHeight = 120;
          const targetWidth = (img.width / img.height) * targetHeight;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
              thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.6);
          }
      }

      await saveAsset(id, file);
      if (thumbnailBase64) {
          await saveThumbnail(id, thumbnailBase64);
      }

      const asset: Asset = {
          id,
          name: file.name,
          type,
          src: tempUrl,
          duration
      };

      return asset;
  } catch (err) {
      console.error('Error importing file', err);
      return null;
  }
}
