/**
 * Node styling configuration for different node types
 * Used by yFiles integration to apply consistent visual styles
 */

import { NodeType } from '../models/graph-data.model';

export interface NodeStyleConfig {
  shape: 'rectangle' | 'ellipse' | 'hexagon';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  width: number;
  height: number;
  iconPath?: string;
}

export const NODE_STYLE_CONFIG: Record<NodeType, NodeStyleConfig> = {
  [NodeType.ROUTER]: {
    shape: 'rectangle',
    fillColor: '#ef4444',
    strokeColor: '#dc2626',
    strokeWidth: 2,
    width: 80,
    height: 60
  },
  [NodeType.SWITCH]: {
    shape: 'rectangle',
    fillColor: '#3b82f6',
    strokeColor: '#2563eb',
    strokeWidth: 2,
    width: 80,
    height: 60
  },
  [NodeType.SERVER]: {
    shape: 'rectangle',
    fillColor: '#8b5cf6',
    strokeColor: '#7c3aed',
    strokeWidth: 2,
    width: 80,
    height: 80
  },
  [NodeType.DEVICE]: {
    shape: 'ellipse',
    fillColor: '#10b981',
    strokeColor: '#059669',
    strokeWidth: 2,
    width: 60,
    height: 60
  },
  [NodeType.WORKSTATION]: {
    shape: 'rectangle',
    fillColor: '#f59e0b',
    strokeColor: '#d97706',
    strokeWidth: 2,
    width: 70,
    height: 60
  }
};

export const NODE_SELECTION_STYLE = {
  strokeColor: '#2563eb',
  strokeWidth: 4,
  shadowColor: '#2563eb',
  shadowBlur: 10
};

export const NODE_LABEL_STYLE = {
  fontSize: 12,
  fontFamily: 'Arial, sans-serif',
  textColor: '#ffffff',
  backgroundColor: 'transparent'
};
