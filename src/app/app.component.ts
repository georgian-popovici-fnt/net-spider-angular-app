import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { DiagramCanvasComponent } from './components/diagram-canvas/diagram-canvas.component';
import { SidePanelComponent } from './components/side-panel/side-panel.component';
import { LegendComponent } from './components/legend/legend.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { UIStateService } from './services/ui-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    DiagramCanvasComponent,
    SidePanelComponent,
    LegendComponent,
    FilterSidebarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'NetSpider Pilot';
  filterSidebarVisible = this.uiState.filterSidebarVisible;

  constructor(private uiState: UIStateService) {}

  ngOnInit(): void {
    // Filter sidebar starts hidden by default
    console.log('[App] Filter sidebar initialized as hidden');
  }
}
