import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobacionCursoComponent } from './aprobacion-curso.component';

describe('AprobacionCursoComponent', () => {
  let component: AprobacionCursoComponent;
  let fixture: ComponentFixture<AprobacionCursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprobacionCursoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprobacionCursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
