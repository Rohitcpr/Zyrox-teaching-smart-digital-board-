import type { ToolType } from '../types/canvas.types';

export interface ToolDefinition {
  id: ToolType;
  icon: string;
  label: string;
  defaultSize: number;
  defaultOpacity: number;
  defaultColor: string;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  { id: 'pen',          icon: 'pencil',        label: 'Pen',      defaultSize: 3,  defaultOpacity: 1,    defaultColor: '#FFFFFF' },
  { id: 'marker',       icon: 'brush',         label: 'Marker',   defaultSize: 10, defaultOpacity: 1,    defaultColor: '#3B82F6' },
  { id: 'highlighter',  icon: 'color-filter',  label: 'Highlight',defaultSize: 22, defaultOpacity: 0.38, defaultColor: '#EAB308' },
  { id: 'pencil',       icon: 'create-outline',label: 'Pencil',   defaultSize: 2,  defaultOpacity: 0.80, defaultColor: '#D4D4D4' },
  { id: 'eraser',       icon: 'square-outline',label: 'Eraser',   defaultSize: 28, defaultOpacity: 1,    defaultColor: '#0A0A0F' },
  { id: 'stroke_eraser',icon: 'cut',           label: 'S.Erase',  defaultSize: 20, defaultOpacity: 1,    defaultColor: '#0A0A0F' },
  { id: 'text',         icon: 'text',          label: 'Text',     defaultSize: 4,  defaultOpacity: 1,    defaultColor: '#FFFFFF' },
  { id: 'select',       icon: 'scan-outline',  label: 'Select',   defaultSize: 1,  defaultOpacity: 1,    defaultColor: '#7C3AED' },
];

export const DEFAULT_TOOL: ToolType = 'pen';
export const DEFAULT_COLOR = '#FFFFFF';
export const DEFAULT_SIZE = 3;
export const DEFAULT_OPACITY = 1;
