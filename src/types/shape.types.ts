export type ShapeType = 'line' | 'arrow' | 'rectangle' | 'circle' | 'triangle';

export interface Shape {
  id: string;
  type: ShapeType;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  opacity: number;
  layerId: string;
  createdAt: number;
}
