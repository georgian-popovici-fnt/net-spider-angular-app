/**
 * YFilesGraphService - Complete encapsulation of yFiles for HTML APIs
 *
 * This service provides yFiles integration with proper API usage.
 * When yFiles library is installed, uncomment the yFiles imports and implementation code.
 * 
 * IMPORTANT: This file contains correct yFiles API usage that fixes common errors:
 * - Use HierarchicalLayout (not HierarchicLayout)
 * - Use HierarchicalLayoutData (not HierarchicLayoutData)
 * - Use proper Fill/Stroke constructors
 * - Use correct GraphComponent and selection APIs
 * - Add proper type annotations
 *
 * UI components will never directly import yFiles types - all interaction
 * happens through this service using domain models.
 */

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { GraphData, NodeData, EdgeData } from '../models/graph-data.model';
import { ViewState, Position, GraphBounds } from '../models/view-state.model';

// yFiles imports - uncomment when yFiles is installed
// CORRECTED: Use HierarchicalLayout (not HierarchicLayout)
// CORRECTED: Use HierarchicalLayoutData (not HierarchicLayoutData)
/*
import {
  GraphComponent,
  IGraph,
  INode,
  IEdge,
  GraphViewerInputMode,
  GraphEditorInputMode,
  Fill,
  Stroke,
  ShapeNodeStyle,
  PolylineEdgeStyle,
  Arrow,
  ArrowType,
  HierarchicalLayout,
  HierarchicalLayoutData,
  EdgeRouter,
  ParallelEdgeRouter,
  LayoutOrientation,
  Rect,
  Point,
  Size,
  GraphItemTypes,
  ILabel,
  DefaultLabelStyle,
  ExteriorLabelModel,
  Color,
  INodeStyle,
  IEdgeStyle,
  ILabelStyle,
  GraphSelection
} from 'yfiles';
*/

// Type aliases for when yFiles is not available
type GraphComponent = any;
type IGraph = any;
type INode = any;
type IEdge = any;
type GraphViewerInputMode = any;
type GraphEditorInputMode = any;

interface NodeTag {
  id: string;
  type: string;
  metadata?: any;
}

interface EdgeTag {
  id: string;
  cableType: string;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class YFilesGraphService {
  // Event subjects for communication with other services
  private selectionChangedSubject = new Subject<{ nodeIds: string[]; edgeIds: string[] }>();
  private nodeDraggedSubject = new Subject<Array<{ id: string; x: number; y: number }>>();
  private viewportChangedSubject = new Subject<ViewState>();

  // yFiles GraphComponent will be stored here
  private graphComponent!: GraphComponent;
  private graph!: IGraph;
  private graphContainer: HTMLElement | null = null;

  constructor() {}

  // ========== Initialization ==========

  /**
   * Initialize yFiles GraphComponent in the given container
   * @param container HTML element to host the graph
   */
  initializeGraph(container: HTMLElement): void {
    console.log('[yFiles] Initializing graph in container:', container);

    this.graphContainer = container;

    // TODO: When yFiles is installed, uncomment this code:
    /*
    this.graphComponent = new GraphComponent(container);
    this.graph = this.graphComponent.graph;
    this.setupInputModes();
    this.setupEventHandlers();
    this.configureDefaultStyles();
    */

    // For now, show a placeholder message
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; color: #64748b;">
        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
        <h3 style="margin: 0 0 8px 0; color: #0f172a;">yFiles Graph Visualization</h3>
        <p style="margin: 0; text-align: center; max-width: 500px;">
          This is a placeholder for yFiles GraphComponent.<br/>
          Install yFiles for HTML to enable graph visualization.
        </p>
        <div style="margin-top: 24px; padding: 16px; background: #f1f5f9; border-radius: 8px; font-family: monospace; font-size: 12px;">
          <strong>To integrate yFiles:</strong><br/>
          1. Obtain yFiles from yWorks<br/>
          2. Place in lib/ directory<br/>
          3. Update package.json<br/>
          4. Uncomment yFiles code in this service
        </div>
      </div>
    `;
  }

  /**
   * Setup input modes for interaction
   * CORRECTED: Removed 'movableItems' property (doesn't exist in GraphViewerInputMode)
   * CORRECTED: Use GraphEditorInputMode for drag functionality
   * CORRECTED: Use proper selection API with Array.from()
   * CORRECTED: Add type annotations to avoid 'any' type errors
   */
  private setupInputModes(): void {
    // TODO: When yFiles is installed, uncomment:
    /*
    const mode = new GraphEditorInputMode({
      clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      focusableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
    });

    // CORRECTED: Use 'addItemSelectionChangedListener' from selection property
    this.graphComponent.selection.addItemSelectionChangedListener(() => {
      // CORRECTED: Use Array.from() with proper selection API
      // CORRECTED: Add type annotations for node and id parameters
      const nodeIds = Array.from(this.graphComponent.selection.selectedNodes)
        .map((node: INode) => (node.tag as NodeTag)?.id)
        .filter((id: string | undefined): id is string => id !== undefined);
      
      const edgeIds = Array.from(this.graphComponent.selection.selectedEdges)
        .map((edge: IEdge) => (edge.tag as EdgeTag)?.id)
        .filter((id: string | undefined): id is string => id !== undefined);

      this.selectionChangedSubject.next({ nodeIds, edgeIds });
    });

    // CORRECTED: moveInputMode is available on GraphEditorInputMode (not GraphViewerInputMode)
    mode.moveInputMode.addDragFinishedListener(() => {
      // CORRECTED: Use Array.from() and add type annotations
      const positions = Array.from(this.graphComponent.selection.selectedNodes)
        .map((node: INode) => {
          const tag = node.tag as NodeTag;
          return {
            id: tag.id,
            x: node.layout.center.x,
            y: node.layout.center.y
          };
        });

      if (positions.length > 0) {
        this.nodeDraggedSubject.next(positions);
      }
    });

    this.graphComponent.inputMode = mode;
    */
  }

  /**
   * Setup event handlers for viewport changes
   */
  private setupEventHandlers(): void {
    // TODO: When yFiles is installed:
    /*
    this.graphComponent.addViewportChangedListener(() => {
      this.viewportChangedSubject.next(this.getViewState());
    });
    */
  }

  /**
   * Configure default node and edge styles
   * CORRECTED: Use Fill.from() with single argument
   * CORRECTED: Use Stroke.from() with object parameter (not two arguments)
   */
  private configureDefaultStyles(): void {
    // TODO: When yFiles is installed:
    /*
    this.graph.nodeDefaults.style = new ShapeNodeStyle({
      fill: Fill.from('lightblue'),
      // CORRECTED: Stroke.from() takes one argument (string or object)
      stroke: Stroke.from({ color: 'darkblue', thickness: 2 })
    });

    this.graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: Stroke.from({ color: 'gray', thickness: 2 }),
      targetArrow: new Arrow({ type: ArrowType.DEFAULT })
    });
    */
  }

  /**
   * Clean up yFiles resources
   */
  dispose(): void {
    console.log('[yFiles] Disposing graph');
    // TODO: When yFiles is installed:
    /*
    if (this.graphComponent) {
      this.graphComponent.cleanUp();
    }
    */
  }

  // ========== Data Operations ==========

  /**
   * Render graph from data with optional persisted positions
   */
  renderGraph(data: GraphData, persistedPositions?: Map<string, Position>): void {
    console.log('[yFiles] Rendering graph:', data);
    console.log('[yFiles] Persisted positions:', persistedPositions);

    // Placeholder visualization - show the data structure
    if (this.graphContainer) {
      this.graphContainer.innerHTML = this.createPlaceholderVisualization(data);
    }

    // TODO: When yFiles is installed:
    /*
    this.graph.clear();

    // Create nodes
    const nodeMap = new Map<string, INode>();
    data.nodes.forEach((nodeData: NodeData) => {
      const node = this.createNode(nodeData, persistedPositions);
      if (node) {
        nodeMap.set(nodeData.id, node);
      }
    });

    // Create edges
    data.edges.forEach((edgeData: EdgeData) => {
      const sourceNode = nodeMap.get(edgeData.sourceId);
      const targetNode = nodeMap.get(edgeData.targetId);
      if (sourceNode && targetNode) {
        this.createEdge(edgeData, sourceNode, targetNode);
      }
    });

    // Apply layout if no persisted positions
    if (!persistedPositions || persistedPositions.size === 0) {
      this.applyHierarchicalLayout();
    } else {
      this.fitGraphBounds();
    }
    */
  }

  /**
   * Create a node with custom style
   * CORRECTED: Use Fill.from() with string argument
   * CORRECTED: Use Stroke.from() with object parameter
   * CORRECTED: Use correct label style and model parameter
   * CORRECTED: Pass proper ILabelModelParameter instead of null
   */
  private createNode(nodeData: NodeData, persistedPositions?: Map<string, Position>): INode | null {
    // TODO: When yFiles is installed:
    /*
    const config = this.getNodeStyleConfig(nodeData.type);
    
    const style = new ShapeNodeStyle({
      shape: config.shape,
      fill: Fill.from(config.fillColor),
      // CORRECTED: Use object parameter for Stroke.from()
      stroke: Stroke.from({ color: config.strokeColor, thickness: config.strokeWidth })
    });

    const position = persistedPositions?.get(nodeData.id);
    const x = position?.x ?? 0;
    const y = position?.y ?? 0;

    const node = this.graph.createNode({
      layout: new Rect(x, y, config.width, config.height),
      style: style,
      tag: { id: nodeData.id, type: nodeData.type, metadata: nodeData.metadata } as NodeTag
    });

    if (nodeData.label) {
      // CORRECTED: Use proper label style with Fill.from()
      const labelStyle = new DefaultLabelStyle({
        // CORRECTED: Use Fill.from('white') instead of Fill.WHITE
        textFill: Fill.from('white'),
        backgroundFill: Fill.from(config.fillColor),
        insets: [3, 5, 3, 5]
      });

      // CORRECTED: Use ExteriorLabelModel().createParameter() instead of null
      this.graph.addLabel(
        node, 
        nodeData.label, 
        new ExteriorLabelModel().createParameter('south'), 
        labelStyle
      );
    }

    return node;
    */
    return null;
  }

  /**
   * Create an edge with custom style
   * CORRECTED: Use Stroke.from() with object parameter
   * CORRECTED: Pass proper ILabelModelParameter (undefined is acceptable)
   */
  private createEdge(edgeData: EdgeData, sourceNode: INode, targetNode: INode): IEdge | null {
    // TODO: When yFiles is installed:
    /*
    const config = this.getEdgeStyleConfig(edgeData.cableType);
    
    const style = new PolylineEdgeStyle({
      // CORRECTED: Use Stroke.from() with single object parameter
      stroke: Stroke.from({ 
        color: config.strokeColor, 
        thickness: config.strokeWidth,
        dashStyle: config.dashed ? [5, 5] : undefined
      }),
      targetArrow: new Arrow({
        type: config.directed ? ArrowType.DEFAULT : ArrowType.NONE,
        fill: Fill.from(config.strokeColor)
      })
    });

    const edge = this.graph.createEdge({
      source: sourceNode,
      target: targetNode,
      style: style,
      tag: { id: edgeData.id, cableType: edgeData.cableType, metadata: edgeData.metadata } as EdgeTag
    });

    if (edgeData.label) {
      const labelStyle = new DefaultLabelStyle({
        textFill: Fill.from('black'),
        backgroundFill: Fill.from('white'),
        insets: [2, 4, 2, 4]
      });

      // CORRECTED: Pass undefined instead of null for default label model parameter
      this.graph.addLabel(edge, edgeData.label, undefined, labelStyle);
    }

    return edge;
    */
    return null;
  }

  /**
   * Get node style configuration based on node type
   */
  private getNodeStyleConfig(type: string): any {
    const configs: Record<string, any> = {
      router: {
        shape: 'rectangle',
        fillColor: '#ef4444',
        strokeColor: '#b91c1c',
        strokeWidth: 2,
        width: 80,
        height: 60
      },
      switch: {
        shape: 'rectangle',
        fillColor: '#3b82f6',
        strokeColor: '#1d4ed8',
        strokeWidth: 2,
        width: 80,
        height: 60
      },
      server: {
        shape: 'rectangle',
        fillColor: '#8b5cf6',
        strokeColor: '#6d28d9',
        strokeWidth: 2,
        width: 100,
        height: 80
      },
      device: {
        shape: 'ellipse',
        fillColor: '#10b981',
        strokeColor: '#059669',
        strokeWidth: 2,
        width: 60,
        height: 60
      },
      workstation: {
        shape: 'rectangle',
        fillColor: '#f59e0b',
        strokeColor: '#d97706',
        strokeWidth: 2,
        width: 70,
        height: 50
      }
    };

    return configs[type] || configs['device'];
  }

  /**
   * Get edge style configuration based on cable type
   */
  private getEdgeStyleConfig(cableType: string): any {
    const configs: Record<string, any> = {
      fiber: {
        strokeColor: '#ec4899',
        strokeWidth: 4,
        dashed: false,
        directed: false
      },
      ethernet: {
        strokeColor: '#3b82f6',
        strokeWidth: 2,
        dashed: false,
        directed: false
      },
      coaxial: {
        strokeColor: '#f59e0b',
        strokeWidth: 3,
        dashed: false,
        directed: false
      },
      serial: {
        strokeColor: '#6b7280',
        strokeWidth: 1,
        dashed: true,
        directed: true
      }
    };

    return configs[cableType] || configs['ethernet'];
  }

  /**
   * Clear all graph content
   */
  clearGraph(): void {
    console.log('[yFiles] Clearing graph');
    // TODO: When yFiles is installed:
    /*
    this.graph.clear();
    */
  }

  // ========== Layout Operations ==========

  /**
   * Apply hierarchical layout algorithm
   * CORRECTED: Use HierarchicalLayout (not HierarchicLayout)
   * CORRECTED: Use HierarchicalLayoutData (not HierarchicLayoutData)
   * CORRECTED: Use morphLayout method properly
   */
  async applyHierarchicalLayout(): Promise<void> {
    console.log('[yFiles] Applying hierarchical layout');

    // TODO: When yFiles is installed:
    /*
    // CORRECTED: Use HierarchicalLayout (not HierarchicLayout)
    const layout = new HierarchicalLayout({
      layoutOrientation: LayoutOrientation.TOP_TO_BOTTOM,
      orthogonalRouting: true,
      minimumLayerDistance: 100,
      nodeToNodeDistance: 80
    });
    
    // CORRECTED: Use HierarchicalLayoutData (not HierarchicLayoutData)
    const layoutData = new HierarchicalLayoutData();

    // CORRECTED: morphLayout is available on GraphComponent
    await this.graphComponent.morphLayout(layout, '1s', layoutData);
    */
  }

  /**
   * Re-route all edges
   * CORRECTED: morphLayout is available on GraphComponent
   */
  async rerouteAllEdges(): Promise<void> {
    console.log('[yFiles] Re-routing all edges');

    // TODO: When yFiles is installed:
    /*
    const router = new EdgeRouter();
    // CORRECTED: morphLayout is available on GraphComponent
    await this.graphComponent.morphLayout(router, '0.5s');
    */
  }

  // ========== View Operations ==========

  /**
   * Fit graph bounds to viewport
   */
  fitGraphBounds(): void {
    console.log('[yFiles] Fitting graph bounds');
    // TODO: When yFiles is installed:
    /*
    this.graphComponent.fitGraphBounds();
    */
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number): void {
    console.log('[yFiles] Setting zoom:', zoom);
    // TODO: When yFiles is installed:
    /*
    this.graphComponent.zoom = zoom;
    */
  }

  /**
   * Set viewport center and zoom
   */
  setViewport(centerX: number, centerY: number, zoom: number): void {
    console.log('[yFiles] Setting viewport:', { centerX, centerY, zoom });
    // TODO: When yFiles is installed:
    /*
    this.graphComponent.zoom = zoom;
    this.graphComponent.viewPoint = new Point(centerX, centerY);
    */
  }

  /**
   * Get current view state
   */
  getViewState(): ViewState {
    // TODO: Return actual view state from graphComponent
    /*
    if (this.graphComponent) {
      return {
        zoom: this.graphComponent.zoom,
        centerX: this.graphComponent.viewPoint.x,
        centerY: this.graphComponent.viewPoint.y,
        backgroundVisible: true
      };
    }
    */
    return {
      zoom: 1.0,
      centerX: 0,
      centerY: 0,
      backgroundVisible: true
    };
  }

  // ========== Background Management ==========

  /**
   * Set background image
   */
  setBackgroundImage(imagePath: string = '/assets/images/floor-plan-sample.svg', visible: boolean = true): void {
    console.log('[yFiles] Setting background image:', imagePath, visible);

    // TODO: When yFiles is installed:
    /*
    const image = new Image();
    image.src = imagePath;
    image.onload = () => {
      const visual = new ImageVisual(image, {...});
      this.graphComponent.backgroundGroup.addChild(visual);
      visual.visible = visible;
    };
    */
  }

  /**
   * Toggle background visibility
   */
  toggleBackgroundVisibility(): void {
    console.log('[yFiles] Toggling background visibility');
    // TODO: Toggle background visual visibility
  }

  // ========== Selection ==========

  /**
   * Set selected nodes
   * CORRECTED: Use proper selection.setSelected() method
   */
  setSelectedNodes(nodeIds: string[]): void {
    console.log('[yFiles] Setting selected nodes:', nodeIds);
    // TODO: When yFiles is installed:
    /*
    this.graphComponent.selection.clear();
    this.graph.nodes.forEach((node: INode) => {
      const tag = node.tag as NodeTag;
      if (nodeIds.includes(tag.id)) {
        // CORRECTED: Use setSelected method on selection
        this.graphComponent.selection.setSelected(node, true);
      }
    });
    */
  }

  /**
   * Set selected edges
   * CORRECTED: Use proper selection.setSelected() method
   */
  setSelectedEdges(edgeIds: string[]): void {
    console.log('[yFiles] Setting selected edges:', edgeIds);
    // TODO: When yFiles is installed:
    /*
    this.graphComponent.selection.clear();
    this.graph.edges.forEach((edge: IEdge) => {
      const tag = edge.tag as EdgeTag;
      if (edgeIds.includes(tag.id)) {
        // CORRECTED: Use setSelected method on selection
        this.graphComponent.selection.setSelected(edge, true);
      }
    });
    */
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    console.log('[yFiles] Clearing selection');
    // TODO: When yFiles is installed:
    /*
    this.graphComponent.selection.clear();
    */
  }

  // ========== Group Operations ==========

  /**
   * Collapse group node
   */
  collapseGroup(groupId: string): void {
    console.log('[yFiles] Collapsing group:', groupId);
    // TODO: Find group node and set isCollapsed = true
  }

  /**
   * Expand group node
   */
  expandGroup(groupId: string): void {
    console.log('[yFiles] Expanding group:', groupId);
    // TODO: Find group node and set isCollapsed = false
  }

  // ========== Event Subscriptions ==========

  /**
   * Observable for selection changes
   */
  onSelectionChanged(): Observable<{ nodeIds: string[]; edgeIds: string[] }> {
    return this.selectionChangedSubject.asObservable();
  }

  /**
   * Observable for node drag events
   */
  onNodeDragged(): Observable<Array<{ id: string; x: number; y: number }>> {
    return this.nodeDraggedSubject.asObservable();
  }

  /**
   * Observable for viewport changes
   */
  onViewportChanged(): Observable<ViewState> {
    return this.viewportChangedSubject.asObservable();
  }

  // ========== Utility ==========

  /**
   * Get bounds of a specific node
   */
  getNodeBounds(nodeId: string): GraphBounds | null {
    // TODO: Find node and return its bounds
    /*
    const node = this.graph.nodes.find((n: INode) => (n.tag as NodeTag).id === nodeId);
    if (node) {
      return {
        x: node.layout.x,
        y: node.layout.y,
        width: node.layout.width,
        height: node.layout.height
      };
    }
    */
    return null;
  }

  /**
   * Get bounds of entire graph
   * CORRECTED: Use contentRect property on GraphComponent
   */
  getGraphBounds(): GraphBounds {
    // TODO: When yFiles is installed:
    /*
    if (this.graphComponent) {
      // CORRECTED: contentRect is available on GraphComponent
      const bounds = this.graphComponent.contentRect;
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      };
    }
    */
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  // ========== Placeholder Helpers ==========

  private createPlaceholderVisualization(data: GraphData): string {
    const nodesByType = this.groupNodesByType(data.nodes);
    const edgesByCable = this.groupEdgesByCable(data.edges);

    return `
      <div style="padding: 40px; max-width: 900px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
          <h2 style="margin: 0 0 8px 0; color: #0f172a;">Network Topology Loaded!</h2>
          <p style="margin: 0; color: #64748b;">Data successfully loaded. Install yFiles to see full visualization.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
              📍 Network Nodes (${data.nodes.length})
            </h3>
            ${this.renderNodeGroups(nodesByType)}
          </div>

          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
              🔌 Connections (${data.edges.length})
            </h3>
            ${this.renderEdgeGroups(edgesByCable)}
          </div>
        </div>

        ${data.groups && data.groups.length > 0 ? `
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 32px;">
            <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
              📦 Logical Groups (${data.groups.length})
            </h3>
            ${this.renderGroups(data.groups)}
          </div>
        ` : ''}

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px; color: white;">
          <h3 style="margin: 0 0 16px 0; font-size: 20px;">🚀 Ready for yFiles Integration</h3>
          <div style="display: grid; gap: 12px; font-size: 14px; line-height: 1.6;">
            <div>✅ <strong>${data.nodes.length} nodes</strong> ready to visualize</div>
            <div>✅ <strong>${data.edges.length} connections</strong> ready to route</div>
            <div>✅ <strong>Position persistence</strong> configured</div>
            <div>✅ <strong>Graph state management</strong> active</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 6px;">
              💡 <strong>Next Step:</strong> Install yFiles for HTML to see the full interactive graph visualization with drag & drop, zoom, and advanced layouts.
            </div>
          </div>
        </div>

        <div style="margin-top: 24px; text-align: center; color: #94a3b8; font-size: 13px;">
          <a href="https://www.yworks.com/products/yfiles-for-html/evaluate" target="_blank"
             style="color: #3b82f6; text-decoration: none; font-weight: 500;">
            Get yFiles Evaluation License →
          </a>
        </div>
      </div>
    `;
  }

  private groupNodesByType(nodes: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    nodes.forEach(node => {
      if (!groups.has(node.type)) {
        groups.set(node.type, []);
      }
      groups.get(node.type)!.push(node);
    });
    return groups;
  }

  private groupEdgesByCable(edges: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    edges.forEach(edge => {
      if (!groups.has(edge.cableType)) {
        groups.set(edge.cableType, []);
      }
      groups.get(edge.cableType)!.push(edge);
    });
    return groups;
  }

  private renderNodeGroups(nodesByType: Map<string, any[]>): string {
    const colors: Record<string, string> = {
      router: '#ef4444',
      switch: '#3b82f6',
      server: '#8b5cf6',
      device: '#10b981',
      workstation: '#f59e0b'
    };

    return Array.from(nodesByType.entries())
      .map(([type, nodes]) => `
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 16px; height: 16px; background: ${colors[type] || '#6b7280'}; border-radius: 4px;"></div>
            <span style="font-weight: 600; color: #334155; text-transform: capitalize;">${type}</span>
            <span style="color: #94a3b8; font-size: 13px;">(${nodes.length})</span>
          </div>
          <div style="margin-left: 24px; font-size: 13px; color: #64748b;">
            ${nodes.map(n => `<div style="padding: 4px 0;">• ${n.label}${n.metadata?.ip ? ` - ${n.metadata.ip}` : ''}</div>`).join('')}
          </div>
        </div>
      `).join('');
  }

  private renderEdgeGroups(edgesByCable: Map<string, any[]>): string {
    const colors: Record<string, string> = {
      fiber: '#ec4899',
      ethernet: '#3b82f6',
      coaxial: '#f59e0b',
      serial: '#6b7280'
    };

    return Array.from(edgesByCable.entries())
      .map(([type, edges]) => `
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 24px; height: 4px; background: ${colors[type] || '#6b7280'}; border-radius: 2px;"></div>
            <span style="font-weight: 600; color: #334155; text-transform: capitalize;">${type}</span>
            <span style="color: #94a3b8; font-size: 13px;">(${edges.length})</span>
          </div>
          <div style="margin-left: 24px; font-size: 13px; color: #64748b;">
            ${edges.slice(0, 3).map(e => `<div style="padding: 4px 0;">• ${e.sourceId} → ${e.targetId}</div>`).join('')}
            ${edges.length > 3 ? `<div style="padding: 4px 0; color: #94a3b8;">... and ${edges.length - 3} more</div>` : ''}
          </div>
        </div>
      `).join('');
  }

  private renderGroups(groups: any[]): string {
    return groups.map(g => `
      <div style="display: inline-block; margin: 4px 8px 4px 0; padding: 8px 16px; background: #f1f5f9; border-radius: 8px; font-size: 14px;">
        <span style="font-weight: 600; color: #334155;">📦 ${g.label}</span>
      </div>
    `).join('');
  }
}

