import { TestBed } from '@angular/core/testing';
import { FilterEngineService } from './filter-engine.service';
import { NodeData, EdgeData, NodeType, CableType } from '../models/graph-data.model';

describe('FilterEngineService', () => {
  let service: FilterEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have default filter state', () => {
      const state = service.getFilterState();
      expect(state.mode).toBe('and');
      expect(state.textSearch.enabled).toBe(false);
      expect(state.textSearch.query).toBe('');
      expect(state.facets.length).toBe(0);
    });

    it('should have initial stats', () => {
      const stats = service.stats();
      expect(stats.totalNodes).toBe(0);
      expect(stats.visibleNodes).toBe(0);
      expect(stats.hiddenNodes).toBe(0);
    });

    it('should have filter changed observable', () => {
      expect(service.filterChanged$).toBeDefined();
    });
  });

  describe('Filter State Management', () => {
    it('should set filter state', () => {
      service.setFilterState({ mode: 'or' });
      const state = service.getFilterState();
      expect(state.mode).toBe('or');
    });

    it('should reset filters to default', () => {
      service.setTextSearchQuery('test');
      service.toggleNodeType('router', true);

      service.resetFilters();

      const state = service.getFilterState();
      expect(state.textSearch.query).toBe('');
      expect(state.facets.length).toBe(0);
    });

    it('should update statistics', () => {
      service.updateStats({
        totalNodes: 10,
        visibleNodes: 7,
        hiddenNodes: 3
      });

      const stats = service.stats();
      expect(stats.totalNodes).toBe(10);
      expect(stats.visibleNodes).toBe(7);
      expect(stats.hiddenNodes).toBe(3);
    });
  });

  describe('Text Search', () => {
    it('should enable text search', () => {
      service.setTextSearchEnabled(true);
      const state = service.getFilterState();
      expect(state.textSearch.enabled).toBe(true);
    });

    it('should set text search query', () => {
      service.setTextSearchQuery('router');
      const state = service.getFilterState();
      expect(state.textSearch.query).toBe('router');
    });

    it('should filter nodes by text search', () => {
      service.setTextSearchEnabled(true);
      service.setTextSearchQuery('router');

      const node1: NodeData = { id: 'n1', label: 'Router 1', type: NodeType.ROUTER };
      const node2: NodeData = { id: 'n2', label: 'Switch 1', type: NodeType.SWITCH };

      expect(service.nodePassesFilters(node1)).toBe(true);
      expect(service.nodePassesFilters(node2)).toBe(false);
    });

    it('should handle case-insensitive search', () => {
      service.setTextSearchEnabled(true);
      service.setTextSearchQuery('ROUTER');

      const node: NodeData = { id: 'n1', label: 'router 1', type: NodeType.ROUTER };
      expect(service.nodePassesFilters(node)).toBe(true);
    });

    it('should search in ID field', () => {
      service.setTextSearchEnabled(true);
      service.setTextSearchQuery('test-123');

      const node: NodeData = { id: 'test-123', label: 'Router', type: NodeType.ROUTER };
      expect(service.nodePassesFilters(node)).toBe(true);
    });
  });

  describe('Node Type Filter', () => {
    it('should toggle node type on', () => {
      service.toggleNodeType('router', true);
      const state = service.getFilterState();
      const typeFacet = state.facets.find(f => f.attribute === 'type');

      expect(typeFacet).toBeDefined();
      expect(typeFacet?.selectedValues.has('router')).toBe(true);
    });

    it('should toggle node type off', () => {
      service.toggleNodeType('router', true);
      service.toggleNodeType('router', false);

      const state = service.getFilterState();
      const typeFacet = state.facets.find(f => f.attribute === 'type');

      expect(typeFacet?.selectedValues.has('router')).toBe(false);
    });

    it('should filter nodes by type', () => {
      service.toggleNodeType('router', true);

      const router: NodeData = { id: 'r1', label: 'Router', type: NodeType.ROUTER };
      const switch1: NodeData = { id: 's1', label: 'Switch', type: NodeType.SWITCH };

      expect(service.nodePassesFilters(router)).toBe(true);
      expect(service.nodePassesFilters(switch1)).toBe(false);
    });

    it('should handle multiple node types', () => {
      service.toggleNodeType('router', true);
      service.toggleNodeType('switch', true);

      const router: NodeData = { id: 'r1', label: 'Router', type: NodeType.ROUTER };
      const switch1: NodeData = { id: 's1', label: 'Switch', type: NodeType.SWITCH };
      const server: NodeData = { id: 'srv1', label: 'Server', type: NodeType.SERVER };

      expect(service.nodePassesFilters(router)).toBe(true);
      expect(service.nodePassesFilters(switch1)).toBe(true);
      expect(service.nodePassesFilters(server)).toBe(false);
    });
  });

  describe('Cable Type Filter', () => {
    it('should toggle cable type on', () => {
      service.toggleCableType('fiber', true);
      const state = service.getFilterState();
      const cableFacet = state.facets.find(f => f.attribute === 'cableType');

      expect(cableFacet).toBeDefined();
      expect(cableFacet?.selectedValues.has('fiber')).toBe(true);
    });

    it('should toggle cable type off', () => {
      service.toggleCableType('fiber', true);
      service.toggleCableType('fiber', false);

      const state = service.getFilterState();
      const cableFacet = state.facets.find(f => f.attribute === 'cableType');

      expect(cableFacet?.selectedValues.has('fiber')).toBe(false);
    });

    it('should handle multiple cable types', () => {
      service.toggleCableType('fiber', true);
      service.toggleCableType('ethernet', true);

      const state = service.getFilterState();
      const cableFacet = state.facets.find(f => f.attribute === 'cableType');

      expect(cableFacet?.selectedValues.has('fiber')).toBe(true);
      expect(cableFacet?.selectedValues.has('ethernet')).toBe(true);
    });
  });

  describe('Edge Filtering', () => {
    const sourceNode: NodeData = { id: 'n1', label: 'Router', type: NodeType.ROUTER };
    const targetNode: NodeData = { id: 'n2', label: 'Switch', type: NodeType.SWITCH };

    it('should pass edges when nodes pass filters', () => {
      const edge: EdgeData = {
        id: 'e1',
        sourceId: 'n1',
        targetId: 'n2',
        cableType: CableType.FIBER
      };

      expect(service.edgePassesFilters(edge, sourceNode, targetNode)).toBe(true);
    });

    it('should filter edges by cable type', () => {
      service.toggleCableType('fiber', true);

      const fiberEdge: EdgeData = {
        id: 'e1',
        sourceId: 'n1',
        targetId: 'n2',
        cableType: CableType.FIBER
      };

      const ethernetEdge: EdgeData = {
        id: 'e2',
        sourceId: 'n1',
        targetId: 'n2',
        cableType: CableType.ETHERNET
      };

      expect(service.edgePassesFilters(fiberEdge, sourceNode, targetNode)).toBe(true);
      expect(service.edgePassesFilters(ethernetEdge, sourceNode, targetNode)).toBe(false);
    });

    it('should hide edges when source node is filtered', () => {
      service.toggleNodeType('switch', true); // Only show switches

      const edge: EdgeData = {
        id: 'e1',
        sourceId: 'n1',
        targetId: 'n2',
        cableType: CableType.FIBER
      };

      // Source is router, which is filtered out
      expect(service.edgePassesFilters(edge, sourceNode, targetNode)).toBe(false);
    });

    it('should hide edges when target node is filtered', () => {
      service.toggleNodeType('router', true); // Only show routers

      const edge: EdgeData = {
        id: 'e1',
        sourceId: 'n1',
        targetId: 'n2',
        cableType: CableType.FIBER
      };

      // Target is switch, which is filtered out
      expect(service.edgePassesFilters(edge, sourceNode, targetNode)).toBe(false);
    });
  });

  describe('Active Filters Detection', () => {
    it('should detect no active filters initially', () => {
      expect(service.hasActiveFilters()).toBe(false);
    });

    it('should detect active text search', () => {
      service.setTextSearchEnabled(true);
      service.setTextSearchQuery('test');
      expect(service.hasActiveFilters()).toBe(true);
    });

    it('should detect active node type filter', () => {
      service.toggleNodeType('router', true);
      expect(service.hasActiveFilters()).toBe(true);
    });

    it('should detect active cable type filter', () => {
      service.toggleCableType('fiber', true);
      expect(service.hasActiveFilters()).toBe(true);
    });

    it('should not detect filters when all types are selected', () => {
      // Select all node types
      ['router', 'switch', 'server', 'device', 'workstation', 'firewall', 'loadbalancer'].forEach(type => {
        service.toggleNodeType(type, true);
      });

      expect(service.hasActiveFilters()).toBe(false);
    });
  });

  describe('Observable Emissions', () => {
    it('should have filter changed observable', () => {
      expect(service.filterChanged$).toBeDefined();
    });

    it('should emit state updates', (done) => {
      let emissionCount = 0;
      const subscription = service.filterChanged$.subscribe(state => {
        emissionCount++;
        if (emissionCount === 2) {
          // Second emission should have the updated query
          expect(state).toBeTruthy();
          expect(state.textSearch.query).toBe('test');
          subscription.unsubscribe();
          done();
        }
      });

      // Trigger state change
      service.setTextSearchQuery('test');
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should apply multiple filters together', () => {
      service.setTextSearchEnabled(true);
      service.setTextSearchQuery('core');
      service.toggleNodeType('router', true);

      const matchingNode: NodeData = {
        id: 'r1',
        label: 'Core Router 1',
        type: NodeType.ROUTER
      };

      const wrongType: NodeData = {
        id: 's1',
        label: 'Core Switch 1',
        type: NodeType.SWITCH
      };

      const wrongLabel: NodeData = {
        id: 'r2',
        label: 'Edge Router 2',
        type: NodeType.ROUTER
      };

      expect(service.nodePassesFilters(matchingNode)).toBe(true);
      expect(service.nodePassesFilters(wrongType)).toBe(false);
      expect(service.nodePassesFilters(wrongLabel)).toBe(false);
    });

    it('should handle filter state partial updates', () => {
      service.setFilterState({
        textSearch: {
          enabled: true,
          query: 'router',
          fields: ['label'],
          caseSensitive: true,
          useRegex: false
        }
      });

      const state = service.getFilterState();
      expect(state.textSearch.enabled).toBe(true);
      expect(state.textSearch.query).toBe('router');
      expect(state.textSearch.caseSensitive).toBe(true);
      expect(state.mode).toBe('and'); // Should preserve other fields
    });
  });
});
