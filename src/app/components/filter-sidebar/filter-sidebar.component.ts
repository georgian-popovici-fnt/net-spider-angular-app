import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterEngineService } from '../../services/filter-engine.service';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.scss']
})
export class FilterSidebarComponent implements OnInit {
  isCollapsed = signal(false);
  stats = this.filterEngine.stats;

  // Text search
  textSearchEnabled = false;
  textSearchQuery = '';

  // Node types
  nodeTypes = ['router', 'switch', 'server', 'device', 'workstation', 'firewall', 'loadbalancer'];
  selectedTypes = new Set<string>(this.nodeTypes); // All selected by default

  // Cable types
  cableTypes = ['fiber', 'ethernet', 'coaxial', 'serial', 'wireless'];
  selectedCableTypes = new Set<string>(this.cableTypes); // All selected by default

  constructor(public filterEngine: FilterEngineService) {
    // Initialize filter engine with all types selected
    this.nodeTypes.forEach(type => {
      this.filterEngine.toggleNodeType(type, true);
    });

    // Initialize filter engine with all cable types selected
    this.cableTypes.forEach(type => {
      this.filterEngine.toggleCableType(type, true);
    });
  }

  ngOnInit(): void {
    // Ensure sidebar is always expanded on load
    this.isCollapsed.set(false);
    console.log('[FilterSidebar] Initialized as expanded');
  }

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  onTextSearchToggle(): void {
    this.filterEngine.setTextSearchEnabled(this.textSearchEnabled);
  }

  onTextSearchQueryChange(): void {
    this.filterEngine.setTextSearchQuery(this.textSearchQuery);
  }

  onNodeTypeChange(nodeType: string): void {
    const enabled = this.selectedTypes.has(nodeType);
    this.filterEngine.toggleNodeType(nodeType, enabled);
  }

  toggleNodeType(nodeType: string): void {
    if (this.selectedTypes.has(nodeType)) {
      this.selectedTypes.delete(nodeType);
    } else {
      this.selectedTypes.add(nodeType);
    }
    console.log('[FilterSidebar] Node type toggled:', nodeType, 'Selected types:', Array.from(this.selectedTypes));
    this.onNodeTypeChange(nodeType);
  }

  onCableTypeChange(cableType: string): void {
    const enabled = this.selectedCableTypes.has(cableType);
    this.filterEngine.toggleCableType(cableType, enabled);
  }

  toggleCableType(cableType: string): void {
    if (this.selectedCableTypes.has(cableType)) {
      this.selectedCableTypes.delete(cableType);
    } else {
      this.selectedCableTypes.add(cableType);
    }
    console.log('[FilterSidebar] Cable type toggled:', cableType, 'Selected types:', Array.from(this.selectedCableTypes));
    this.onCableTypeChange(cableType);
  }

  resetFilters(): void {
    this.textSearchEnabled = false;
    this.textSearchQuery = '';

    // Reset to all node types selected
    this.selectedTypes.clear();
    this.nodeTypes.forEach(type => this.selectedTypes.add(type));

    // Reset to all cable types selected
    this.selectedCableTypes.clear();
    this.cableTypes.forEach(type => this.selectedCableTypes.add(type));

    this.filterEngine.resetFilters();

    // Re-apply all types as selected
    this.nodeTypes.forEach(type => {
      this.filterEngine.toggleNodeType(type, true);
    });

    this.cableTypes.forEach(type => {
      this.filterEngine.toggleCableType(type, true);
    });
  }
}
