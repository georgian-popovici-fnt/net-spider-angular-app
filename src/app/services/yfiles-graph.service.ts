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
import { NodeStyleAction, EdgeStyleAction } from '../models/styling-state.model';

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
  Color,
  SvgExport
} from 'yfiles';

// PDF generation
import jsPDF from 'jspdf';

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

    // Setup event handlers
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Selection changed handler
    const handleSelectionChange = () => {
      const nodeIds: string[] = [];
      const edgeIds: string[] = [];

      this.graphComponent.selection.forEach((item: IModelItem) => {
        if (item instanceof INode) {
          const node = item as INode;
          const tag = node.tag as NodeTag;
          if (tag?.id) {
            nodeIds.push(tag.id);
          }
        } else if (item instanceof IEdge) {
          const edge = item as IEdge;
          const tag = edge.tag as EdgeTag;
          if (tag?.id) {
            edgeIds.push(tag.id);
          }
        }
      });

      this.selectionChangedSubject.next({ nodeIds, edgeIds });
    };

    // Listen to selection item-added and item-removed events
    this.graphComponent.selection.addEventListener('item-added', handleSelectionChange);
    this.graphComponent.selection.addEventListener('item-removed', handleSelectionChange);

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
    // Check if data has positions
    const nodesWithPositions = data.nodes.filter(n => n.x !== undefined && n.y !== undefined);

    this.graph.clear();
    this.nodeMap.clear();

    // Create nodes
    data.nodes.forEach(nodeData => {
      const style = this.createNodeStyle(nodeData.type);
      const config = NODE_STYLE_CONFIG[nodeData.type];

      // Determine position
      // PRIORITY: 1. Data file positions (saved), 2. Persisted map (localStorage), 3. Default (0,0)
      let x = 0, y = 0;
      let positionSource = 'default';

      if (nodeData.x !== undefined && nodeData.y !== undefined) {
        // HIGHEST PRIORITY: Use positions from data file (saved layout)
        x = nodeData.x;
        y = nodeData.y;
        positionSource = 'dataFile';
      } else if (persistedPositions?.has(nodeData.id)) {
        // FALLBACK: Use persisted map from localStorage
        const pos = persistedPositions.get(nodeData.id)!;
        x = pos.x;
        y = pos.y;
        positionSource = 'persistedMap';
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

        // Restore bend points if they exist
        if (edgeData.bends && edgeData.bends.length > 0) {
          this.setEdgeBends(edge, edgeData.bends);
        }

        // Add label if present
        if (edgeData.label) {
          this.graph.addLabel(edge, edgeData.label);
        }
      }
    });

    // Fit graph only if no positions were provided
    const shouldFitBounds = nodesWithPositions.length === 0 && (!persistedPositions || persistedPositions.size === 0);

    if (shouldFitBounds) {
      this.fitGraphBounds();
    }
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
      throw new Error('Graph not initialized');
    }

    if (this.graph.nodes.size === 0) {
      return;
    }

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

    // Emit new positions immediately after layout completes
    this.emitNodePositions();
  }

  async rerouteAllEdges(): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Graph not initialized');
    }

    if (this.graph.edges.size === 0) {
      return;
    }

    const router = new EdgeRouter();
    await this.graphComponent.applyLayoutAnimated({
      layout: router,
      animationDuration: '0.5s'
    });

    // Note: Edge bends will be captured when user saves
    // No need to emit here as we don't have an edge bend observer yet
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
      return;
    }

    // Filter nodes
    this.graph.nodes.forEach((node: INode) => {
      const tag = node.tag as NodeTag;
      if (tag?.id) {
        const isVisible = nodePredicate(tag.id);
        this.setNodeVisibility(node, isVisible);
      }
    });

    // Filter edges - hide edges connected to hidden nodes
    this.graph.edges.forEach((edge: IEdge) => {
      const tag = edge.tag as EdgeTag;
      if (tag?.id) {
        const isVisible = edgePredicate(tag.id);
        this.setEdgeVisibility(edge, isVisible);
      }
    });
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
  }

  // ========== Styling Operations ==========

  /**
   * Apply dynamic styling to a node based on custom style actions
   */
  applyNodeStyle(nodeId: string, styleAction: NodeStyleAction): void {
    if (!this.isInitialized()) return;

    const node = this.nodeMap.get(nodeId);
    if (!node) {
      return;
    }

    const tag = node.tag as NodeTag;
    const baseConfig = NODE_STYLE_CONFIG[tag.data.type as NodeType];

    // Create custom style merging base config with overrides
    const customStyle = new ShapeNodeStyle({
      shape: styleAction.shape
        ? (styleAction.shape === 'ellipse' ? 'ellipse' : 'round-rectangle')
        : (baseConfig.shape === 'ellipse' ? 'ellipse' : 'round-rectangle'),
      fill: styleAction.fillColor || baseConfig.fillColor,
      stroke: `${styleAction.strokeWidth || baseConfig.strokeWidth}px ${styleAction.strokeColor || baseConfig.strokeColor}`
    });

    this.graph.setStyle(node, customStyle);
  }

  /**
   * Apply dynamic styling to an edge based on custom style actions
   */
  applyEdgeStyle(edgeId: string, styleAction: EdgeStyleAction): void {
    if (!this.isInitialized()) return;

    // Find edge by ID using Array.from to enable find()
    const edgesArray = Array.from(this.graph.edges);
    const targetEdge = edgesArray.find((edge: IEdge) => {
      const tag = edge.tag as EdgeTag;
      return tag?.id === edgeId;
    });

    if (!targetEdge) {
      return;
    }

    const tag = targetEdge.tag as EdgeTag;
    const baseConfig = EDGE_STYLE_CONFIG[tag.data.cableType as CableType];

    // Build stroke value
    let strokeValue = `${styleAction.strokeWidth || baseConfig.strokeWidth}px ${styleAction.strokeColor || baseConfig.strokeColor}`;
    if (styleAction.strokeDashArray && styleAction.strokeDashArray.length > 0) {
      strokeValue = `${styleAction.strokeWidth || baseConfig.strokeWidth}px dashed ${styleAction.strokeColor || baseConfig.strokeColor}`;
    }

    // Create custom edge style
    const customStyle = new PolylineEdgeStyle({
      stroke: strokeValue,
      targetArrow: `${styleAction.strokeColor || baseConfig.strokeColor} triangle`
    });

    this.graph.setStyle(targetEdge, customStyle);
  }

  /**
   * Reset node to original default style
   */
  resetNodeStyle(nodeId: string): void {
    if (!this.isInitialized()) return;

    const node = this.nodeMap.get(nodeId);
    if (!node) {
      return;
    }

    const tag = node.tag as NodeTag;
    const defaultStyle = this.createNodeStyle(tag.data.type as NodeType);
    this.graph.setStyle(node, defaultStyle);
  }

  /**
   * Reset edge to original default style
   */
  resetEdgeStyle(edgeId: string): void {
    if (!this.isInitialized()) return;

    // Find edge by ID using Array.from to enable find()
    const edgesArray = Array.from(this.graph.edges);
    const targetEdge = edgesArray.find((edge: IEdge) => {
      const tag = edge.tag as EdgeTag;
      return tag?.id === edgeId;
    });

    if (!targetEdge) {
      return;
    }

    const tag = targetEdge.tag as EdgeTag;
    const defaultStyle = this.createEdgeStyle(tag.data.cableType as CableType);
    this.graph.setStyle(targetEdge, defaultStyle);
  }

  /**
   * Reset all elements to default styles
   */
  resetAllStyles(): void {
    if (!this.isInitialized()) return;

    // Reset all nodes
    this.graph.nodes.forEach((node: INode) => {
      const tag = node.tag as NodeTag;
      if (tag?.id) {
        this.resetNodeStyle(tag.id);
      }
    });

    // Reset all edges
    this.graph.edges.forEach((edge: IEdge) => {
      const tag = edge.tag as EdgeTag;
      if (tag?.id) {
        this.resetEdgeStyle(tag.id);
      }
    });
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

  /**
   * Get all current node positions from yFiles
   */
  getAllNodePositions(): Array<{ id: string; x: number; y: number }> {
    const positions: Array<{ id: string; x: number; y: number }> = [];

    this.nodeMap.forEach((node, id) => {
      positions.push({
        id,
        x: node.layout.x,
        y: node.layout.y
      });
    });

    return positions;
  }

  /**
   * Get all edge bend points from yFiles
   */
  getAllEdgeBends(): Array<{ id: string; bends: Array<{ x: number; y: number }> }> {
    const edgeBends: Array<{ id: string; bends: Array<{ x: number; y: number }> }> = [];

    this.graph.edges.forEach((edge: IEdge) => {
      const tag = edge.tag as EdgeTag;
      if (tag?.id) {
        const bends = this.getEdgeBends(edge);
        if (bends.length > 0) {
          edgeBends.push({
            id: tag.id,
            bends: bends
          });
        }
      }
    });

    return edgeBends;
  }

  /**
   * Get bend points from a specific edge
   */
  private getEdgeBends(edge: IEdge): Array<{ x: number; y: number }> {
    const bends: Array<{ x: number; y: number }> = [];

    // Get the edge's bend collection
    edge.bends.forEach(bend => {
      bends.push({
        x: bend.location.x,
        y: bend.location.y
      });
    });

    return bends;
  }

  /**
   * Set bend points for a specific edge
   */
  private setEdgeBends(edge: IEdge, bends: Array<{ x: number; y: number }>): void {
    // Clear existing bends
    this.graph.clearBends(edge);

    // Add new bends
    bends.forEach(bend => {
      this.graph.addBend(edge, { x: bend.x, y: bend.y });
    });
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

  // ========== Export Functions ==========

  /**
   * Export graph as PNG image
   */
  async exportAsPNG(scale: number = 2): Promise<void> {
    // Get the full graph bounds with some margin
    const bounds = this.getExportBounds();

    // Export to SVG first
    const svgExport = new SvgExport(bounds);
    const svgElement = await svgExport.exportSvgAsync(this.graphComponent);

    // Convert SVG to PNG using canvas
    const blob = await this.svgToBlob(svgElement, bounds, scale);

    // Download the image
    this.downloadBlob(blob, 'network-diagram.png');
  }

  /**
   * Export graph as SVG image
   */
  async exportAsSVG(): Promise<void> {
    // Get the full graph bounds with some margin
    const bounds = this.getExportBounds();

    // Create SvgExport
    const svgExport = new SvgExport(bounds);

    // Export to SVG element
    const svgElement = await svgExport.exportSvgAsync(this.graphComponent);

    // Convert to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    this.downloadBlob(blob, 'network-diagram.svg');
  }

  /**
   * Export graph data as JSON
   */
  exportAsJSON(graphData: GraphData): void {
    // Include current positions in the export
    const exportData = {
      ...graphData,
      nodes: graphData.nodes.map(node => {
        const yNode = this.nodeMap.get(node.id);
        if (yNode) {
          return {
            ...node,
            x: yNode.layout.x,
            y: yNode.layout.y
          };
        }
        return node;
      }),
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        application: 'NetSpider Pilot'
      }
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadBlob(blob, 'network-diagram.json');
  }

  /**
   * Export graph as PDF
   */
  async exportAsPDF(): Promise<void> {
    // Get the full graph bounds with some margin
    const bounds = this.getExportBounds();

    // Export to SVG first
    const svgExport = new SvgExport(bounds);
    const svgElement = await svgExport.exportSvgAsync(this.graphComponent);

    // Convert to PNG blob with high quality (3x scale for PDF)
    const blob = await this.svgToBlob(svgElement, bounds, 3);

    // Convert to base64 for PDF generation
    const base64 = await this.blobToBase64(blob);

    // Determine orientation based on aspect ratio
    const orientation = bounds.width > bounds.height ? 'landscape' : 'portrait';

    // Create PDF with jsPDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: [bounds.width, bounds.height]
    });

    // Add image to PDF
    pdf.addImage(
      base64,
      'PNG',
      0,
      0,
      bounds.width,
      bounds.height,
      undefined,
      'FAST'
    );

    // Save PDF
    pdf.save('network-diagram.pdf');
  }

  /**
   * Helper: Download blob as file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Helper: Get export bounds with margin
   */
  private getExportBounds(): Rect {
    // Get the bounding box of all graph elements
    const contentBounds = this.graphComponent.contentBounds;

    // Add margin around the content (20px on each side)
    const margin = 20;
    return new Rect(
      contentBounds.x - margin,
      contentBounds.y - margin,
      contentBounds.width + (2 * margin),
      contentBounds.height + (2 * margin)
    );
  }

  /**
   * Helper: Convert SVG element to PNG blob
   */
  private svgToBlob(svgElement: SVGElement, bounds: Rect, scale: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Serialize SVG to string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        // Calculate canvas dimensions with scale
        const width = bounds.width * scale;
        const height = bounds.height * scale;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // Create image from SVG
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          // Draw image scaled to canvas size
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/png', 1.0); // Maximum quality
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image'));
        };

        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Helper: Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
