import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { YFilesGraphService } from '../../services/yfiles-graph.service';
import { GraphStateService } from '../../services/graph-state.service';

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
    private graphState: GraphStateService
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
        if (data) {
          const positions = this.graphState.getPersistedPositions();
          this.yFilesService.renderGraph(data, positions);
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
