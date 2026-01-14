import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidePanelComponent } from './side-panel.component';
import { GraphStateService } from '../../services/graph-state.service';
import { StorageService } from '../../services/storage.service';
import { GraphData, NodeType, CableType } from '../../models/graph-data.model';
import { SelectionDetails } from '../../models/selection.model';

describe('SidePanelComponent', () => {
  let component: SidePanelComponent;
  let fixture: ComponentFixture<SidePanelComponent>;
  let graphStateService: GraphStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidePanelComponent],
      providers: [GraphStateService, StorageService]
    }).compileComponents();

    fixture = TestBed.createComponent(SidePanelComponent);
    component = fixture.componentInstance;
    graphStateService = TestBed.inject(GraphStateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('deleteSelected', () => {
    beforeEach(() => {
      // Set up graph data
      const graphData: GraphData = {
        nodes: [
          { id: 'node-1', label: 'Router 1', type: NodeType.ROUTER },
          { id: 'node-2', label: 'Switch 1', type: NodeType.SWITCH }
        ],
        edges: [
          { id: 'edge-1', sourceId: 'node-1', targetId: 'node-2', cableType: CableType.FIBER }
        ]
      };
      graphStateService.loadGraphData(graphData);
    });

    it('should call deleteNode when deleting a node', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(graphStateService, 'deleteNode');

      const details: SelectionDetails = {
        type: 'node',
        data: { id: 'node-1', label: 'Router 1', type: NodeType.ROUTER },
        displayProperties: [
          { label: 'ID', value: 'node-1' },
          { label: 'Label', value: 'Router 1' }
        ]
      };

      component.deleteSelected(details);

      expect(graphStateService.deleteNode).toHaveBeenCalledWith('node-1');
    });

    it('should call deleteEdge when deleting an edge', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(graphStateService, 'deleteEdge');

      const details: SelectionDetails = {
        type: 'edge',
        data: { id: 'edge-1', sourceId: 'node-1', targetId: 'node-2', cableType: CableType.FIBER },
        displayProperties: [
          { label: 'ID', value: 'edge-1' }
        ]
      };

      component.deleteSelected(details);

      expect(graphStateService.deleteEdge).toHaveBeenCalledWith('edge-1');
    });

    it('should show confirmation dialog with node label', () => {
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);

      const details: SelectionDetails = {
        type: 'node',
        data: { id: 'node-1', label: 'Router 1', type: NodeType.ROUTER },
        displayProperties: [
          { label: 'Label', value: 'Router 1' }
        ]
      };

      component.deleteSelected(details);

      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete node "Router 1"?\n\nThis will also delete all connected edges.'
      );
    });

    it('should show confirmation dialog with edge label', () => {
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);

      const details: SelectionDetails = {
        type: 'edge',
        data: { id: 'edge-1', sourceId: 'node-1', targetId: 'node-2', cableType: CableType.FIBER, label: 'Fiber Link' },
        displayProperties: [
          { label: 'Label', value: 'Fiber Link' }
        ]
      };

      component.deleteSelected(details);

      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete edge "Fiber Link"?'
      );
    });

    it('should not delete when user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(graphStateService, 'deleteNode');

      const details: SelectionDetails = {
        type: 'node',
        data: { id: 'node-1', label: 'Router 1', type: NodeType.ROUTER },
        displayProperties: [{ label: 'Label', value: 'Router 1' }]
      };

      component.deleteSelected(details);

      expect(graphStateService.deleteNode).not.toHaveBeenCalled();
    });

    it('should use node ID as label if no label property exists', () => {
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
      spyOn(graphStateService, 'deleteNode');

      const details: SelectionDetails = {
        type: 'node',
        data: { id: 'node-1', label: 'Router 1', type: NodeType.ROUTER },
        displayProperties: [
          { label: 'ID', value: 'node-1' }
          // No Label property
        ]
      };

      component.deleteSelected(details);

      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete node "node-1"?\n\nThis will also delete all connected edges.'
      );
    });

    it('should handle deletion of node with connected edges', (done) => {
      spyOn(window, 'confirm').and.returnValue(true);

      const details: SelectionDetails = {
        type: 'node',
        data: { id: 'node-1', label: 'Router 1', type: NodeType.ROUTER },
        displayProperties: [{ label: 'Label', value: 'Router 1' }]
      };

      component.deleteSelected(details);

      // Verify the node and its edges are deleted
      graphStateService.graphData$.subscribe(data => {
        if (data && data.nodes.length === 1) {
          expect(data.nodes.find(n => n.id === 'node-1')).toBeUndefined();
          expect(data.edges.find(e => e.id === 'edge-1')).toBeUndefined();
          done();
        }
      });
    });

    it('should handle deletion of edge without affecting nodes', (done) => {
      spyOn(window, 'confirm').and.returnValue(true);

      const details: SelectionDetails = {
        type: 'edge',
        data: { id: 'edge-1', sourceId: 'node-1', targetId: 'node-2', cableType: CableType.FIBER },
        displayProperties: [{ label: 'ID', value: 'edge-1' }]
      };

      component.deleteSelected(details);

      // Verify only the edge is deleted, nodes remain
      graphStateService.graphData$.subscribe(data => {
        if (data && data.edges.length === 0) {
          expect(data.nodes.length).toBe(2);
          expect(data.edges.find(e => e.id === 'edge-1')).toBeUndefined();
          done();
        }
      });
    });
  });

  describe('UI interactions', () => {
    it('should display delete button when item is selected', () => {
      const graphData: GraphData = {
        nodes: [{ id: 'node-1', label: 'Router 1', type: NodeType.ROUTER }],
        edges: []
      };
      graphStateService.loadGraphData(graphData);
      graphStateService.setSelection(['node-1'], []);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const deleteBtn = compiled.querySelector('.delete-btn');
      expect(deleteBtn).toBeTruthy();
    });
  });

  describe('helper methods', () => {
    it('should get correct selection count', () => {
      const selection = {
        selectedNodes: [
          { id: 'node-1', label: 'Node 1', type: NodeType.ROUTER }
        ],
        selectedEdges: [
          { id: 'edge-1', sourceId: 'node-1', targetId: 'node-2', cableType: CableType.FIBER }
        ],
        selectionType: 'mixed' as const
      };

      const count = component.getSelectionCount(selection);
      expect(count).toBe(2);
    });

    it('should format selection type correctly', () => {
      expect(component.formatSelectionType('node')).toBe('Node');
      expect(component.formatSelectionType('edge')).toBe('Edge');
      expect(component.formatSelectionType('mixed')).toBe('Mixed');
    });

    it('should get correct type icon', () => {
      expect(component.getTypeIcon('node')).toBe('🔵');
      expect(component.getTypeIcon('edge')).toBe('🔗');
    });

    it('should detect multiline values', () => {
      expect(component.isMultilineValue('simple text')).toBe(false);
      expect(component.isMultilineValue('line1\nline2')).toBe(true);
      expect(component.isMultilineValue('{"key": "value"}')).toBe(true);
      expect(component.isMultilineValue('["item1", "item2"]')).toBe(true);
    });

    it('should format raw data as JSON', () => {
      const data: any = {
        id: 'node-1',
        label: 'Router 1',
        type: NodeType.ROUTER
      };

      const formatted = component.formatRawData(data);
      expect(formatted).toContain('"id"');
      expect(formatted).toContain('"label"');
      expect(formatted).toContain('Router 1');
    });

    it('should copy to clipboard successfully', (done) => {
      const text = 'test text';
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

      component.copyToClipboard(text);

      setTimeout(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
        done();
      }, 100);
    });

    it('should handle clipboard copy failure', (done) => {
      const text = 'test text';
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject('error'));
      spyOn(document, 'execCommand').and.returnValue(true);

      component.copyToClipboard(text);

      setTimeout(() => {
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        done();
      }, 100);
    });

    it('should toggle raw data visibility', () => {
      expect(component.showRawData).toBe(false);

      component.toggleRawData();
      expect(component.showRawData).toBe(true);

      component.toggleRawData();
      expect(component.showRawData).toBe(false);
    });
  });

  describe('property categorization', () => {
    beforeEach(() => {
      const graphData: GraphData = {
        nodes: [
          {
            id: 'node-1',
            label: 'Router 1',
            type: NodeType.ROUTER,
            x: 100,
            y: 200,
            metadata: {
              ipAddress: '192.168.1.1',
              vendor: 'Cisco',
              model: 'ISR4451'
            }
          }
        ],
        edges: []
      };
      graphStateService.loadGraphData(graphData);
      graphStateService.setSelection(['node-1'], []);
    });

    it('should categorize basic properties', () => {
      const details = graphStateService.getSelectionDetails();
      if (details) {
        const basicProps = component.getBasicProperties(details);
        expect(basicProps.length).toBeGreaterThan(0);
        expect(basicProps.some(p => p.label === 'ID')).toBe(true);
        expect(basicProps.some(p => p.label === 'Label')).toBe(true);
      }
    });

    it('should categorize position properties', () => {
      const details = graphStateService.getSelectionDetails();
      if (details) {
        const positionProps = component.getPositionProperties(details);
        expect(positionProps.length).toBeGreaterThan(0);
        expect(positionProps.some(p => p.label === 'Position X')).toBe(true);
        expect(positionProps.some(p => p.label === 'Position Y')).toBe(true);
      }
    });

    it('should categorize technical properties', () => {
      const details = graphStateService.getSelectionDetails();
      if (details) {
        const technicalProps = component.getTechnicalProperties(details);
        expect(technicalProps.some(p => p.label.includes('Ip Address'))).toBe(true);
        expect(technicalProps.some(p => p.label.includes('Vendor'))).toBe(true);
      }
    });

    it('should get main label from details', () => {
      const details = graphStateService.getSelectionDetails();
      if (details) {
        const label = component.getMainLabel(details);
        expect(label).toBe('Router 1');
      }
    });

    it('should fall back to ID when no label exists', () => {
      const details: SelectionDetails = {
        type: 'node',
        data: { id: 'node-999', label: 'Node 999', type: NodeType.ROUTER },
        displayProperties: [
          { label: 'ID', value: 'node-999' }
        ]
      };

      const label = component.getMainLabel(details);
      expect(label).toBe('node-999');
    });
  });
});
