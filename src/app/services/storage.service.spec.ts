import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Position } from '../models/view-state.model';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check if storage is available', () => {
    expect(service.isStorageAvailable()).toBe(true);
  });

  it('should save and load positions', () => {
    const positions = new Map<string, Position>([
      ['node-1', { x: 100, y: 200 }],
      ['node-2', { x: 300, y: 400 }]
    ]);

    service.savePositions(positions);
    const loaded = service.loadPositions();

    expect(loaded).not.toBeNull();
    expect(loaded?.size).toBe(2);
    expect(loaded?.get('node-1')).toEqual({ x: 100, y: 200 });
    expect(loaded?.get('node-2')).toEqual({ x: 300, y: 400 });
  });

  it('should return null if no positions are saved', () => {
    const loaded = service.loadPositions();
    expect(loaded).toBeNull();
  });

  it('should clear positions', () => {
    const positions = new Map<string, Position>([
      ['node-1', { x: 100, y: 200 }]
    ]);

    service.savePositions(positions);
    expect(service.loadPositions()).not.toBeNull();

    service.clearPositions();
    expect(service.loadPositions()).toBeNull();
  });

  it('should handle storage errors gracefully', () => {
    spyOn(localStorage, 'setItem').and.throwError('Quota exceeded');

    const positions = new Map<string, Position>([
      ['node-1', { x: 100, y: 200 }]
    ]);

    // Should not throw error
    expect(() => service.savePositions(positions)).not.toThrow();
  });

  it('should handle JSON parse errors gracefully', () => {
    localStorage.setItem('netspider-node-positions', 'invalid json');

    const loaded = service.loadPositions();
    expect(loaded).toBeNull();
  });

  describe('Styling Rules', () => {
    it('should save and load styling rules', () => {
      const rules = [
        {
          id: 'rule-1',
          name: 'Test Rule',
          enabled: true,
          target: 'node' as const,
          condition: { attribute: 'type', operator: 'equals' as const, value: 'router' },
          nodeStyle: { fillColor: '#ff0000' },
          priority: 1
        }
      ];

      service.saveStylingRules(rules);
      const loaded = service.loadStylingRules();

      expect(loaded).not.toBeNull();
      expect(loaded?.length).toBe(1);
      expect(loaded?.[0].id).toBe('rule-1');
      expect(loaded?.[0].name).toBe('Test Rule');
    });

    it('should return null if no styling rules are saved', () => {
      const loaded = service.loadStylingRules();
      expect(loaded).toBeNull();
    });

    it('should clear styling rules', () => {
      const rules = [
        {
          id: 'rule-1',
          name: 'Test Rule',
          enabled: true,
          target: 'node' as const,
          condition: { attribute: 'type', operator: 'equals' as const, value: 'router' },
          priority: 1
        }
      ];

      service.saveStylingRules(rules);
      expect(service.loadStylingRules()).not.toBeNull();

      service.clearStylingRules();
      expect(service.loadStylingRules()).toBeNull();
    });

    it('should handle styling rules storage errors gracefully', () => {
      spyOn(localStorage, 'setItem').and.throwError('Quota exceeded');

      const rules = [
        {
          id: 'rule-1',
          name: 'Test Rule',
          enabled: true,
          target: 'node' as const,
          condition: { attribute: 'type', operator: 'equals' as const, value: 'router' },
          priority: 1
        }
      ];

      expect(() => service.saveStylingRules(rules)).not.toThrow();
    });

    it('should handle styling rules JSON parse errors gracefully', () => {
      localStorage.setItem('netspider-styling-rules', 'invalid json');

      const loaded = service.loadStylingRules();
      expect(loaded).toBeNull();
    });

    it('should save multiple styling rules', () => {
      const rules = [
        {
          id: 'rule-1',
          name: 'Router Rule',
          enabled: true,
          target: 'node' as const,
          condition: { attribute: 'type', operator: 'equals' as const, value: 'router' },
          nodeStyle: { fillColor: '#ff0000' },
          priority: 1
        },
        {
          id: 'rule-2',
          name: 'Switch Rule',
          enabled: false,
          target: 'node' as const,
          condition: { attribute: 'type', operator: 'equals' as const, value: 'switch' },
          nodeStyle: { fillColor: '#00ff00' },
          priority: 2
        }
      ];

      service.saveStylingRules(rules);
      const loaded = service.loadStylingRules();

      expect(loaded?.length).toBe(2);
      expect(loaded?.[0].name).toBe('Router Rule');
      expect(loaded?.[1].name).toBe('Switch Rule');
    });
  });
});
