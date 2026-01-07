import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiagramCanvasComponent } from './diagram-canvas.component';
import { YFilesGraphService } from '../../services/yfiles-graph.service';
import { GraphStateService } from '../../services/graph-state.service';
import { StorageService } from '../../services/storage.service';

describe('DiagramCanvasComponent', () => {
  let component: DiagramCanvasComponent;
  let fixture: ComponentFixture<DiagramCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagramCanvasComponent],
      providers: [YFilesGraphService, GraphStateService, StorageService]
    }).compileComponents();

    fixture = TestBed.createComponent(DiagramCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have graph container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.graph-container');
    expect(container).toBeTruthy();
  });

  it('should have zoom controls', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const controls = compiled.querySelectorAll('.control-btn');
    expect(controls.length).toBe(3);
  });
});
