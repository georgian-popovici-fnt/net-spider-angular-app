import { TestBed } from '@angular/core/testing';
import { UIStateService } from './ui-state.service';

describe('UIStateService', () => {
  let service: UIStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UIStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Filter Sidebar', () => {
    it('should start with filter sidebar hidden', () => {
      expect(service.filterSidebarVisible()).toBe(false);
    });

    it('should toggle filter sidebar visibility', () => {
      expect(service.filterSidebarVisible()).toBe(false);

      service.toggleFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(true);

      service.toggleFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(false);
    });

    it('should show filter sidebar', () => {
      expect(service.filterSidebarVisible()).toBe(false);

      service.showFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(true);

      // Should remain true when called again
      service.showFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(true);
    });

    it('should hide filter sidebar', () => {
      service.showFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(true);

      service.hideFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(false);

      // Should remain false when called again
      service.hideFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(false);
    });
  });

  describe('Styling Sidebar', () => {
    it('should start with styling sidebar hidden', () => {
      expect(service.stylingSidebarVisible()).toBe(false);
    });

    it('should toggle styling sidebar visibility', () => {
      expect(service.stylingSidebarVisible()).toBe(false);

      service.toggleStylingSidebar();
      expect(service.stylingSidebarVisible()).toBe(true);

      service.toggleStylingSidebar();
      expect(service.stylingSidebarVisible()).toBe(false);
    });

    it('should show styling sidebar', () => {
      expect(service.stylingSidebarVisible()).toBe(false);

      service.showStylingSidebar();
      expect(service.stylingSidebarVisible()).toBe(true);

      // Should remain true when called again
      service.showStylingSidebar();
      expect(service.stylingSidebarVisible()).toBe(true);
    });

    it('should hide styling sidebar', () => {
      service.showStylingSidebar();
      expect(service.stylingSidebarVisible()).toBe(true);

      service.hideStylingSidebar();
      expect(service.stylingSidebarVisible()).toBe(false);

      // Should remain false when called again
      service.hideStylingSidebar();
      expect(service.stylingSidebarVisible()).toBe(false);
    });
  });

  describe('Multiple Sidebar Operations', () => {
    it('should handle both sidebars independently', () => {
      service.showFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(true);
      expect(service.stylingSidebarVisible()).toBe(false);

      service.showStylingSidebar();
      expect(service.filterSidebarVisible()).toBe(true);
      expect(service.stylingSidebarVisible()).toBe(true);

      service.hideFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(false);
      expect(service.stylingSidebarVisible()).toBe(true);

      service.hideStylingSidebar();
      expect(service.filterSidebarVisible()).toBe(false);
      expect(service.stylingSidebarVisible()).toBe(false);
    });

    it('should toggle both sidebars independently', () => {
      service.toggleFilterSidebar();
      service.toggleStylingSidebar();
      expect(service.filterSidebarVisible()).toBe(true);
      expect(service.stylingSidebarVisible()).toBe(true);

      service.toggleFilterSidebar();
      expect(service.filterSidebarVisible()).toBe(false);
      expect(service.stylingSidebarVisible()).toBe(true);
    });
  });
});
