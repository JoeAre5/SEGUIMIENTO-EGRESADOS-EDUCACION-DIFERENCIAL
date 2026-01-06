import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticaDiagnosticoComponent } from './estadistica-diagnostico.component';

describe('EstadisticaDiagnosticoComponent', () => {
  let component: EstadisticaDiagnosticoComponent;
  let fixture: ComponentFixture<EstadisticaDiagnosticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticaDiagnosticoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticaDiagnosticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
