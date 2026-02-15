export const ItemTypes = {
  ASSET: 'asset',
  CLIP: 'clip',
};

export interface DraggableAsset {
  id: string;
  type: string;
  duration: number;
}
