export interface Point {
  x: number;
  y: number;
  timestamp?: number;
}

export type ToolType =
  | 'pen'
  | 'marker'
  | 'highlighter'
  | 'pencil'
  | 'eraser'
  | 'stroke_eraser'
  | 'shape'
  | 'text'
  | 'select';

export interface Stroke {
  id: string;
  points: Point[];
  tool: ToolType;
  color: string;
  size: number;
  opacity: number;
  layerId: string;
  createdAt: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  strokes: Stroke[];
}
