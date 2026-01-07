import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoEgresadosComponent } from './seguimiento-egresados.component';

describe('SeguimientoEgresadosComponent', () => {
  let component: SeguimientoEgresadosComponent;
  let fixture: ComponentFixture<SeguimientoEgresadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguimientoEgresadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeguimientoEgresadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
