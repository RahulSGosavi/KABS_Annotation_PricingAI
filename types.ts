
export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  user_id: string;
  updated_at: string;
  status: 'draft' | 'saved';
  pdf_url?: string; // In a real app this would be a Storage path
  annotations: any[];
  current_page: number;
  total_pages: number;
}

export enum ToolType {
  SELECT = 'SELECT',
  PAN = 'PAN',
  PEN = 'PEN',
  LINE = 'LINE',
  ARROW = 'ARROW',
  RECTANGLE = 'RECTANGLE',
  ELLIPSE = 'ELLIPSE',
  TEXT = 'TEXT',
  MEASURE = 'MEASURE',
  ANGLE = 'ANGLE',
  ERASER = 'ERASER',
}

export interface ShapeConfig {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  points?: number[]; // For Line, Arrow, Pen, Eraser
  width?: number; // For Rect, Ellipse
  height?: number;
  text?: string; // For Text
  fontSize?: number; // For Text
  fontFamily?: string; // For Text
  fontStyle?: string; // For Text (bold, italic, normal)
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  page: number; // PDF Page mapping
  visible: boolean;
  locked: boolean;
  unit?: 'mm' | 'cm' | 'in' | 'ft'; // For measurements
  dash?: number[]; // Line dash pattern
  globalCompositeOperation?: string; // For Eraser ('destination-out')
}

export interface PdfPageImage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}
