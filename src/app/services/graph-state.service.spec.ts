import { TestBed } from '@angular/core/testing';
import { GraphStateService } from './graph-state.service';
import { StorageService } from './storage.service';
import { GraphData, NodeType, CableType } from '../models/graph-data.model';

describe('GraphStateService', () => {
  let service: GraphStateService;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'savePositions',
      'loadPositions',
      'clearPositions'
    ]);

    TestBed.configureTestingModule({
      providers: [
        GraphStateService,
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    });

    service = TestBed.inject(GraphStateService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Graph Data Management', () => {
    it('should load graph data', (done) => {
      const graphData: GraphData = {
        nodes: [
          { id: 'node-1', label: 'Node 1', type: NodeType.ROUTER }
        ],
        edges: []
      };

      service.loadGraphData(graphData);

      service.graphData$.subscribe(data => {
        expect(data).toEqual(graphData);
        done();
      });
    });

    it('should merge persisted positions with graph data', () => {
      storageService.loadPositions.and.returnValue(new Map([
        ['node-1', { x: 100, y: 200 }]
      ]));

      // Re-create service to trigger constructor
      service = new GraphStateService(storageService);

      const graphData: GraphData = {
        nodes: [
          { id: 'node-1', label: 'Node 1', type: NodeType.ROUTER }
        ],
        edges: []
      };

      service.loadGraphData(graphData);

      const loadedData = service.getCurrentGraphData();
      expect(loadedData?.nodes[0].x).toBe(100);
      expect(loadedData?.nodes[0].y).toBe(200);
    });

    it('should get node by ID', () => {
      const graphData: GraphData = {
        nodes: [
          { id: 'node-1', label: 'Node 1', type: NodeType.ROUTER },
          { id: 'node-2', label: 'Node 2', type: NodeType.SWITCH }
        ],
        edges: []
      };

      service.loadGraphData(graphData);

      const node = service.getNode('node-1');
      expect(node).toBeDefined();
      expect(node?.label).toBe('Node 1');
    });

    it('should get edge by ID', () => {
      const graphData: GraphData = {
        nodes: [],
        edges: [
          { id: 'edge-1', sourceId: 'node-1', targetId: 'node-2', cableType: CableType.FIBER }
        ]
      };

      service.loadGraphData(graphData);

      const edge = service.getEdge('edge-1');
      expect(edge).toBeDefined();
      expect(edge?.cableType).toBe(CableType.FIBER);
    });
  });

  describe('Selection Management', () => {
    beforeEach(() => {
      const graphData: GraphData = {
        nodes: [
          { id: 'node-1', label: 'Node 1', type: NodeType.ROUTER },
          { id: 'node-2', label: 'Node 2', type: NodeType.SWITCH }
        ],
        edges: [
          { id: 'edge-1', sourceId: 'node-1', targetId: 'node-2', cableType: CableType.FIBER }
        ]
      };
      service.loadGraphData(graphData);
    });

    it('should set selection for nodes', (done) => {
      service.setSelection(['node-1'], []);

      service.selection$.subscribe(selection => {
        if (selection.selectionType !== 'none') {
          expect(selection.selectedNodes.length).toBe(1);
          expect(selection.selectedNodes[0].id).toBe('node-1');
          expect(selection.selectionType).toBe('node');
          done();
        }
      });
    });

    it('should set selection for edges', (done) => {
      service.setSelection([], ['edge-1']);

      service.selection$.subscribe(selection => {
        if (selection.selectionType !== 'none') {
          expect(selection.selectedEdges.length).toBe(1);
          expect(selection.selectedEdges[0].id).toBe('edge-1');
          expect(selection.selectionType).toBe('edge');
          done();
        }
      });
    });

    it('should handle mixed selection', (done) => {
      service.setSelection(['node-1'], ['edge-1']);

      service.selection$.subscribe(selection => {
        if (selection.selectionType === 'mixed') {
          expect(selection.selectedNodes.length).toBe(1);
          expect(selection.selectedEdges.length).toBe(1);
          expect(selection.selectionType).toBe('mixed');
          done();
        }
      });
    });

    it('should clear selection', (done) => {
      service.setSelection(['node-1'], []);
      service.clearSelection();

      service.selection$.subscribe(selection => {
        if (selection.selectedNodes.length === 0) {
          expect(selection.selectedNodes.length).toBe(0);
          expect(selection.selectedEdges.length).toBe(0);
          expect(selection.selectionType).toBe('none');
          done();
        }
      });
    });

    it('should provide selection details for single node', () => {
      service.setSelection(['node-1'], []);

      const details = service.getSelectionDetails();

      expect(details).not.toBeNull();
      expect(details?.type).toBe('node');
      expect(details?.displayProperties.length).toBeGreaterThan(0);
    });

    it('should provide selection details for single edge', () => {
      service.setSelection([], ['edge-1']);

      const details = service.getSelectionDetails();

      expect(details).not.toBeNull();
      expect(details?.type).toBe('edge');
      expect(details?.displayProperties.length).toBeGreaterThan(0);
    });

    it('should return null for multiple selections', () => {
      service.setSelection(['node-1', 'node-2'], []);

      const details = service.getSelectionDetails();

      expect(details).toBeNull();
    });
  });

  describe('Position Management', () => {
    it('should update node position', () => {
      const graphData: GraphData = {
        nodes: [
          { id: 'node-1', label: 'Node 1', type: NodeType.ROUTER }
        ],
        edges: []
      };
      service.loadGraphData(graphData);

      service.updateNodePosition('node-1', 150, 250);

      const node = service.getNode('node-1');
      expect(node?.x).toBe(150);
      expect(node?.y).toBe(250);
    });

    it('should update multiple node positions', () => {
      const graphData: GraphData = {
        nodes: [
          { id: 'node-1', label: 'Node 1', type: NodeType.ROUTER },
          { id: 'node-2', label: 'Node 2', type: NodeType.SWITCH }
        ],
        edges: []
      };
      service.loadGraphData(graphData);

      service.updateNodePositions([
        { id: 'node-1', x: 100, y: 200 },
        { id: 'node-2', x: 300, y: 400 }
      ]);

      const node1 = service.getNode('node-1');
      const node2 = service.getNode('node-2');
      expect(node1?.x).toBe(100);
      expect(node2?.x).toBe(300);
    });

    it('should persist positions to storage', () => {
      service.updateNodePosition('node-1', 100, 200);
      service.savePositionsToStorage();

      expect(storageService.savePositions).toHaveBeenCalled();
    });

    it('should get persisted positions', () => {
      service.updateNodePosition('node-1', 100, 200);

      const positions = service.getPersistedPositions();

      expect(positions.size).toBe(1);
      expect(positions.get('node-1')).toEqual({ x: 100, y: 200 });
    });

    it('should clear persisted positions', () => {
      const graphData: GraphData = {
        nodes: [
          { id: 'node-1', label: 'Node 1', type: NodeType.ROUTER, x: 100, y: 200 }
        ],
        edges: []
      };
      service.loadGraphData(graphData);

      service.clearPersistedPositions();

      expect(storageService.clearPositions).toHaveBeenCalled();
      const node = service.getNode('node-1');
      expect(node?.x).toBeUndefined();
      expect(node?.y).toBeUndefined();
    });
  });

  describe('View State', () => {
    it('should toggle background visibility', (done) => {
      service.toggleBackground();

      service.viewState$.subscribe(state => {
        if (!state.backgroundVisible) {
          expect(state.backgroundVisible).toBe(false);
          done();
        }
      });
    });

    it('should update view state', (done) => {
      service.updateViewState({ zoom: 2.0, centerX: 100, centerY: 200 });

      service.viewState$.subscribe(state => {
        if (state.zoom === 2.0) {
          expect(state.zoom).toBe(2.0);
          expect(state.centerX).toBe(100);
          expect(state.centerY).toBe(200);
          done();
        }
      });
    });
  });

  describe('Loading State', () => {
    it('should set loading state', (done) => {
      service.setLoading(true);

      service.loading$.subscribe(loading => {
        if (loading) {
          expect(loading).toBe(true);
          done();
        }
      });
    });
  });
});
