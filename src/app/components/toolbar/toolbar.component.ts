import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GraphStateService } from '../../services/graph-state.service';
import { YFilesGraphService } from '../../services/yfiles-graph.service';
import { UIStateService } from '../../services/ui-state.service';
import { GraphData } from '../../models/graph-data.model';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  loading$ = this.graphState.loading$;
  selectedTopology = 'mock-graph-data';
  filterVisible = this.uiState.filterSidebarVisible;

  constructor(
    private graphState: GraphStateService,
    private yFilesService: YFilesGraphService,
    private uiState: UIStateService,
    private http: HttpClient
  ) {}

  loadMockData(): void {
    this.graphState.setLoading(true);
    const dataPath = `/assets/data/${this.selectedTopology}.json`;

    this.http.get<GraphData>(dataPath)
      .subscribe({
        next: (data) => {
          this.graphState.loadGraphData(data);
          this.graphState.setLoading(false);
          console.log(`[Toolbar] Loaded topology: ${this.selectedTopology}`);
        },
        error: (err) => {
          console.error(`Failed to load ${this.selectedTopology}:`, err);
          this.graphState.setLoading(false);
        }
      });
  }

  async applyLayout(): Promise<void> {
    try {
      this.graphState.setLoading(true);
      console.log('[Toolbar] Applying hierarchical layout...');
      await this.yFilesService.applyHierarchicalLayout();
      console.log('[Toolbar] Layout applied successfully');
      this.graphState.setLoading(false);
    } catch (error) {
      console.error('[Toolbar] Layout failed:', error);
      this.graphState.setLoading(false);
    }
  }

  async rerouteEdges(): Promise<void> {
    try {
      this.graphState.setLoading(true);
      console.log('[Toolbar] Re-routing edges...');
      await this.yFilesService.rerouteAllEdges();
      console.log('[Toolbar] Edges re-routed successfully');
      this.graphState.setLoading(false);
    } catch (error) {
      console.error('[Toolbar] Edge routing failed:', error);
      this.graphState.setLoading(false);
    }
  }

  resetView(): void {
    console.log('[Toolbar] Resetting view...');
    this.yFilesService.fitGraphBounds();
  }

  toggleBackground(): void {
    console.log('[Toolbar] Toggling background...');
    this.yFilesService.toggleBackgroundVisibility();
  }

  clearPositions(): void {
    if (confirm('Clear all saved node positions? This will reload the graph with default layout.')) {
      console.log('[Toolbar] Clearing positions...');
      this.graphState.clearPersistedPositions();
    }
  }

  toggleFilters(): void {
    console.log('[Toolbar] Toggling filter sidebar...');
    this.uiState.toggleFilterSidebar();
  }
}
