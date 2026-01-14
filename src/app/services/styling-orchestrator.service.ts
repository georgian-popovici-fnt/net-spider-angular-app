/**
 * StylingOrchestratorService - Coordinates styling rule application
 * Connects StylingEngineService with YFilesGraphService
 */

import { Injectable } from '@angular/core';
import { StylingEngineService } from './styling-engine.service';
import { YFilesGraphService } from './yfiles-graph.service';
import { GraphStateService } from './graph-state.service';
import { NodeData, EdgeData } from '../models/graph-data.model';

@Injectable({
  providedIn: 'root'
})
export class StylingOrchestratorService {
  constructor(
    private stylingEngine: StylingEngineService,
    private yfilesService: YFilesGraphService,
    private graphState: GraphStateService
  ) {

    // Subscribe to styling rule changes
    this.stylingEngine.rulesChanged$.subscribe(() => {
      this.applyStylingToGraph();
    });

    // Subscribe to graph data changes
    this.graphState.graphData$.subscribe(data => {
      if (data) {
        // Add a small delay to ensure graph is rendered before applying styles
        setTimeout(() => this.applyStylingToGraph(), 200);
      }
    });
  }

  /**
   * Apply all active styling rules to the current graph
   */
  private applyStylingToGraph(): void {
    if (!this.yfilesService.isInitialized()) {
      return;
    }

    const graphData = this.graphState.getCurrentGraphData();
    if (!graphData) {
      return;
    }

    // Reset all to defaults first
    this.yfilesService.resetAllStyles();

    let appliedCount = 0;

    // Apply styling rules to nodes
    graphData.nodes.forEach((node: NodeData) => {
      const styleAction = this.stylingEngine.evaluateNodeRules(node);
      if (styleAction) {
        this.yfilesService.applyNodeStyle(node.id, styleAction);
        appliedCount++;
      }
    });

    // Apply styling rules to edges
    graphData.edges.forEach((edge: EdgeData) => {
      const styleAction = this.stylingEngine.evaluateEdgeRules(edge);
      if (styleAction) {
        this.yfilesService.applyEdgeStyle(edge.id, styleAction);
        appliedCount++;
      }
    });

    // Update applied count in styling engine
    this.stylingEngine.updateAppliedCount(appliedCount);

    }

  /**
   * Reset all styling and clear rules
   */
  resetAllStyling(): void {
    this.yfilesService.resetAllStyles();
    this.stylingEngine.clearAllRules();

  }

  /**
   * Manually trigger style reapplication (useful for debugging)
   */
  reapplyStyles(): void {
    this.applyStylingToGraph();
  }
}
