/**
 * GraphStateService - Central state management for graph data and interactions
 * Manages graph data, selection, view state, and position persistence
 * UI components subscribe to observables for reactive updates
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  GraphData,
  NodeData,
  EdgeData,
  LayoutType,
  NodeType,
  CableType
} from '../models/graph-data.model';
import {
  SelectionState,
  SelectionDetails,
  DisplayProperty
} from '../models/selection.model';
import { ViewState, Position } from '../models/view-state.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class GraphStateService {
  // State subjects
  private graphDataSubject = new BehaviorSubject<GraphData | null>(null);
  private selectionSubject = new BehaviorSubject<SelectionState>({
    selectedNodes: [],
    selectedEdges: [],
    selectionType: 'none'
  });
  private viewStateSubject = new BehaviorSubject<ViewState>({
    zoom: 1,
    centerX: 0,
    centerY: 0,
    backgroundVisible: true
  });
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Currently loaded filename (for persistence)
  private currentFilename: string | null = null;

  // Public observables
  readonly graphData$: Observable<GraphData | null> = this.graphDataSubject.asObservable();
  readonly selection$: Observable<SelectionState> = this.selectionSubject.asObservable();
  readonly viewState$: Observable<ViewState> = this.viewStateSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();

  // Persisted positions
  private nodePositions = new Map<string, Position>();

  // Flag to prevent accidental clears during operations
  private preserveGraphData = false;

  constructor(private storageService: StorageService) {
    this.loadPositionsFromStorage();
  }

  /**
   * Set preserve graph data flag to prevent accidental clears
   */
  setPreserveGraphData(preserve: boolean): void {
    this.preserveGraphData = preserve;
  }

  // ========== Commands ==========

  /**
   * Load graph data and merge with persisted positions
   */
  loadGraphData(data: GraphData, filename?: string): void {
    // If preserve flag is set, don't load new data
    if (this.preserveGraphData) {
      return;
    }

    this.loadingSubject.next(true);

    // Track the loaded filename for persistence
    if (filename) {
      this.currentFilename = filename;
    }

    // Check if data already has positions (from saved file)
    const hasPositionsInData = data.nodes.some(node => node.x !== undefined && node.y !== undefined);

    if (hasPositionsInData) {
      // CRITICAL: If the data has positions (from saved file), ALWAYS trust those
      // The file is the source of truth, not localStorage

      // Clear the nodePositions map first to avoid conflicts
      this.nodePositions.clear();

      // Set new positions from file
      data.nodes.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          this.nodePositions.set(node.id, { x: node.x, y: node.y });
        }
      });

      // Save to localStorage to keep it in sync
      this.savePositionsToStorage();
    } else {
      // If data doesn't have positions, try to use positions from localStorage
      data.nodes.forEach(node => {
        const persistedPos = this.nodePositions.get(node.id);
        if (persistedPos) {
          node.x = persistedPos.x;
          node.y = persistedPos.y;
        }
      });
    }

    this.graphDataSubject.next(data);
    this.loadingSubject.next(false);
  }

  /**
   * Get the currently loaded filename
   */
  getCurrentFilename(): string | null {
    return this.currentFilename;
  }

  /**
   * Set the currently loaded filename
   */
  setCurrentFilename(filename: string | null): void {
    this.currentFilename = filename;
  }

  /**
   * Update selection state
   */
  setSelection(nodeIds: string[], edgeIds: string[]): void {
    const data = this.graphDataSubject.value;
    if (!data) {
      return;
    }

    const selectedNodes = data.nodes.filter(n => nodeIds.includes(n.id));
    const selectedEdges = data.edges.filter(e => edgeIds.includes(e.id));

    let selectionType: SelectionState['selectionType'] = 'none';
    if (selectedNodes.length > 0 && selectedEdges.length === 0) {
      selectionType = 'node';
    } else if (selectedEdges.length > 0 && selectedNodes.length === 0) {
      selectionType = 'edge';
    } else if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      selectionType = 'mixed';
    }

    const newSelection = {
      selectedNodes,
      selectedEdges,
      selectionType
    };

    this.selectionSubject.next(newSelection);
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectionSubject.next({
      selectedNodes: [],
      selectedEdges: [],
      selectionType: 'none'
    });
  }

  /**
   * Update a single node position
   */
  updateNodePosition(nodeId: string, x: number, y: number): void {
    this.nodePositions.set(nodeId, { x, y });

    // Update in graph data
    const data = this.graphDataSubject.value;
    if (data) {
      const node = data.nodes.find(n => n.id === nodeId);
      if (node) {
        node.x = x;
        node.y = y;
      }
    }
  }

  /**
   * Update multiple node positions at once
   */
  updateNodePositions(updates: Array<{ id: string; x: number; y: number }>): void {
    updates.forEach(update => {
      this.updateNodePosition(update.id, update.x, update.y);
    });
  }

  /**
   * Update edge bend points
   */
  updateEdgeBends(edgeBends: Array<{ id: string; bends: Array<{ x: number; y: number }> }>): void {
    const data = this.graphDataSubject.value;
    if (!data) {
      return;
    }

    edgeBends.forEach(edgeBend => {
      const edge = data.edges.find(e => e.id === edgeBend.id);
      if (edge) {
        edge.bends = edgeBend.bends;
      }
    });

    // Clear bends for edges that don't have any
    data.edges.forEach(edge => {
      const hasBends = edgeBends.some(eb => eb.id === edge.id);
      if (!hasBends) {
        edge.bends = undefined;
      }
    });
  }

  /**
   * Apply layout algorithm (placeholder - actual implementation in yFiles service)
   */
  async applyLayout(layoutType: LayoutType): Promise<void> {
    this.loadingSubject.next(true);

    // Layout will be applied by yFiles service
    // After layout, positions will be updated via updateNodePositions

    this.loadingSubject.next(false);
  }

  /**
   * Re-route all edges (placeholder - actual implementation in yFiles service)
   */
  async rerouteEdges(): Promise<void> {
    this.loadingSubject.next(true);

    // Edge routing will be handled by yFiles service

    this.loadingSubject.next(false);
  }

  /**
   * Reset view to fit all content
   */
  resetView(): void {
    // View reset will be handled by yFiles service
    // This just triggers the action
  }

  /**
   * Toggle background image visibility
   */
  toggleBackground(): void {
    const currentState = this.viewStateSubject.value;
    this.viewStateSubject.next({
      ...currentState,
      backgroundVisible: !currentState.backgroundVisible
    });
  }

  /**
   * Update view state (called by yFiles service)
   */
  updateViewState(viewState: Partial<ViewState>): void {
    const currentState = this.viewStateSubject.value;
    this.viewStateSubject.next({
      ...currentState,
      ...viewState
    });
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // ========== Queries ==========

  /**
   * Get a specific node by ID
   */
  getNode(id: string): NodeData | undefined {
    return this.graphDataSubject.value?.nodes.find(n => n.id === id);
  }

  /**
   * Get a specific edge by ID
   */
  getEdge(id: string): EdgeData | undefined {
    return this.graphDataSubject.value?.edges.find(e => e.id === id);
  }

  /**
   * Get selection details for display in side panel
   */
  getSelectionDetails(): SelectionDetails | null {
    const selection = this.selectionSubject.value;

    // Only show details for single selection
    if (selection.selectedNodes.length === 1) {
      const node = selection.selectedNodes[0];
      return {
        type: 'node',
        data: node,
        displayProperties: this.buildNodeProperties(node)
      };
    }

    if (selection.selectedEdges.length === 1) {
      const edge = selection.selectedEdges[0];
      return {
        type: 'edge',
        data: edge,
        displayProperties: this.buildEdgeProperties(edge)
      };
    }

    return null;
  }

  /**
   * Get all persisted positions
   */
  getPersistedPositions(): Map<string, Position> {
    return new Map(this.nodePositions);
  }

  /**
   * Get current graph data with updated positions
   */
  getCurrentGraphData(): GraphData | null {
    const data = this.graphDataSubject.value;

    if (!data) {
      return null;
    }

    // Return a deep copy with the latest node positions from nodePositions map
    const result = {
      ...data,
      nodes: data.nodes.map(node => {
        const persistedPos = this.nodePositions.get(node.id);
        if (persistedPos) {
          return {
            ...node,
            x: persistedPos.x,
            y: persistedPos.y
          };
        }
        return { ...node };
      }),
      edges: [...data.edges]
    };

    return result;
  }

  // ========== Persistence ==========

  /**
   * Save node positions to LocalStorage
   */
  savePositionsToStorage(): void {
    this.storageService.savePositions(this.nodePositions);
  }

  /**
   * Load node positions from LocalStorage
   */
  loadPositionsFromStorage(): void {
    const positions = this.storageService.loadPositions();
    if (positions) {
      this.nodePositions = positions;
    }
  }

  /**
   * Clear all persisted positions
   */
  clearPersistedPositions(): void {
    this.nodePositions.clear();
    this.storageService.clearPositions();

    // Reload graph to reset positions
    const data = this.graphDataSubject.value;
    if (data) {
      // Remove x,y from all nodes to trigger auto-layout
      data.nodes.forEach(node => {
        delete node.x;
        delete node.y;
      });
      this.loadGraphData(data);
    }
  }

  /**
   * Delete a node and all connected edges
   */
  deleteNode(nodeId: string): void {
    const data = this.graphDataSubject.value;
    if (!data) {
      return;
    }

    // Remove the node
    const nodeIndex = data.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) {
      return;
    }

    data.nodes.splice(nodeIndex, 1);

    // Remove all edges connected to this node
    const edgesToRemove = data.edges.filter(
      e => e.sourceId === nodeId || e.targetId === nodeId
    );

    edgesToRemove.forEach(edge => {
      const edgeIndex = data.edges.findIndex(e => e.id === edge.id);
      if (edgeIndex !== -1) {
        data.edges.splice(edgeIndex, 1);
      }
    });

    // Remove from persisted positions
    this.nodePositions.delete(nodeId);
    this.savePositionsToStorage();

    // Clear selection
    this.clearSelection();

    // Emit updated graph data
    this.graphDataSubject.next({ ...data });
  }

  /**
   * Delete an edge
   */
  deleteEdge(edgeId: string): void {
    const data = this.graphDataSubject.value;
    if (!data) {
      return;
    }

    // Remove the edge
    const edgeIndex = data.edges.findIndex(e => e.id === edgeId);
    if (edgeIndex === -1) {
      return;
    }

    data.edges.splice(edgeIndex, 1);

    // Clear selection
    this.clearSelection();

    // Emit updated graph data
    this.graphDataSubject.next({ ...data });
  }

  // ========== Private Helpers ==========

  private buildNodeProperties(node: NodeData): DisplayProperty[] {
    const properties: DisplayProperty[] = [
      { label: 'ID', value: node.id },
      { label: 'Label', value: node.label },
      { label: 'Type', value: this.formatNodeType(node.type) }
    ];

    // Position information
    if (node.x !== undefined && node.y !== undefined) {
      properties.push({
        label: 'Position X',
        value: `${Math.round(node.x)} px`
      });
      properties.push({
        label: 'Position Y',
        value: `${Math.round(node.y)} px`
      });
      properties.push({
        label: 'Position',
        value: `(${Math.round(node.x)}, ${Math.round(node.y)})`
      });
    }

    // Group information
    if (node.groupId) {
      properties.push({ label: 'Group ID', value: node.groupId });

      // Try to find group label
      const graphData = this.graphDataSubject.value;
      if (graphData?.groups) {
        const group = graphData.groups.find(g => g.id === node.groupId);
        if (group) {
          properties.push({ label: 'Group Name', value: group.label });
          if (group.isCollapsed !== undefined) {
            properties.push({ label: 'Group Collapsed', value: group.isCollapsed ? 'Yes' : 'No' });
          }
        }
      }
    }

    // Count connections
    const graphData = this.graphDataSubject.value;
    if (graphData) {
      const incomingEdges = graphData.edges.filter(e => e.targetId === node.id);
      const outgoingEdges = graphData.edges.filter(e => e.sourceId === node.id);

      properties.push({
        label: 'Incoming Connections',
        value: String(incomingEdges.length)
      });
      properties.push({
        label: 'Outgoing Connections',
        value: String(outgoingEdges.length)
      });
      properties.push({
        label: 'Total Connections',
        value: String(incomingEdges.length + outgoingEdges.length)
      });
    }

    // Add ALL metadata properties with better formatting
    if (node.metadata) {
      Object.entries(node.metadata).forEach(([key, value]) => {
        properties.push({
          label: this.formatPropertyLabel(key),
          value: this.formatPropertyValue(value)
        });
      });
    }

    return properties;
  }

  private buildEdgeProperties(edge: EdgeData): DisplayProperty[] {
    const properties: DisplayProperty[] = [
      { label: 'ID', value: edge.id }
    ];

    if (edge.label) {
      properties.push({ label: 'Label', value: edge.label });
    }

    properties.push({ label: 'Cable Type', value: this.formatCableType(edge.cableType) });

    // Source node information
    properties.push({ label: 'Source ID', value: edge.sourceId });
    const graphData = this.graphDataSubject.value;
    if (graphData) {
      const sourceNode = graphData.nodes.find(n => n.id === edge.sourceId);
      if (sourceNode) {
        properties.push({ label: 'Source Label', value: sourceNode.label });
        properties.push({ label: 'Source Type', value: this.formatNodeType(sourceNode.type) });
      }
    }

    // Target node information
    properties.push({ label: 'Target ID', value: edge.targetId });
    if (graphData) {
      const targetNode = graphData.nodes.find(n => n.id === edge.targetId);
      if (targetNode) {
        properties.push({ label: 'Target Label', value: targetNode.label });
        properties.push({ label: 'Target Type', value: this.formatNodeType(targetNode.type) });
      }
    }

    // Connection direction
    properties.push({
      label: 'Direction',
      value: `${edge.sourceId} → ${edge.targetId}`
    });

    // Parallel edge information
    if (edge.parallelIndex !== undefined) {
      properties.push({
        label: 'Parallel Index',
        value: String(edge.parallelIndex)
      });

      // Count total parallel edges
      if (graphData) {
        const parallelEdges = graphData.edges.filter(
          e => (e.sourceId === edge.sourceId && e.targetId === edge.targetId) ||
               (e.sourceId === edge.targetId && e.targetId === edge.sourceId)
        );
        if (parallelEdges.length > 1) {
          properties.push({
            label: 'Parallel Edges Count',
            value: String(parallelEdges.length)
          });
        }
      }
    }

    // Add ALL metadata properties with better formatting
    if (edge.metadata) {
      Object.entries(edge.metadata).forEach(([key, value]) => {
        properties.push({
          label: this.formatPropertyLabel(key),
          value: this.formatPropertyValue(value)
        });
      });
    }

    return properties;
  }

  private formatNodeType(type: NodeType): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private formatCableType(type: CableType): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private formatPropertyLabel(key: string): string {
    // Convert camelCase or snake_case to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private formatPropertyValue(value: any): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }
      // If array of primitives, join them
      if (value.every(v => typeof v !== 'object')) {
        return value.join(', ');
      }
      // If array of objects, stringify
      return JSON.stringify(value, null, 2);
    }

    // Handle objects
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle numbers
    if (typeof value === 'number') {
      return String(value);
    }

    // Handle strings
    return String(value);
  }
}
