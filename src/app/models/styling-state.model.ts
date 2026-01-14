/**
 * Styling State Models - Type definitions for conditional styling rules
 */

export type StylingTarget = 'node' | 'edge' | 'both';
export type StylingOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches';

export interface StylingCondition {
  attribute: string;        // e.g., 'type', 'label', 'metadata.vendor'
  operator: StylingOperator;
  value: string;
}

export interface NodeStyleAction {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shape?: 'rectangle' | 'ellipse' | 'hexagon' | 'round-rectangle';
  width?: number;
  height?: number;
}

export interface EdgeStyleAction {
  strokeColor?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  arrowType?: 'triangle' | 'diamond' | 'none';
}

export interface StylingRule {
  id: string;              // Unique rule ID
  name: string;            // User-friendly name
  enabled: boolean;        // Whether rule is active
  target: StylingTarget;   // What to style (node, edge, both)
  condition: StylingCondition;
  nodeStyle?: NodeStyleAction;  // Applied if target is 'node' or 'both'
  edgeStyle?: EdgeStyleAction;  // Applied if target is 'edge' or 'both'
  priority: number;        // Higher priority rules override lower ones
}

export interface StylingState {
  rules: StylingRule[];
  appliedCount: number;    // Number of elements affected
}
