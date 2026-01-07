import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegendComponent } from './legend.component';

describe('LegendComponent', () => {
  let component: LegendComponent;
  let fixture: ComponentFixture<LegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegendComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display node types', () => {
    expect(component.nodeTypes.length).toBe(5);
  });

  it('should display cable types', () => {
    expect(component.cableTypes.length).toBe(4);
  });
});
