/**
 * View state models for canvas viewport and visual settings
 */

export interface ViewState {
  zoom: number;
  centerX: number;
  centerY: number;
  backgroundVisible: boolean;
}

export interface GraphBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}
