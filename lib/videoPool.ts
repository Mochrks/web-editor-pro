export const videoElements = new Map<string, HTMLVideoElement>();

export function registerVideo(id: string, element: HTMLVideoElement) {
  videoElements.set(id, element);
}

export function unregisterVideo(id: string) {
  videoElements.delete(id);
}

export function getVideoElement(id: string) {
  return videoElements.get(id);
}
