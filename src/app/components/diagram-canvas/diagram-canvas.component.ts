import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { YFilesGraphService } from '../../services/yfiles-graph.service';
import { GraphStateService } from '../../services/graph-state.service';
import { FilterEngineService } from '../../services/filter-engine.service';

@Component({
  selector: 'app-diagram-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagram-canvas.component.html',
  styleUrl: './diagram-canvas.component.scss'
})
export class DiagramCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('graphContainer', { static: true }) containerRef!: ElementRef;

  private destroy$ = new Subject<void>();

  constructor(
    private yFilesService: YFilesGraphService,
    private graphState: GraphStateService,
    private filterEngine: FilterEngineService
  ) {}

  ngAfterViewInit(): void {
    // Initialize yFiles GraphComponent
    this.yFilesService.initializeGraph(this.containerRef.nativeElement);
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    // Subscribe to graph data changes and render
    this.graphState.graphData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data && data.nodes && data.nodes.length > 0) {
          // Check if data already has positions (from saved file)
          const hasPositionsInData = data.nodes.some(n => n.x !== undefined && n.y !== undefined);

          // Only pass persisted positions map if data doesn't have positions
          // This ensures file data always takes priority
          const positions = hasPositionsInData ? undefined : this.graphState.getPersistedPositions();

          this.yFilesService.renderGraph(data, positions);

          // Update filter statistics
          this.updateFilterStats();

          // Apply current filters to newly rendered graph
          setTimeout(() => {
            this.applyCurrentFilters();
          }, 100);
        } else {
        }
      });

    // Listen to yFiles selection events and update state
    this.yFilesService.onSelectionChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe(selection => {
        this.graphState.setSelection(selection.nodeIds, selection.edgeIds);
      });

    // Listen to drag events and persist positions (debounced)
    this.yFilesService.onNodeDragged()
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500)
      )
      .subscribe(positions => {
        positions.forEach(pos => {
          this.graphState.updateNodePosition(pos.id, pos.x, pos.y);
        });
        this.graphState.savePositionsToStorage();
      });

    // Listen to filter changes and apply them
    this.filterEngine.filterChanged$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300) // Debounce to avoid too many updates while typing
      )
      .subscribe(() => {
        this.applyCurrentFilters();
      });
  }

  private applyCurrentFilters(): void {
    const graphData = this.graphState.getCurrentGraphData();
    if (!graphData) {
      console.warn('[DiagramCanvas] No graph data available for filtering');
      return;
    }

    // Create predicate functions
    const nodePredicate = (nodeId: string): boolean => {
      const node = graphData.nodes.find(n => n.id === nodeId);
      if (!node) return true;
      const passes = this.filterEngine.nodePassesFilters(node);
      return passes;
    };

    const edgePredicate = (edgeId: string): boolean => {
      const edge = graphData.edges.find(e => e.id === edgeId);
      if (!edge) return true;

      const sourceNode = graphData.nodes.find(n => n.id === edge.sourceId);
      const targetNode = graphData.nodes.find(n => n.id === edge.targetId);

      return this.filterEngine.edgePassesFilters(edge, sourceNode, targetNode);
    };

    // Apply filters
    if (this.filterEngine.hasActiveFilters()) {
      this.yFilesService.applyFilter(nodePredicate, edgePredicate);
    } else {
      this.yFilesService.clearFilter();
    }

    // Update statistics
    this.updateFilterStats();
  }

  private updateFilterStats(): void {
    const graphData = this.graphState.getCurrentGraphData();
    if (!graphData) return;

    const totalNodes = graphData.nodes.length;
    const totalEdges = graphData.edges.length;

    let visibleNodes = 0;
    let visibleEdges = 0;

    // Count visible nodes
    graphData.nodes.forEach(node => {
      if (this.filterEngine.nodePassesFilters(node)) {
        visibleNodes++;
      }
    });

    // Count visible edges
    graphData.edges.forEach(edge => {
      const sourceNode = graphData.nodes.find(n => n.id === edge.sourceId);
      const targetNode = graphData.nodes.find(n => n.id === edge.targetId);
      if (this.filterEngine.edgePassesFilters(edge, sourceNode, targetNode)) {
        visibleEdges++;
      }
    });

    this.filterEngine.updateStats({
      totalNodes,
      visibleNodes,
      hiddenNodes: totalNodes - visibleNodes,
      totalEdges,
      visibleEdges,
      hiddenEdges: totalEdges - visibleEdges
    });
  }

  zoomIn(): void {
    const current = this.yFilesService.getViewState();
    this.yFilesService.setZoom(current.zoom * 1.2);
  }

  zoomOut(): void {
    const current = this.yFilesService.getViewState();
    this.yFilesService.setZoom(current.zoom / 1.2);
  }

  fitContent(): void {
    this.yFilesService.fitGraphBounds();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.yFilesService.dispose();
  }
}
