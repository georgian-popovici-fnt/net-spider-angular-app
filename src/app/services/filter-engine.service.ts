/**
 * FilterEngineService - Core filtering logic
 * Manages filter state and compiles predicates for yFiles
 */

import { Injectable, signal, computed, effect } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterState, FilterStats, FilterMode } from '../models/filter-state.model';
import { NodeData, EdgeData } from '../models/graph-data.model';

@Injectable({
  providedIn: 'root'
})
export class FilterEngineService {
  // Filter state as Angular signal
  private filterStateSignal = signal<FilterState>(this.createDefaultFilterState());

  // Emit filter changes as observable for subscriptions
  private filterChangedSubject = new BehaviorSubject<FilterState>(this.createDefaultFilterState());
  readonly filterChanged$: Observable<FilterState> = this.filterChangedSubject.asObservable();

  // Computed statistics
  readonly stats = signal<FilterStats>({
    totalNodes: 0,
    visibleNodes: 0,
    hiddenNodes: 0,
    totalEdges: 0,
    visibleEdges: 0,
    hiddenEdges: 0
  });

  // Public read-only state
  readonly filterState = this.filterStateSignal.asReadonly();

  constructor() {
    // Emit filter changes when state changes
    effect(() => {
      const state = this.filterStateSignal();
      this.filterChangedSubject.next(state);
    });
  }

  /**
   * Set the entire filter state
   */
  setFilterState(state: Partial<FilterState>): void {
    this.filterStateSignal.update(current => ({
      ...current,
      ...state
    }));
  }

  /**
   * Get current filter state
   */
  getFilterState(): FilterState {
    return this.filterStateSignal();
  }

  /**
   * Reset all filters to default
   */
  resetFilters(): void {
    this.filterStateSignal.set(this.createDefaultFilterState());
  }

  /**
   * Update statistics
   */
  updateStats(stats: Partial<FilterStats>): void {
    this.stats.update(current => ({
      ...current,
      ...stats
    }));
  }

  /**
   * Create default filter state
   */
  private createDefaultFilterState(): FilterState {
    return {
      mode: 'and',
      textSearch: {
        enabled: false,
        query: '',
        fields: ['label', 'id'],
        caseSensitive: false,
        useRegex: false
      },
      facets: [],
      numericRanges: [],
      dateRanges: [],
      booleans: [],
      degree: null,
      visual: {
        selectedOnly: false,
        unselectedOnly: false,
        visibleOnly: false
      }
    };
  }

  /**
   * Enable/disable text search
   */
  setTextSearchEnabled(enabled: boolean): void {
    this.filterStateSignal.update(state => ({
      ...state,
      textSearch: {
        ...state.textSearch,
        enabled
      }
    }));
  }

  /**
   * Set text search query
   */
  setTextSearchQuery(query: string): void {
    this.filterStateSignal.update(state => ({
      ...state,
      textSearch: {
        ...state.textSearch,
        query
      }
    }));
  }

  /**
   * Toggle node type filter
   */
  toggleNodeType(nodeType: string, enabled: boolean): void {
    console.log('[FilterEngine] Toggle node type:', nodeType, 'enabled:', enabled);

    this.filterStateSignal.update(state => {
      const facets = [...state.facets];
      let typeFacet = facets.find(f => f.attribute === 'type');

      if (!typeFacet) {
        typeFacet = { attribute: 'type', selectedValues: new Set() };
        facets.push(typeFacet);
      }

      if (enabled) {
        typeFacet.selectedValues.add(nodeType);
      } else {
        typeFacet.selectedValues.delete(nodeType);
      }

      console.log('[FilterEngine] Updated type facet:', Array.from(typeFacet.selectedValues));
      return { ...state, facets };
    });
  }

  /**
   * Toggle cable type filter
   */
  toggleCableType(cableType: string, enabled: boolean): void {
    console.log('[FilterEngine] Toggle cable type:', cableType, 'enabled:', enabled);

    this.filterStateSignal.update(state => {
      const facets = [...state.facets];
      let cableFacet = facets.find(f => f.attribute === 'cableType');

      if (!cableFacet) {
        cableFacet = { attribute: 'cableType', selectedValues: new Set() };
        facets.push(cableFacet);
      }

      if (enabled) {
        cableFacet.selectedValues.add(cableType);
      } else {
        cableFacet.selectedValues.delete(cableType);
      }

      console.log('[FilterEngine] Updated cable type facet:', Array.from(cableFacet.selectedValues));
      return { ...state, facets };
    });
  }

  /**
   * Check if a node passes all active filters
   */
  nodePassesFilters(node: NodeData): boolean {
    const state = this.filterStateSignal();

    // Text search filter
    if (state.textSearch.enabled && state.textSearch.query) {
      const query = state.textSearch.caseSensitive
        ? state.textSearch.query
        : state.textSearch.query.toLowerCase();

      const searchIn = [node.label, node.id].map(v =>
        state.textSearch.caseSensitive ? v : v.toLowerCase()
      );

      const matches = searchIn.some(text => text.includes(query));
      if (!matches) {
        console.log(`[FilterEngine] Node ${node.id} FAILED text search`);
        return false;
      }
    }

    // Node type facet filter - ONLY filter if some types are excluded (not all selected)
    const typeFacet = state.facets.find(f => f.attribute === 'type');
    if (typeFacet && typeFacet.selectedValues.size > 0) {
      // Check if this is a filtering scenario (not all types selected)
      // If all common types are selected, treat as no filter
      const allNodeTypes = ['router', 'switch', 'server', 'device', 'workstation', 'firewall', 'loadbalancer'];
      const isFilteringActive = typeFacet.selectedValues.size < allNodeTypes.length;

      if (isFilteringActive) {
        const passes = typeFacet.selectedValues.has(node.type);
        if (!passes) {
          console.log(`[FilterEngine] Node ${node.id} (${node.type}) FAILED type filter. Selected types:`, Array.from(typeFacet.selectedValues));
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if an edge passes all active filters
   */
  edgePassesFilters(edge: EdgeData, sourceNode: NodeData | undefined, targetNode: NodeData | undefined): boolean {
    // If either source or target node is filtered out, hide the edge
    if (sourceNode && !this.nodePassesFilters(sourceNode)) {
      return false;
    }
    if (targetNode && !this.nodePassesFilters(targetNode)) {
      return false;
    }

    const state = this.filterStateSignal();

    // Cable type facet filter - ONLY filter if some types are excluded (not all selected)
    const cableFacet = state.facets.find(f => f.attribute === 'cableType');
    if (cableFacet && cableFacet.selectedValues.size > 0) {
      // Check if this is a filtering scenario (not all types selected)
      const allCableTypes = ['fiber', 'ethernet', 'coaxial', 'serial', 'wireless'];
      const isFilteringActive = cableFacet.selectedValues.size < allCableTypes.length;

      if (isFilteringActive) {
        const passes = cableFacet.selectedValues.has(edge.cableType);
        if (!passes) {
          console.log(`[FilterEngine] Edge ${edge.id} (${edge.cableType}) FAILED cable type filter. Selected types:`, Array.from(cableFacet.selectedValues));
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if any filters are active (excluding default "all selected" state)
   */
  hasActiveFilters(): boolean {
    const state = this.filterStateSignal();

    // Text search is active if enabled and has a query
    if (state.textSearch.enabled && state.textSearch.query) return true;

    // Check if any facets have active filtering (not all items selected means filtering is active)
    const typeFacet = state.facets.find(f => f.attribute === 'type');
    const cableFacet = state.facets.find(f => f.attribute === 'cableType');

    const allNodeTypes = ['router', 'switch', 'server', 'device', 'workstation', 'firewall', 'loadbalancer'];
    const allCableTypes = ['fiber', 'ethernet', 'coaxial', 'serial', 'wireless'];

    // Node type filtering is active only if NOT all types are selected
    if (typeFacet && typeFacet.selectedValues.size > 0 && typeFacet.selectedValues.size < allNodeTypes.length) {
      return true;
    }

    // Cable type filtering is active only if NOT all types are selected
    if (cableFacet && cableFacet.selectedValues.size > 0 && cableFacet.selectedValues.size < allCableTypes.length) {
      return true;
    }

    return false;
  }
}
