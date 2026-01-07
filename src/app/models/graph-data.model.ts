/**
 * Core graph data models for NetSpider network topology visualization
 */

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
  groups?: GroupData[];
}

export interface NodeData {
  id: string;
  label: string;
  type: NodeType;
  x?: number;              // Manual position (persisted)
  y?: number;              // Manual position (persisted)
  groupId?: string;        // Parent group reference
  metadata?: Record<string, any>;
}

export interface EdgeData {
  id: string;
  sourceId: string;
  targetId: string;
  cableType: CableType;
  parallelIndex?: number;  // For multiple cables between same nodes
  label?: string;
  metadata?: Record<string, any>;
}

export interface GroupData {
  id: string;
  label: string;
  parentGroupId?: string;  // For nested groups
  isCollapsed?: boolean;
}

export enum NodeType {
  ROUTER = 'router',
  SWITCH = 'switch',
  SERVER = 'server',
  DEVICE = 'device',
  WORKSTATION = 'workstation'
}

export enum CableType {
  FIBER = 'fiber',
  ETHERNET = 'ethernet',
  COAXIAL = 'coaxial',
  SERIAL = 'serial'
}

export type LayoutType = 'hierarchical' | 'organic' | 'circular';
