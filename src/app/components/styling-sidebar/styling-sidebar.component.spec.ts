import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StylingSidebarComponent } from './styling-sidebar.component';
import { StylingEngineService } from '../../services/styling-engine.service';

describe('StylingSidebarComponent', () => {
  let component: StylingSidebarComponent;
  let fixture: ComponentFixture<StylingSidebarComponent>;
  let stylingEngineService: StylingEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StylingSidebarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StylingSidebarComponent);
    component = fixture.componentInstance;
    stylingEngineService = TestBed.inject(StylingEngineService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize as expanded', () => {
    expect(component.isCollapsed()).toBe(false);
  });

  it('should toggle collapse state', () => {
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(true);
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(false);
  });

  it('should add a rule when form is valid', () => {
    component.newRuleName = 'Test Rule';
    component.newRuleTarget = 'node';
    component.newRuleAttribute = 'type';
    component.newRuleOperator = 'equals';
    component.newRuleValue = 'router';

    const initialRuleCount = component.rules().length;
    component.addRule();
    expect(component.rules().length).toBe(initialRuleCount + 1);
  });

  it('should not add a rule when name is empty', () => {
    spyOn(window, 'alert');
    component.newRuleName = '';
    component.newRuleValue = 'test';

    const initialRuleCount = component.rules().length;
    component.addRule();
    expect(component.rules().length).toBe(initialRuleCount);
    expect(window.alert).toHaveBeenCalled();
  });

  it('should clear all rules with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.clearAllRules();
    expect(window.confirm).toHaveBeenCalled();
  });
});
