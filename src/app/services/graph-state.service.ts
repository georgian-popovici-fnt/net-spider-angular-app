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

  // Public observables
  readonly graphData$: Observable<GraphData | null> = this.graphDataSubject.asObservable();
  readonly selection$: Observable<SelectionState> = this.selectionSubject.asObservable();
  readonly viewState$: Observable<ViewState> = this.viewStateSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();

  // Persisted positions
  private nodePositions = new Map<string, Position>();

  constructor(private storageService: StorageService) {
    this.loadPositionsFromStorage();
  }

  // ========== Commands ==========

  /**
   * Load graph data and merge with persisted positions
   */
  loadGraphData(data: GraphData): void {
    this.loadingSubject.next(true);

    // Merge persisted positions into node data
    data.nodes.forEach(node => {
      const persistedPos = this.nodePositions.get(node.id);
      if (persistedPos) {
        node.x = persistedPos.x;
        node.y = persistedPos.y;
      }
    });

    this.graphDataSubject.next(data);
    this.loadingSubject.next(false);
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

    this.selectionSubject.next({
      selectedNodes,
      selectedEdges,
      selectionType
    });
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
   * Get current graph data
   */
  getCurrentGraphData(): GraphData | null {
    return this.graphDataSubject.value;
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

  // ========== Private Helpers ==========

  private buildNodeProperties(node: NodeData): DisplayProperty[] {
    const properties: DisplayProperty[] = [
      { label: 'ID', value: node.id },
      { label: 'Label', value: node.label },
      { label: 'Type', value: this.formatNodeType(node.type) }
    ];

    if (node.x !== undefined && node.y !== undefined) {
      properties.push({
        label: 'Position',
        value: `(${Math.round(node.x)}, ${Math.round(node.y)})`
      });
    }

    if (node.groupId) {
      properties.push({ label: 'Group', value: node.groupId });
    }

    // Add metadata properties
    if (node.metadata) {
      Object.entries(node.metadata).forEach(([key, value]) => {
        properties.push({
          label: this.formatPropertyLabel(key),
          value: String(value)
        });
      });
    }

    return properties;
  }

  private buildEdgeProperties(edge: EdgeData): DisplayProperty[] {
    const properties: DisplayProperty[] = [
      { label: 'ID', value: edge.id },
      { label: 'Source', value: edge.sourceId },
      { label: 'Target', value: edge.targetId },
      { label: 'Cable Type', value: this.formatCableType(edge.cableType) }
    ];

    if (edge.label) {
      properties.push({ label: 'Label', value: edge.label });
    }

    if (edge.parallelIndex !== undefined) {
      properties.push({
        label: 'Parallel Index',
        value: String(edge.parallelIndex)
      });
    }

    // Add metadata properties
    if (edge.metadata) {
      Object.entries(edge.metadata).forEach(([key, value]) => {
        properties.push({
          label: this.formatPropertyLabel(key),
          value: String(value)
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
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}
