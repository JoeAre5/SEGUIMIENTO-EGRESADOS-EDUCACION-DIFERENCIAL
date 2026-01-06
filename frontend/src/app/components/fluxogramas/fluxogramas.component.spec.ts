/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FluxogramasComponent } from './fluxogramas.component';

describe('FluxogramasComponent', () => {
  let component: FluxogramasComponent;
  let fixture: ComponentFixture<FluxogramasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FluxogramasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FluxogramasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
