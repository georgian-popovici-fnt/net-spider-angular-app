/**
 * Selection state models for tracking user selections
 */

import { NodeData, EdgeData } from './graph-data.model';

export interface SelectionState {
  selectedNodes: NodeData[];
  selectedEdges: EdgeData[];
  selectionType: 'none' | 'node' | 'edge' | 'mixed';
}

export interface SelectionDetails {
  type: 'node' | 'edge';
  data: NodeData | EdgeData;
  displayProperties: DisplayProperty[];
}

export interface DisplayProperty {
  label: string;
  value: string;
}
