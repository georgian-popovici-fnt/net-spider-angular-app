/**
 * YFilesGraphService - Complete encapsulation of yFiles for HTML APIs
 * Provides full graph visualization with layouts, routing, and interactions
 */

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { GraphData, NodeType, CableType } from '../models/graph-data.model';
import { ViewState, Position } from '../models/view-state.model';
import { NODE_STYLE_CONFIG } from '../styles/node-styles';
import { EDGE_STYLE_CONFIG } from '../styles/edge-styles';

// yFiles imports
import {
  GraphComponent,
  GraphEditorInputMode,
  IGraph,
  INode,
  IEdge,
  Rect,
  Size,
  ShapeNodeStyle,
  PolylineEdgeStyle,
  Arrow,
  ArrowType,
  HierarchicalLayout,
  HierarchicalLayoutData,
  LayoutOrientation,
  EdgeRouter,
  IModelItem,
  GraphItemTypes,
  Fill,
  Stroke,
  Color
} from 'yfiles';

interface NodeTag {
  id: string;
  data: any;
}

interface EdgeTag {
  id: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class YFilesGraphService {
  private graphComponent!: GraphComponent;
  private graph!: IGraph;
  private graphContainer: HTMLElement | null = null;
  private nodeMap = new Map<string, INode>();

  // Event subjects
  private selectionChangedSubject = new Subject<{ nodeIds: string[]; edgeIds: string[] }>();
  private nodeDraggedSubject = new Subject<Array<{ id: string; x: number; y: number }>>();
  private viewportChangedSubject = new Subject<ViewState>();

  constructor() {}

  // ========== Initialization ==========

  isInitialized(): boolean {
    return !!this.graphComponent && !!this.graph;
  }

  initializeGraph(container: HTMLElement): void {
    this.graphContainer = container;

    // Create GraphComponent
    this.graphComponent = new GraphComponent(container);
    this.graph = this.graphComponent.graph;

    // Setup input mode for interaction
    const mode = new GraphEditorInputMode({
      selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      focusableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      // Disable creation of new nodes/edges
      allowCreateNode: false,
      allowCreateEdge: false,
      allowCreateBend: false,
      // Only allow moving of SELECTED items - items must be selected first before moving
      movableSelectedItems: GraphItemTypes.NODE,
      movableUnselectedItems: GraphItemTypes.NONE
    });

    this.graphComponent.inputMode = mode;

    console.log('[yFiles] GraphEditorInputMode configured');
    console.log('[yFiles] Selectable items:', mode.selectableItems);

    // Setup event handlers
    this.setupEventHandlers();

    console.log('[yFiles] GraphComponent initialized successfully');
  }

  private setupEventHandlers(): void {
    // Selection changed handler
    const handleSelectionChange = () => {
      const nodeIds: string[] = [];
      const edgeIds: string[] = [];

      console.log('[yFiles] Selection changed event fired');
      console.log('[yFiles] Selection size:', this.graphComponent.selection.size);

      this.graphComponent.selection.forEach((item: IModelItem) => {
        if (item instanceof INode) {
          const node = item as INode;
          const tag = node.tag as NodeTag;
          if (tag?.id) {
            nodeIds.push(tag.id);
            console.log('[yFiles] Selected node:', tag.id);
          }
        } else if (item instanceof IEdge) {
          const edge = item as IEdge;
          const tag = edge.tag as EdgeTag;
          if (tag?.id) {
            edgeIds.push(tag.id);
            console.log('[yFiles] Selected edge:', tag.id);
          }
        }
      });

      console.log('[yFiles] Emitting selection:', { nodeIds, edgeIds });
      this.selectionChangedSubject.next({ nodeIds, edgeIds });
    };

    // Listen to selection item-added and item-removed events
    this.graphComponent.selection.addEventListener('item-added', handleSelectionChange);
    this.graphComponent.selection.addEventListener('item-removed', handleSelectionChange);
    console.log('[yFiles] Selection listeners attached');

    // Node dragged - listen to moveSelectedItemsInputMode 'drag-finished' event
    const mode = this.graphComponent.inputMode as GraphEditorInputMode;
    mode.moveSelectedItemsInputMode.addEventListener('drag-finished', () => {
      const positions: Array<{ id: string; x: number; y: number }> = [];

      this.graph.nodes.forEach((node: INode) => {
        const tag = node.tag as NodeTag;
        if (tag?.id) {
          positions.push({
            id: tag.id,
            x: node.layout.x,
            y: node.layout.y
          });
        }
      });

      if (positions.length > 0) {
        this.nodeDraggedSubject.next(positions);
      }
    });
  }

  dispose(): void {
    if (this.graphComponent) {
      this.graphComponent.cleanUp();
    }
  }

  // ========== Data Operations ==========

  renderGraph(data: GraphData, persistedPositions?: Map<string, Position>): void {
    this.graph.clear();
    this.nodeMap.clear();

    // Create nodes
    data.nodes.forEach(nodeData => {
      const style = this.createNodeStyle(nodeData.type);
      const config = NODE_STYLE_CONFIG[nodeData.type];

      // Determine position
      let x = 0, y = 0;
      if (persistedPositions?.has(nodeData.id)) {
        const pos = persistedPositions.get(nodeData.id)!;
        x = pos.x;
        y = pos.y;
      } else if (nodeData.x !== undefined && nodeData.y !== undefined) {
        x = nodeData.x;
        y = nodeData.y;
      }

      const node = this.graph.createNode({
        layout: new Rect(x, y, config.width, config.height),
        style: style,
        tag: { id: nodeData.id, data: nodeData } as NodeTag
      });

      // Add label with default style
      this.graph.addLabel(node, nodeData.label);

      this.nodeMap.set(nodeData.id, node);
    });

    // Create edges
    data.edges.forEach(edgeData => {
      const sourceNode = this.nodeMap.get(edgeData.sourceId);
      const targetNode = this.nodeMap.get(edgeData.targetId);

      if (sourceNode && targetNode) {
        const style = this.createEdgeStyle(edgeData.cableType);

        const edge = this.graph.createEdge({
          source: sourceNode,
          target: targetNode,
          style: style,
          tag: { id: edgeData.id, data: edgeData } as EdgeTag
        });

        // Add label if present
        if (edgeData.label) {
          this.graph.addLabel(edge, edgeData.label);
        }
      }
    });

    // Fit graph if no persisted positions
    if (!persistedPositions || persistedPositions.size === 0) {
      this.fitGraphBounds();
    }

    console.log(`[yFiles] Graph rendered: ${data.nodes.length} nodes, ${data.edges.length} edges`);
  }

  private createNodeStyle(nodeType: NodeType): ShapeNodeStyle {
    const config = NODE_STYLE_CONFIG[nodeType];

    return new ShapeNodeStyle({
      shape: config.shape === 'ellipse' ? 'ellipse' : 'round-rectangle',
      fill: config.fillColor,
      stroke: `${config.strokeWidth}px ${config.strokeColor}`
    });
  }

  private createEdgeStyle(cableType: CableType): PolylineEdgeStyle {
    const config = EDGE_STYLE_CONFIG[cableType];

    // Handle dashed lines
    let strokeValue = `${config.strokeWidth}px ${config.strokeColor}`;
    if (config.strokeDashArray && config.strokeDashArray.length > 0) {
      const dashPattern = config.strokeDashArray.join(' ');
      strokeValue = `${config.strokeWidth}px dashed ${config.strokeColor}`;
    }

    const style = new PolylineEdgeStyle({
      stroke: strokeValue,
      targetArrow: `${config.strokeColor} triangle`
    });

    return style;
  }

  clearGraph(): void {
    this.graph.clear();
    this.nodeMap.clear();
  }

  // ========== Layout Operations ==========

  async applyHierarchicalLayout(): Promise<void> {
    if (!this.isInitialized()) {
      console.error('[yFiles] Cannot apply layout - graph not initialized');
      throw new Error('Graph not initialized');
    }

    if (this.graph.nodes.size === 0) {
      console.warn('[yFiles] Cannot apply layout - no nodes in graph');
      return;
    }

    console.log('[yFiles] Starting hierarchical layout...');

    const layout = new HierarchicalLayout({
      layoutOrientation: LayoutOrientation.TOP_TO_BOTTOM,
      minimumLayerDistance: 100,
      nodeToEdgeDistance: 80
    });

    const layoutData = new HierarchicalLayoutData();

    await this.graphComponent.applyLayoutAnimated({
      layout,
      layoutData,
      animationDuration: '1s'
    });

    // Emit new positions
    this.emitNodePositions();

    console.log('[yFiles] Hierarchical layout applied successfully');
  }

  async rerouteAllEdges(): Promise<void> {
    if (!this.isInitialized()) {
      console.error('[yFiles] Cannot reroute edges - graph not initialized');
      throw new Error('Graph not initialized');
    }

    if (this.graph.edges.size === 0) {
      console.warn('[yFiles] Cannot reroute - no edges in graph');
      return;
    }

    console.log('[yFiles] Starting edge routing...');

    const router = new EdgeRouter();
    await this.graphComponent.applyLayoutAnimated({
      layout: router,
      animationDuration: '0.5s'
    });

    console.log('[yFiles] Edges rerouted successfully');
  }

  private emitNodePositions(): void {
    const positions = Array.from(this.nodeMap.entries()).map(([id, node]) => ({
      id,
      x: node.layout.x,
      y: node.layout.y
    }));

    this.nodeDraggedSubject.next(positions);
  }

  // ========== View Operations ==========

  fitGraphBounds(): void {
    this.graphComponent.fitGraphBounds();
  }

  setZoom(zoom: number): void {
    this.graphComponent.zoom = zoom;
  }

  setViewport(centerX: number, centerY: number, zoom: number): void {
    this.graphComponent.zoom = zoom;
    this.graphComponent.viewPoint = { x: centerX, y: centerY };
  }

  getViewState(): ViewState {
    return {
      zoom: this.graphComponent.zoom,
      centerX: this.graphComponent.viewPoint.x,
      centerY: this.graphComponent.viewPoint.y,
      backgroundVisible: true
    };
  }

  // ========== Background Management ==========

  setBackgroundImage(imagePath: string = '/assets/images/floor-plan-sample.svg', visible: boolean = true): void {
    // Background image can be added via CSS on the container
    if (this.graphContainer && visible) {
      this.graphContainer.style.backgroundImage = `url('${imagePath}')`;
      this.graphContainer.style.backgroundSize = 'contain';
      this.graphContainer.style.backgroundPosition = 'center';
      this.graphContainer.style.backgroundRepeat = 'no-repeat';
    } else if (this.graphContainer) {
      this.graphContainer.style.backgroundImage = 'none';
    }

    console.log('[yFiles] Background image:', imagePath, 'visible:', visible);
  }

  toggleBackgroundVisibility(): void {
    if (this.graphContainer) {
      const hasBackground = this.graphContainer.style.backgroundImage !== 'none';
      if (hasBackground) {
        this.graphContainer.style.backgroundImage = 'none';
      } else {
        this.setBackgroundImage();
      }
    }
  }

  // ========== Selection ==========

  setSelectedNodes(nodeIds: string[]): void {
    this.graphComponent.selection.clear();
    nodeIds.forEach(id => {
      const node = this.nodeMap.get(id);
      if (node) {
        this.graphComponent.selection.add(node);
      }
    });
  }

  setSelectedEdges(edgeIds: string[]): void {
    this.graphComponent.selection.clear();
    this.graph.edges.forEach(edge => {
      const tag = edge.tag as EdgeTag;
      if (tag && edgeIds.includes(tag.id)) {
        this.graphComponent.selection.add(edge);
      }
    });
  }

  clearSelection(): void {
    this.graphComponent.selection.clear();
  }

  // ========== Filtering ==========

  /**
   * Apply node and edge filtering based on predicates
   */
  applyFilter(nodePredicate: (nodeId: string) => boolean, edgePredicate: (edgeId: string) => boolean): void {
    if (!this.isInitialized()) {
      console.warn('[yFiles] Cannot apply filter - graph not initialized');
      return;
    }

    let visibleNodes = 0;
    let visibleEdges = 0;

    console.log('[yFiles] Starting filter application...');

    // Filter nodes
    this.graph.nodes.forEach((node: INode) => {
      const tag = node.tag as NodeTag;
      if (tag?.id) {
        const isVisible = nodePredicate(tag.id);
        console.log(`[yFiles] Node ${tag.id} (${tag.data.type}): ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);

        this.setNodeVisibility(node, isVisible);
        if (isVisible) {
          visibleNodes++;
        }
      }
    });

    // Filter edges - hide edges connected to hidden nodes
    this.graph.edges.forEach((edge: IEdge) => {
      const tag = edge.tag as EdgeTag;
      if (tag?.id) {
        const isVisible = edgePredicate(tag.id);
        this.setEdgeVisibility(edge, isVisible);
        if (isVisible) {
          visibleEdges++;
        }
      }
    });

    console.log(`[yFiles] Filter applied: ${visibleNodes} nodes, ${visibleEdges} edges visible`);
  }

  /**
   * Set node visibility by modifying its style
   */
  private setNodeVisibility(node: INode, visible: boolean): void {
    const tag = node.tag as NodeTag;
    if (!tag?.data) return;

    if (visible) {
      // Restore original style
      this.graph.setStyle(node, this.createNodeStyle(tag.data.type));
      // Show labels by setting visibility
      node.labels.forEach(label => {
        this.graph.setLabelText(label, tag.data.label || '');
      });
    } else {
      // Create a transparent/hidden style
      const hiddenStyle = new ShapeNodeStyle({
        shape: 'round-rectangle',
        fill: 'rgba(200, 200, 200, 0.1)',
        stroke: '1px rgba(200, 200, 200, 0.2)'
      });
      this.graph.setStyle(node, hiddenStyle);
      // Hide labels by clearing text
      node.labels.forEach(label => {
        this.graph.setLabelText(label, '');
      });
    }
  }

  /**
   * Set edge visibility by modifying its style
   */
  private setEdgeVisibility(edge: IEdge, visible: boolean): void {
    const tag = edge.tag as EdgeTag;
    if (!tag?.data) return;

    if (visible) {
      // Restore original style
      this.graph.setStyle(edge, this.createEdgeStyle(tag.data.cableType));
      // Restore labels
      edge.labels.forEach(label => {
        this.graph.setLabelText(label, tag.data.label || '');
      });
    } else {
      // Create a transparent/hidden style
      const hiddenStyle = new PolylineEdgeStyle({
        stroke: '0px transparent',
        targetArrow: 'none'
      });
      this.graph.setStyle(edge, hiddenStyle);
      // Hide labels by clearing text
      edge.labels.forEach(label => {
        this.graph.setLabelText(label, '');
      });
    }
  }

  /**
   * Clear all filters and restore original styles
   */
  clearFilter(): void {
    if (!this.isInitialized()) return;

    this.graph.nodes.forEach((node: INode) => {
      const tag = node.tag as NodeTag;
      if (tag?.data) {
        this.setNodeVisibility(node, true);
      }
    });

    this.graph.edges.forEach((edge: IEdge) => {
      const tag = edge.tag as EdgeTag;
      if (tag?.data) {
        this.setEdgeVisibility(edge, true);
      }
    });

    console.log('[yFiles] All filters cleared');
  }

  // ========== Event Subscriptions ==========

  onSelectionChanged(): Observable<{ nodeIds: string[]; edgeIds: string[] }> {
    return this.selectionChangedSubject.asObservable();
  }

  onNodeDragged(): Observable<Array<{ id: string; x: number; y: number }>> {
    return this.nodeDraggedSubject.asObservable();
  }

  onViewportChanged(): Observable<ViewState> {
    return this.viewportChangedSubject.asObservable();
  }

  // ========== Utility ==========

  getNodeBounds(nodeId: string): any {
    const node = this.nodeMap.get(nodeId);
    if (node) {
      return {
        x: node.layout.x,
        y: node.layout.y,
        width: node.layout.width,
        height: node.layout.height
      };
    }
    return null;
  }

  getGraphBounds(): any {
    const bounds = this.graphComponent.contentBounds;
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    };
  }
}
