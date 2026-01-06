import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvanceEstudianteComponent } from './avance-estudiante.component';

describe('AvanceEstudianteComponent', () => {
  let component: AvanceEstudianteComponent;
  let fixture: ComponentFixture<AvanceEstudianteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvanceEstudianteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvanceEstudianteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
