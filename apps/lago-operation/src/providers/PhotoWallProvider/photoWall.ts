export type LayoutType = 'masonry' | 'grid-collage' | 'free-collage' | 'frame-hanging' | 'polaroid-collage';

export interface Work {
  id: string;
  portfolioId: string;
  userId: string;
  title?: string;
  description?: string;
  mediaUrl: string;
  originalMediaUrl?: string; // 原图地址（AI创作时保留）
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  duration?: number;
  positionX?: number;
  positionY?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // 扩展属性用于布局
  rotation?: number;
  zIndex?: number;
  pinColor?: string;
  frameStyle?: 'classic' | 'modern' | 'vintage' | 'wave';
}

export interface DragState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  dragRotation: number;
  dragZIndex: number;
}

export interface CanvasState {
  width: number;
  height: number;
  zoom: number;
  pan: { x: number; y: number };
  selectedItems: string[];
  clipboard: Work[];
}

export interface CanvasActions {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  selectAll: () => void;
  copy: () => void;
  paste: () => void;
  delete: () => void;
}

export interface LayoutProps {
  works: Work[];
  onItemMove: (id: string, position: { x: number; y: number }) => void;
  onItemRotate: (id: string, rotation: number) => void;
  onItemResize?: (id: string, size: { width: number; height: number }) => void;
  onItemLayer?: (id: string, zIndex: number) => void;
  onItemPin?: (id: string, pinColor: string) => void;
  onItemFrame?: (id: string, frameStyle: string) => void;
  onItemDelete?: (id: string) => void;
  onItemEdit?: (work: Work) => void;
  onPortfolioCover?: (coverImage: string) => void;
  onItemPreview?: (id: string) => void;
  canEdit: boolean;
  containerWidth: number;
  containerHeight: number;
  zoom: number;
  pan: { x: number; y: number };
}

export interface DraggableItemProps {
  work: Work;
  layout: LayoutType;
  onMove: (position: { x: number; y: number }) => void;
  onRotate: (rotation: number) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onLayer?: (zIndex: number) => void;
  onPin?: (pinColor: string) => void;
  onFrame?: (frameStyle: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onSetCover?: () => void;
  canEdit: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export interface PinProps {
  color: string;
  position: { x: number; y: number };
  onMove: (position: { x: number; y: number }) => void;
  size?: 'small' | 'medium' | 'large';
}

export interface StickerProps {
  type: 'heart' | 'star' | 'emoji' | 'text' | 'bear' | 'cake' | 'balloon';
  content: string;
  position: { x: number; y: number };
  onMove: (position: { x: number; y: number }) => void;
  size?: 'small' | 'medium' | 'large';
}

export interface FrameProps {
  style: 'classic' | 'modern' | 'vintage' | 'wave';
  size: { width: number; height: number };
  rotation: number;
  color?: string;
}

export const ItemTypes = {
  PHOTO: 'photo',
  STICKER: 'sticker',
  PIN: 'pin',
  FRAME: 'frame'
} as const;

export const PinColors = [
  '#FFD700', // 黄色
  '#FF6B6B', // 红色
  '#4ECDC4', // 青色
  '#45B7D1', // 蓝色
  '#96CEB4', // 绿色
  '#FFEAA7', // 浅黄色
  '#DDA0DD', // 紫色
  '#98D8C8', // 薄荷绿
] as const;

export const FrameStyles = [
  { key: 'classic', name: '经典', color: '#8B4513' },
  { key: 'modern', name: '现代', color: '#000000' },
  { key: 'vintage', name: '复古', color: '#D2691E' },
  { key: 'wave', name: '波浪', color: '#8B4513' }
] as const;

export const StickerTypes = [
  { key: 'heart', emoji: '❤️', name: '爱心' },
  { key: 'star', emoji: '⭐', name: '星星' },
  { key: 'emoji', emoji: '😊', name: '表情' },
  { key: 'text', emoji: '💬', name: '文字' },
  { key: 'bear', emoji: '🐻', name: '小熊' },
  { key: 'cake', emoji: '🎂', name: '蛋糕' },
  { key: 'balloon', emoji: '🎈', name: '气球' }
] as const;
