import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToolbarComponent } from './toolbar.component';
import { GraphStateService } from '../../services/graph-state.service';
import { StorageService } from '../../services/storage.service';
import { YFilesGraphService } from '../../services/yfiles-graph.service';
import { UIStateService } from '../../services/ui-state.service';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let graphStateService: GraphStateService;
  let yFilesService: jasmine.SpyObj<YFilesGraphService>;
  let uiStateService: UIStateService;

  beforeEach(async () => {
    const yFilesServiceSpy = jasmine.createSpyObj('YFilesGraphService', [
      'applyHierarchicalLayout',
      'rerouteAllEdges',
      'fitGraphBounds',
      'toggleBackgroundVisibility',
      'exportAsPNG',
      'exportAsSVG',
      'exportAsPDF',
      'exportAsJSON'
    ]);

    await TestBed.configureTestingModule({
      imports: [ToolbarComponent, HttpClientTestingModule],
      providers: [
        GraphStateService,
        StorageService,
        UIStateService,
        { provide: YFilesGraphService, useValue: yFilesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    graphStateService = TestBed.inject(GraphStateService);
    yFilesService = TestBed.inject(YFilesGraphService) as jasmine.SpyObj<YFilesGraphService>;
    uiStateService = TestBed.inject(UIStateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all action buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.toolbar-btn');
    expect(buttons.length).toBeGreaterThan(0);
  });

  describe('savePositions', () => {
    it('should call graphStateService.savePositionsToStorage', () => {
      spyOn(graphStateService, 'savePositionsToStorage');
      spyOn(window, 'alert');

      component.savePositions();

      expect(graphStateService.savePositionsToStorage).toHaveBeenCalled();
    });

    it('should show success alert', () => {
      spyOn(window, 'alert');

      component.savePositions();

      expect(window.alert).toHaveBeenCalledWith('Node positions saved successfully!');
    });

    it('should save current node positions', () => {
      const storageService = TestBed.inject(StorageService);
      spyOn(storageService, 'savePositions');
      spyOn(window, 'alert');

      // Simulate node positions
      graphStateService.updateNodePosition('node-1', 100, 200);
      graphStateService.updateNodePosition('node-2', 300, 400);

      component.savePositions();

      expect(storageService.savePositions).toHaveBeenCalled();
    });
  });

  describe('clearPositions', () => {
    it('should call graphStateService.clearPersistedPositions when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(graphStateService, 'clearPersistedPositions');

      component.clearPositions();

      expect(graphStateService.clearPersistedPositions).toHaveBeenCalled();
    });

    it('should not clear positions when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(graphStateService, 'clearPersistedPositions');

      component.clearPositions();

      expect(graphStateService.clearPersistedPositions).not.toHaveBeenCalled();
    });

    it('should show confirmation dialog with warning message', () => {
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);

      component.clearPositions();

      expect(confirmSpy).toHaveBeenCalledWith(
        'Clear all saved node positions? This will reload the graph with default layout.'
      );
    });
  });

  describe('applyLayout', () => {
    it('should call yFilesService.applyHierarchicalLayout', async () => {
      yFilesService.applyHierarchicalLayout.and.returnValue(Promise.resolve());

      await component.applyLayout();

      expect(yFilesService.applyHierarchicalLayout).toHaveBeenCalled();
    });

    it('should set loading state during layout application', async () => {
      yFilesService.applyHierarchicalLayout.and.returnValue(Promise.resolve());
      spyOn(graphStateService, 'setLoading');

      await component.applyLayout();

      expect(graphStateService.setLoading).toHaveBeenCalledWith(true);
      expect(graphStateService.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle layout errors gracefully', async () => {
      yFilesService.applyHierarchicalLayout.and.returnValue(Promise.reject(new Error('Layout failed')));
      spyOn(graphStateService, 'setLoading');
      spyOn(console, 'error');

      await component.applyLayout();

      expect(graphStateService.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('rerouteEdges', () => {
    it('should call yFilesService.rerouteAllEdges', async () => {
      yFilesService.rerouteAllEdges.and.returnValue(Promise.resolve());

      await component.rerouteEdges();

      expect(yFilesService.rerouteAllEdges).toHaveBeenCalled();
    });

    it('should set loading state during edge routing', async () => {
      yFilesService.rerouteAllEdges.and.returnValue(Promise.resolve());
      spyOn(graphStateService, 'setLoading');

      await component.rerouteEdges();

      expect(graphStateService.setLoading).toHaveBeenCalledWith(true);
      expect(graphStateService.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('resetView', () => {
    it('should call yFilesService.fitGraphBounds', () => {
      component.resetView();

      expect(yFilesService.fitGraphBounds).toHaveBeenCalled();
    });
  });

  describe('toggleBackground', () => {
    it('should call yFilesService.toggleBackgroundVisibility', () => {
      component.toggleBackground();

      expect(yFilesService.toggleBackgroundVisibility).toHaveBeenCalled();
    });
  });

  describe('toggleFilters', () => {
    it('should call uiStateService.toggleFilterSidebar', () => {
      spyOn(uiStateService, 'toggleFilterSidebar');

      component.toggleFilters();

      expect(uiStateService.toggleFilterSidebar).toHaveBeenCalled();
    });
  });

  describe('toggleStyling', () => {
    it('should call uiStateService.toggleStylingSidebar', () => {
      spyOn(uiStateService, 'toggleStylingSidebar');

      component.toggleStyling();

      expect(uiStateService.toggleStylingSidebar).toHaveBeenCalled();
    });
  });

  describe('Export Menu', () => {
    it('should toggle export menu visibility', () => {
      expect(component.showExportMenu).toBe(false);

      component.toggleExportMenu();
      expect(component.showExportMenu).toBe(true);

      component.toggleExportMenu();
      expect(component.showExportMenu).toBe(false);
    });

    it('should close export menu', () => {
      component.showExportMenu = true;

      component.closeExportMenu();

      expect(component.showExportMenu).toBe(false);
    });
  });

  describe('exportAsPNG', () => {
    it('should call yFilesService.exportAsPNG with scale parameter', async () => {
      yFilesService.exportAsPNG.and.returnValue(Promise.resolve());

      await component.exportAsPNG();

      expect(yFilesService.exportAsPNG).toHaveBeenCalledWith(2);
    });

    it('should set loading state during PNG export', async () => {
      yFilesService.exportAsPNG.and.returnValue(Promise.resolve());
      spyOn(graphStateService, 'setLoading');

      await component.exportAsPNG();

      expect(graphStateService.setLoading).toHaveBeenCalledWith(true);
      expect(graphStateService.setLoading).toHaveBeenCalledWith(false);
    });

    it('should close export menu after successful export', async () => {
      yFilesService.exportAsPNG.and.returnValue(Promise.resolve());
      component.showExportMenu = true;

      await component.exportAsPNG();

      expect(component.showExportMenu).toBe(false);
    });

    it('should handle PNG export errors gracefully', async () => {
      yFilesService.exportAsPNG.and.returnValue(Promise.reject(new Error('Export failed')));
      spyOn(graphStateService, 'setLoading');
      spyOn(console, 'error');
      spyOn(window, 'alert');

      await component.exportAsPNG();

      expect(graphStateService.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Failed to export PNG. Please try again.');
    });

    it('should not close menu if export fails', async () => {
      yFilesService.exportAsPNG.and.returnValue(Promise.reject(new Error('Export failed')));
      spyOn(window, 'alert');
      component.showExportMenu = true;

      await component.exportAsPNG();

      expect(component.showExportMenu).toBe(true);
    });
  });

  describe('exportAsSVG', () => {
    it('should call yFilesService.exportAsSVG', async () => {
      yFilesService.exportAsSVG.and.returnValue(Promise.resolve());

      await component.exportAsSVG();

      expect(yFilesService.exportAsSVG).toHaveBeenCalled();
    });

    it('should set loading state during SVG export', async () => {
      yFilesService.exportAsSVG.and.returnValue(Promise.resolve());
      spyOn(graphStateService, 'setLoading');

      await component.exportAsSVG();

      expect(graphStateService.setLoading).toHaveBeenCalledWith(true);
      expect(graphStateService.setLoading).toHaveBeenCalledWith(false);
    });

    it('should close export menu after successful export', async () => {
      yFilesService.exportAsSVG.and.returnValue(Promise.resolve());
      component.showExportMenu = true;

      await component.exportAsSVG();

      expect(component.showExportMenu).toBe(false);
    });

    it('should handle SVG export errors gracefully', async () => {
      yFilesService.exportAsSVG.and.returnValue(Promise.reject(new Error('Export failed')));
      spyOn(console, 'error');
      spyOn(window, 'alert');

      await component.exportAsSVG();

      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Failed to export SVG. Please try again.');
    });
  });

  describe('exportAsPDF', () => {
    it('should call yFilesService.exportAsPDF', async () => {
      yFilesService.exportAsPDF.and.returnValue(Promise.resolve());

      await component.exportAsPDF();

      expect(yFilesService.exportAsPDF).toHaveBeenCalled();
    });

    it('should set loading state during PDF export', async () => {
      yFilesService.exportAsPDF.and.returnValue(Promise.resolve());
      spyOn(graphStateService, 'setLoading');

      await component.exportAsPDF();

      expect(graphStateService.setLoading).toHaveBeenCalledWith(true);
      expect(graphStateService.setLoading).toHaveBeenCalledWith(false);
    });

    it('should close export menu after successful export', async () => {
      yFilesService.exportAsPDF.and.returnValue(Promise.resolve());
      component.showExportMenu = true;

      await component.exportAsPDF();

      expect(component.showExportMenu).toBe(false);
    });

    it('should handle PDF export errors gracefully', async () => {
      yFilesService.exportAsPDF.and.returnValue(Promise.reject(new Error('Export failed')));
      spyOn(console, 'error');
      spyOn(window, 'alert');

      await component.exportAsPDF();

      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Failed to export PDF. Please try again.');
    });
  });

  describe('exportAsJSON', () => {
    it('should call yFilesService.exportAsJSON with graph data', () => {
      const mockGraphData = {
        nodes: [{ id: 'n1', label: 'Node 1', type: 'router' as any }],
        edges: [{ id: 'e1', sourceId: 'n1', targetId: 'n2', cableType: 'fiber' as any }]
      };
      spyOn(graphStateService, 'getCurrentGraphData').and.returnValue(mockGraphData);

      component.exportAsJSON();

      expect(yFilesService.exportAsJSON).toHaveBeenCalledWith(mockGraphData);
    });

    it('should close export menu after successful export', () => {
      const mockGraphData = {
        nodes: [{ id: 'n1', label: 'Node 1', type: 'router' as any }],
        edges: []
      };
      spyOn(graphStateService, 'getCurrentGraphData').and.returnValue(mockGraphData);
      component.showExportMenu = true;

      component.exportAsJSON();

      expect(component.showExportMenu).toBe(false);
    });

    it('should show alert when no graph data is available', () => {
      spyOn(graphStateService, 'getCurrentGraphData').and.returnValue(null);
      spyOn(window, 'alert');

      component.exportAsJSON();

      expect(window.alert).toHaveBeenCalledWith('No graph data to export. Please load a topology first.');
      expect(yFilesService.exportAsJSON).not.toHaveBeenCalled();
    });

    it('should not close menu when no graph data is available', () => {
      spyOn(graphStateService, 'getCurrentGraphData').and.returnValue(null);
      spyOn(window, 'alert');
      component.showExportMenu = true;

      component.exportAsJSON();

      expect(component.showExportMenu).toBe(true);
    });

    it('should handle JSON export errors gracefully', () => {
      const mockGraphData = {
        nodes: [{ id: 'n1', label: 'Node 1', type: 'router' as any }],
        edges: []
      };
      spyOn(graphStateService, 'getCurrentGraphData').and.returnValue(mockGraphData);
      yFilesService.exportAsJSON.and.throwError('Export failed');
      spyOn(console, 'error');
      spyOn(window, 'alert');

      component.exportAsJSON();

      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Failed to export JSON. Please try again.');
    });
  });

  describe('UI bindings', () => {
    it('should display loading state', (done) => {
      graphStateService.setLoading(true);
      fixture.detectChanges();

      component.loading$.subscribe(loading => {
        if (loading) {
          expect(loading).toBe(true);
          done();
        }
      });
    });

    it('should have default topology selected', () => {
      expect(component.selectedTopology).toBe('mock-graph-data');
    });

    it('should reflect filter sidebar visibility state', () => {
      expect(component.filterVisible()).toBeDefined();
    });

    it('should reflect styling sidebar visibility state', () => {
      expect(component.stylingVisible()).toBeDefined();
    });
  });
});
