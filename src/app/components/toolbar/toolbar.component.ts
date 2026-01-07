import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GraphStateService } from '../../services/graph-state.service';
import { GraphData } from '../../models/graph-data.model';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  loading$ = this.graphState.loading$;

  constructor(
    private graphState: GraphStateService,
    private http: HttpClient
  ) {}

  loadMockData(): void {
    this.graphState.setLoading(true);
    this.http.get<GraphData>('/assets/data/mock-graph-data.json')
      .subscribe({
        next: (data) => {
          this.graphState.loadGraphData(data);
          this.graphState.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to load mock data:', err);
          this.graphState.setLoading(false);
        }
      });
  }

  async applyLayout(): Promise<void> {
    await this.graphState.applyLayout('hierarchical');
  }

  async rerouteEdges(): Promise<void> {
    await this.graphState.rerouteEdges();
  }

  resetView(): void {
    this.graphState.resetView();
  }

  toggleBackground(): void {
    this.graphState.toggleBackground();
  }

  clearPositions(): void {
    if (confirm('Clear all saved node positions? This will reload the graph with default layout.')) {
      this.graphState.clearPersistedPositions();
    }
  }
}
