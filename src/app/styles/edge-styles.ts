/**
 * Edge/cable styling configuration for different cable types
 * Used by yFiles integration to apply consistent visual styles
 */

import { CableType } from '../models/graph-data.model';

export interface EdgeStyleConfig {
  strokeColor: string;
  strokeWidth: number;
  strokeDashArray: number[];
  arrowType: 'triangle' | 'diamond' | 'none';
}

export const EDGE_STYLE_CONFIG: Record<CableType, EdgeStyleConfig> = {
  [CableType.FIBER]: {
    strokeColor: '#ec4899',
    strokeWidth: 4,
    strokeDashArray: [],
    arrowType: 'triangle'
  },
  [CableType.ETHERNET]: {
    strokeColor: '#3b82f6',
    strokeWidth: 2,
    strokeDashArray: [],
    arrowType: 'triangle'
  },
  [CableType.COAXIAL]: {
    strokeColor: '#f59e0b',
    strokeWidth: 3,
    strokeDashArray: [],
    arrowType: 'triangle'
  },
  [CableType.SERIAL]: {
    strokeColor: '#6b7280',
    strokeWidth: 1,
    strokeDashArray: [5, 3],
    arrowType: 'triangle'
  }
};

export const EDGE_SELECTION_STYLE = {
  strokeColor: '#2563eb',
  strokeWidth: 4
};

export const EDGE_LABEL_STYLE = {
  fontSize: 10,
  fontFamily: 'Arial, sans-serif',
  textColor: '#0f172a',
  backgroundColor: '#ffffff',
  padding: 2
};

export const PARALLEL_EDGE_CONFIG = {
  lineDistance: 15,  // Distance between parallel edges in pixels
  joinEnds: false,
  considerEdgeDirection: true
};
