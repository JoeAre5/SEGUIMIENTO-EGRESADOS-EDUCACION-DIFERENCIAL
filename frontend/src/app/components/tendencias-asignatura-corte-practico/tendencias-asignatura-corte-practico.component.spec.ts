
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TendenciasAsignaturaCortePracticoComponent } from './tendencias-asignatura-corte-practico.component';

describe('TendenciasAsignaturaCortePracticoComponent', () => {
  let component: TendenciasAsignaturaCortePracticoComponent;
  let fixture: ComponentFixture<TendenciasAsignaturaCortePracticoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TendenciasAsignaturaCortePracticoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TendenciasAsignaturaCortePracticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
