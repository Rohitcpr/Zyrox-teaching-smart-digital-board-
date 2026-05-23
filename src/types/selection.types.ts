export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectedItems {
  strokeIds: string[];
  shapeIds: string[];
  textIds: string[];
}
