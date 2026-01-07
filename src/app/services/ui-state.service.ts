/**
 * UIStateService - Manages UI state like sidebar visibility
 */

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UIStateService {
  // Filter sidebar visibility - hidden by default
  readonly filterSidebarVisible = signal(false);

  constructor() {}

  toggleFilterSidebar(): void {
    this.filterSidebarVisible.update(v => !v);
  }

  showFilterSidebar(): void {
    this.filterSidebarVisible.set(true);
  }

  hideFilterSidebar(): void {
    this.filterSidebarVisible.set(false);
  }
}
