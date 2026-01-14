import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { DiagramCanvasComponent } from './components/diagram-canvas/diagram-canvas.component';
import { SidePanelComponent } from './components/side-panel/side-panel.component';
import { LegendComponent } from './components/legend/legend.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { StylingSidebarComponent } from './components/styling-sidebar/styling-sidebar.component';
import { NotificationComponent } from './components/notification/notification.component';
import { UIStateService } from './services/ui-state.service';
import { StylingOrchestratorService } from './services/styling-orchestrator.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    DiagramCanvasComponent,
    SidePanelComponent,
    LegendComponent,
    FilterSidebarComponent,
    StylingSidebarComponent,
    NotificationComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'NetSpider Pilot';
  filterSidebarVisible = this.uiState.filterSidebarVisible;
  stylingSidebarVisible = this.uiState.stylingSidebarVisible;

  constructor(
    private uiState: UIStateService,
    private stylingOrchestrator: StylingOrchestratorService // Inject to activate subscriptions
  ) {}

  ngOnInit(): void {
    // Sidebars start hidden by default

    // Debug: Track page unload to identify what's causing reload
    window.addEventListener('beforeunload', (event) => {
    });
  }
}
