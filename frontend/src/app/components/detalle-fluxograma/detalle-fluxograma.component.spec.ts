import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleFluxogramaComponent } from './detalle-fluxograma.component';

describe('DetalleFluxogramaComponent', () => {
  let component: DetalleFluxogramaComponent;
  let fixture: ComponentFixture<DetalleFluxogramaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleFluxogramaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleFluxogramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
