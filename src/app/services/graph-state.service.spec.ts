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

  describe('Delete Operations', () => {
    beforeEach(() => {
      const graphData: GraphData = {
        nodes: [
          { id: 'node-1', label: 'Node 1', type: NodeType.ROUTER, x: 100, y: 200 },
          { id: 'node-2', label: 'Node 2', type: NodeType.SWITCH, x: 300, y: 400 }
        ],
        edges: [
          { id: 'edge-1', sourceId: 'node-1', targetId: 'node-2', cableType: CableType.FIBER },
          { id: 'edge-2', sourceId: 'node-2', targetId: 'node-1', cableType: CableType.ETHERNET }
        ]
      };
      service.loadGraphData(graphData);
    });

    describe('deleteNode', () => {
      it('should delete a node', (done) => {
        service.deleteNode('node-1');

        service.graphData$.subscribe(data => {
          if (data && data.nodes.length === 1) {
            expect(data.nodes.length).toBe(1);
            expect(data.nodes.find(n => n.id === 'node-1')).toBeUndefined();
            expect(data.nodes.find(n => n.id === 'node-2')).toBeDefined();
            done();
          }
        });
      });

      it('should delete all connected edges when deleting a node', (done) => {
        service.deleteNode('node-1');

        service.graphData$.subscribe(data => {
          if (data && data.edges.length === 0) {
            expect(data.edges.length).toBe(0);
            expect(data.edges.find(e => e.id === 'edge-1')).toBeUndefined();
            expect(data.edges.find(e => e.id === 'edge-2')).toBeUndefined();
            done();
          }
        });
      });

      it('should remove node position from persisted positions', () => {
        service.updateNodePosition('node-1', 100, 200);
        service.deleteNode('node-1');

        const positions = service.getPersistedPositions();
        expect(positions.get('node-1')).toBeUndefined();
      });

      it('should save positions to storage after deletion', () => {
        service.deleteNode('node-1');

        expect(storageService.savePositions).toHaveBeenCalled();
      });

      it('should clear selection after deleting node', (done) => {
        service.setSelection(['node-1'], []);
        service.deleteNode('node-1');

        service.selection$.subscribe(selection => {
          if (selection.selectionType === 'none') {
            expect(selection.selectedNodes.length).toBe(0);
            expect(selection.selectedEdges.length).toBe(0);
            done();
          }
        });
      });

      it('should handle deletion of non-existent node gracefully', () => {
        const initialNodeCount = service.getCurrentGraphData()?.nodes.length || 0;

        service.deleteNode('non-existent-node');

        const currentNodeCount = service.getCurrentGraphData()?.nodes.length || 0;
        expect(currentNodeCount).toBe(initialNodeCount);
      });

      it('should handle deletion when graph data is null', () => {
        const emptyService = new GraphStateService(storageService);

        expect(() => emptyService.deleteNode('node-1')).not.toThrow();
      });

      it('should emit updated graph data after deletion', (done) => {
        let emitCount = 0;

        service.graphData$.subscribe(data => {
          emitCount++;
          if (emitCount === 2 && data) {
            // First emit is from loadGraphData, second is from deleteNode
            expect(data.nodes.length).toBe(1);
            done();
          }
        });

        service.deleteNode('node-1');
      });
    });

    describe('deleteEdge', () => {
      it('should delete an edge', (done) => {
        service.deleteEdge('edge-1');

        service.graphData$.subscribe(data => {
          if (data && data.edges.length === 1) {
            expect(data.edges.length).toBe(1);
            expect(data.edges.find(e => e.id === 'edge-1')).toBeUndefined();
            expect(data.edges.find(e => e.id === 'edge-2')).toBeDefined();
            done();
          }
        });
      });

      it('should not affect nodes when deleting edge', (done) => {
        service.deleteEdge('edge-1');

        service.graphData$.subscribe(data => {
          if (data && data.edges.length === 1) {
            expect(data.nodes.length).toBe(2);
            expect(data.nodes.find(n => n.id === 'node-1')).toBeDefined();
            expect(data.nodes.find(n => n.id === 'node-2')).toBeDefined();
            done();
          }
        });
      });

      it('should clear selection after deleting edge', (done) => {
        service.setSelection([], ['edge-1']);
        service.deleteEdge('edge-1');

        service.selection$.subscribe(selection => {
          if (selection.selectionType === 'none') {
            expect(selection.selectedNodes.length).toBe(0);
            expect(selection.selectedEdges.length).toBe(0);
            done();
          }
        });
      });

      it('should handle deletion of non-existent edge gracefully', () => {
        const initialEdgeCount = service.getCurrentGraphData()?.edges.length || 0;

        service.deleteEdge('non-existent-edge');

        const currentEdgeCount = service.getCurrentGraphData()?.edges.length || 0;
        expect(currentEdgeCount).toBe(initialEdgeCount);
      });

      it('should handle deletion when graph data is null', () => {
        const emptyService = new GraphStateService(storageService);

        expect(() => emptyService.deleteEdge('edge-1')).not.toThrow();
      });

      it('should emit updated graph data after deletion', (done) => {
        let emitCount = 0;

        service.graphData$.subscribe(data => {
          emitCount++;
          if (emitCount === 2 && data) {
            // First emit is from loadGraphData, second is from deleteEdge
            expect(data.edges.length).toBe(1);
            done();
          }
        });

        service.deleteEdge('edge-1');
      });
    });

    describe('savePositionsToStorage', () => {
      it('should call storageService.savePositions', () => {
        service.updateNodePosition('node-1', 150, 250);
        service.savePositionsToStorage();

        expect(storageService.savePositions).toHaveBeenCalledTimes(1);
      });

      it('should save all current positions', () => {
        service.updateNodePosition('node-1', 100, 200);
        service.updateNodePosition('node-2', 300, 400);
        service.savePositionsToStorage();

        const savedPositions = storageService.savePositions.calls.mostRecent().args[0];
        expect(savedPositions.size).toBe(2);
        expect(savedPositions.get('node-1')).toEqual({ x: 100, y: 200 });
        expect(savedPositions.get('node-2')).toEqual({ x: 300, y: 400 });
      });
    });
  });
});
