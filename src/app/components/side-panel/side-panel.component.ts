import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { GraphStateService } from '../../services/graph-state.service';
import { SelectionState, SelectionDetails } from '../../models/selection.model';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.scss'
})
export class SidePanelComponent {
  selection$: Observable<SelectionState> = this.graphState.selection$;
  details$: Observable<SelectionDetails | null>;

  constructor(private graphState: GraphStateService) {
    this.details$ = this.selection$.pipe(
      map(() => this.graphState.getSelectionDetails())
    );
  }

  getSelectionCount(selection: SelectionState): number {
    return selection.selectedNodes.length + selection.selectedEdges.length;
  }

  formatSelectionType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
