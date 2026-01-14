import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GraphStateService } from '../../services/graph-state.service';
import { YFilesGraphService } from '../../services/yfiles-graph.service';
import { UIStateService } from '../../services/ui-state.service';
import { DiagramPersistenceService } from '../../services/diagram-persistence.service';
import { NotificationService } from '../../services/notification.service';
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
  stylingVisible = this.uiState.stylingSidebarVisible;

  constructor(
    private graphState: GraphStateService,
    private yFilesService: YFilesGraphService,
    private uiState: UIStateService,
    private http: HttpClient,
    private persistenceService: DiagramPersistenceService,
    private notificationService: NotificationService
  ) {}

  loadMockData(): void {
    this.graphState.setLoading(true);
    const filename = `${this.selectedTopology}.json`;

    // Load from API (always loads the latest saved version)
    this.persistenceService.loadDiagram(filename).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.graphState.loadGraphData(response.data, filename);
          this.graphState.setLoading(false);
        } else {
          this.loadFromAssets(filename);
        }
      },
      error: (error) => {
        // Fallback to loading from assets if API is not available
        this.loadFromAssets(filename);
      }
    });
  }

  /**
   * Fallback method to load from assets when API is not available
   */
  private loadFromAssets(filename: string): void {
    const dataPath = `/assets/data/${filename}`;

    this.http.get<GraphData>(dataPath).subscribe({
      next: (data) => {
        this.graphState.loadGraphData(data, filename);
        this.graphState.setLoading(false);
      },
      error: (err) => {
        this.graphState.setLoading(false);
        this.notificationService.error(`Failed to load ${filename}`);
      }
    });
  }

  async applyLayout(): Promise<void> {
    try {
      this.graphState.setLoading(true);
      await this.yFilesService.applyHierarchicalLayout();
      this.graphState.setLoading(false);
    } catch (error) {
      this.graphState.setLoading(false);
    }
  }

  async rerouteEdges(): Promise<void> {
    try {
      this.graphState.setLoading(true);
      await this.yFilesService.rerouteAllEdges();
      this.graphState.setLoading(false);
    } catch (error) {
      this.graphState.setLoading(false);
    }
  }

  resetView(): void {
    this.yFilesService.fitGraphBounds();
  }

  toggleBackground(): void {
    this.yFilesService.toggleBackgroundVisibility();
  }

  clearPositions(): void {
    if (confirm('Clear all saved node positions? This will reload the graph with default layout.')) {
      this.graphState.clearPersistedPositions();
    }
  }

  debugPositions(): void {
    // 1. Get positions from yFiles
    const yFilesPositions = this.yFilesService.getAllNodePositions();

    // 2. Get graph data from state
    const graphData = this.graphState.getCurrentGraphData();

    let debugInfo = 'Debug Positions:\n\n';
    debugInfo += `yFiles positions: ${yFilesPositions.length}\n`;

    if (graphData) {
      const nodesWithPos = graphData.nodes.filter(n => n.x !== undefined && n.y !== undefined);
      debugInfo += `Graph data nodes: ${graphData?.nodes.length}\n`;
      debugInfo += `Nodes with positions: ${nodesWithPos.length}/${graphData.nodes.length}\n`;

      // 3. Get persisted positions map
      const persistedMap = this.graphState.getPersistedPositions();
      debugInfo += `Persisted positions: ${persistedMap.size}\n`;

      // 4. What would be sent to server?
      const filename = this.graphState.getCurrentFilename();
      debugInfo += `\nWould save to: ${filename}\n`;
      debugInfo += `Edges with bends: ${graphData.edges.filter(e => e.bends && e.bends.length > 0).length}`;
    }

    // Show alert for user
    alert(debugInfo);
  }

  toggleFilters(): void {
    this.uiState.toggleFilterSidebar();
  }

  toggleStyling(): void {
    this.uiState.toggleStylingSidebar();
  }

  savePositions(): void {
    const filename = this.graphState.getCurrentFilename();

    if (!filename) {
      this.notificationService.warning('No file loaded. Please load a topology first.');
      return;
    }

    // First, capture current positions from yFiles (in case auto layout was just applied)
    this.captureCurrentPositions();

    const graphData = this.graphState.getCurrentGraphData();

    if (!graphData) {
      this.notificationService.warning('No graph data to save.');
      return;
    }

    // Save to localStorage
    this.graphState.savePositionsToStorage();

    // Now do the HTTP save
    this.graphState.setLoading(true);

    this.persistenceService.saveDiagram(filename, graphData).subscribe({
      next: (response) => {
        this.graphState.setLoading(false);
        if (response.success) {
          this.notificationService.success(`Diagram saved to ${filename} successfully!`);
        } else {
          this.notificationService.error(`Failed to save: ${response.message}`);
        }
      },
      error: (error) => {
        this.graphState.setLoading(false);

        // Check if API server is running
        if (error.status === 0) {
          this.notificationService.warning('Cannot connect to API server. Make sure it\'s running with: npm run server');
        } else {
          this.notificationService.error(`Failed to save: ${error.message || 'Unknown error'}`);
        }
      }
    });
  }

  /**
   * Capture current node positions and edge bends from yFiles and update graph state
   * This ensures positions are captured even if auto layout was just applied
   */
  private captureCurrentPositions(): void {
    // Get all current positions directly from yFiles
    const positions = this.yFilesService.getAllNodePositions();

    if (positions.length === 0) {
      return;
    }

    // Update all positions in graph state
    this.graphState.updateNodePositions(positions);

    // Capture edge bend points
    const edgeBends = this.yFilesService.getAllEdgeBends();

    // Update edge bends in graph state
    this.graphState.updateEdgeBends(edgeBends);
  }

  // ========== Export Methods ==========

  showExportMenu = false;

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  closeExportMenu(): void {
    this.showExportMenu = false;
  }

  async exportAsPNG(): Promise<void> {
    try {
      this.graphState.setLoading(true);
      await this.yFilesService.exportAsPNG(2); // 2x scale for high quality
      this.closeExportMenu();
    } catch (error) {
      alert('Failed to export PNG. Please try again.');
    } finally {
      this.graphState.setLoading(false);
    }
  }

  async exportAsSVG(): Promise<void> {
    try {
      this.graphState.setLoading(true);
      await this.yFilesService.exportAsSVG();
      this.closeExportMenu();
    } catch (error) {
      alert('Failed to export SVG. Please try again.');
    } finally {
      this.graphState.setLoading(false);
    }
  }

  async exportAsPDF(): Promise<void> {
    try {
      this.graphState.setLoading(true);
      await this.yFilesService.exportAsPDF();
      this.closeExportMenu();
    } catch (error) {
      alert('Failed to export PDF. Please try again.');
    } finally {
      this.graphState.setLoading(false);
    }
  }

  exportAsJSON(): void {
    try {
      const graphData = this.graphState.getCurrentGraphData();
      if (!graphData) {
        alert('No graph data to export. Please load a topology first.');
        return;
      }
      this.yFilesService.exportAsJSON(graphData);
      this.closeExportMenu();
    } catch (error) {
      alert('Failed to export JSON. Please try again.');
    }
  }
}
