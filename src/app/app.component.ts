import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { DiagramCanvasComponent } from './components/diagram-canvas/diagram-canvas.component';
import { SidePanelComponent } from './components/side-panel/side-panel.component';
import { LegendComponent } from './components/legend/legend.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    DiagramCanvasComponent,
    SidePanelComponent,
    LegendComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'NetSpider Pilot';
}
