import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarLineasComponent } from './gestionar-lineas.component';

describe('GestionarLineasComponent', () => {
  let component: GestionarLineasComponent;
  let fixture: ComponentFixture<GestionarLineasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarLineasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarLineasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
