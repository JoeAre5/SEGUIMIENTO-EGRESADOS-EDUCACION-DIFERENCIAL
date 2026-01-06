import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticasEstudianteComponent } from './practicas-estudiante.component';

describe('PracticasEstudianteComponent', () => {
  let component: PracticasEstudianteComponent;
  let fixture: ComponentFixture<PracticasEstudianteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticasEstudianteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PracticasEstudianteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
