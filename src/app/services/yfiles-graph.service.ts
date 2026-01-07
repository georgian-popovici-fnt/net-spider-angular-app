/**
 * YFilesGraphService - Complete encapsulation of yFiles for HTML APIs
 *
 * PLACEHOLDER: This service is designed for yFiles integration.
 * Once yFiles library is installed, this service will:
 * - Initialize and manage GraphComponent
 * - Render nodes and edges with custom styles
 * - Handle user interactions (drag, select, pan, zoom)
 * - Apply layout algorithms (hierarchical, organic, etc.)
 * - Manage parallel edge routing
 * - Handle background images
 * - Support group nodes with collapse/expand
 *
 * For now, this is a placeholder that demonstrates the architecture.
 * UI components will never directly import yFiles types - all interaction
 * happens through this service using domain models.
 */

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { GraphData } from '../models/graph-data.model';
import { ViewState, Position, GraphBounds } from '../models/view-state.model';

@Injectable({
  providedIn: 'root'
})
export class YFilesGraphService {
  // Event subjects for communication with other services
  private selectionChangedSubject = new Subject<{ nodeIds: string[]; edgeIds: string[] }>();
  private nodeDraggedSubject = new Subject<Array<{ id: string; x: number; y: number }>>();
  private viewportChangedSubject = new Subject<ViewState>();

  // yFiles GraphComponent will be stored here
  // private graphComponent: GraphComponent;
  // private graph: IGraph;

  constructor() {}

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

  // ========== Initialization ==========

  /**
   * Initialize yFiles GraphComponent in the given container
   * @param container HTML element to host the graph
   */
  initializeGraph(container: HTMLElement): void {
    console.log('[yFiles Placeholder] Initializing graph in container:', container);

    this.graphContainer = container;

    // TODO: When yFiles is installed:
    // this.graphComponent = new GraphComponent(container);
    // this.graph = this.graphComponent.graph;
    // this.setupInputModes();
    // this.setupEventHandlers();
    // this.configureDefaultStyles();

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
          4. Implement yFiles integration in this service
        </div>
      </div>
    `;
  }

  /**
   * Clean up yFiles resources
   */
  dispose(): void {
    console.log('[yFiles Placeholder] Disposing graph');
    // TODO: this.graphComponent.cleanUp();
  }

  // ========== Data Operations ==========

  /**
   * Render graph from data with optional persisted positions
   */
  renderGraph(data: GraphData, persistedPositions?: Map<string, Position>): void {
    console.log('[yFiles Placeholder] Rendering graph:', data);
    console.log('[yFiles Placeholder] Persisted positions:', persistedPositions);

    // Placeholder visualization - show the data structure
    if (this.graphContainer) {
      this.graphContainer.innerHTML = this.createPlaceholderVisualization(data);
    }

    // TODO: When yFiles is installed:
    // 1. Clear existing graph
    // 2. Create nodes with custom styles based on NodeType
    // 3. Create edges with custom styles based on CableType
    // 4. Apply persisted positions or use auto-layout
    // 5. Configure parallel edge routing
    // 6. Fit graph to viewport if no persisted positions
  }

  private graphContainer: HTMLElement | null = null;

  /**
   * Clear all graph content
   */
  clearGraph(): void {
    console.log('[yFiles Placeholder] Clearing graph');
    // TODO: this.graph.clear();
  }

  // ========== Layout Operations ==========

  /**
   * Apply hierarchical layout algorithm
   */
  async applyHierarchicalLayout(): Promise<void> {
    console.log('[yFiles Placeholder] Applying hierarchical layout');

    // TODO: When yFiles is installed:
    // const layout = new HierarchicLayout({
    //   layoutOrientation: LayoutOrientation.TOP_TO_BOTTOM,
    //   orthogonalRouting: true,
    //   minimumLayerDistance: 100,
    //   nodeToNodeDistance: 80
    // });
    // await this.graphComponent.morphLayout(layout, '1s');
  }

  /**
   * Re-route all edges
   */
  async rerouteAllEdges(): Promise<void> {
    console.log('[yFiles Placeholder] Re-routing all edges');

    // TODO: When yFiles is installed:
    // const router = new EdgeRouter();
    // await this.graphComponent.morphLayout(router, '0.5s');
  }

  // ========== View Operations ==========

  /**
   * Fit graph bounds to viewport
   */
  fitGraphBounds(): void {
    console.log('[yFiles Placeholder] Fitting graph bounds');
    // TODO: this.graphComponent.fitGraphBounds();
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number): void {
    console.log('[yFiles Placeholder] Setting zoom:', zoom);
    // TODO: this.graphComponent.zoom = zoom;
  }

  /**
   * Set viewport center and zoom
   */
  setViewport(centerX: number, centerY: number, zoom: number): void {
    console.log('[yFiles Placeholder] Setting viewport:', { centerX, centerY, zoom });
    // TODO:
    // this.graphComponent.zoom = zoom;
    // this.graphComponent.viewPoint = new Point(centerX, centerY);
  }

  /**
   * Get current view state
   */
  getViewState(): ViewState {
    // TODO: Return actual view state from graphComponent
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
    console.log('[yFiles Placeholder] Setting background image:', imagePath, visible);

    // TODO: When yFiles is installed:
    // const image = new Image();
    // image.src = imagePath;
    // image.onload = () => {
    //   const visual = new ImageVisual(image, {...});
    //   this.graphComponent.backgroundGroup.addChild(visual);
    //   visual.visible = visible;
    // };
  }

  /**
   * Toggle background visibility
   */
  toggleBackgroundVisibility(): void {
    console.log('[yFiles Placeholder] Toggling background visibility');
    // TODO: Toggle background visual visibility
  }

  // ========== Selection ==========

  /**
   * Set selected nodes
   */
  setSelectedNodes(nodeIds: string[]): void {
    console.log('[yFiles Placeholder] Setting selected nodes:', nodeIds);
    // TODO: Update GraphComponent selection
  }

  /**
   * Set selected edges
   */
  setSelectedEdges(edgeIds: string[]): void {
    console.log('[yFiles Placeholder] Setting selected edges:', edgeIds);
    // TODO: Update GraphComponent selection
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    console.log('[yFiles Placeholder] Clearing selection');
    // TODO: this.graphComponent.selection.clear();
  }

  // ========== Group Operations ==========

  /**
   * Collapse group node
   */
  collapseGroup(groupId: string): void {
    console.log('[yFiles Placeholder] Collapsing group:', groupId);
    // TODO: Find group node and set isCollapsed = true
  }

  /**
   * Expand group node
   */
  expandGroup(groupId: string): void {
    console.log('[yFiles Placeholder] Expanding group:', groupId);
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
    return null;
  }

  /**
   * Get bounds of entire graph
   */
  getGraphBounds(): GraphBounds {
    // TODO: Return graph content bounds
    return { x: 0, y: 0, width: 800, height: 600 };
  }
}
