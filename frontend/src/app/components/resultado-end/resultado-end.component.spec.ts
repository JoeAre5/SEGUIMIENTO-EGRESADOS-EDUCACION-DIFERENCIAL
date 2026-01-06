import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoEndComponent } from './resultado-end.component';

describe('ResultadoEndComponent', () => {
  let component: ResultadoEndComponent;
  let fixture: ComponentFixture<ResultadoEndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoEndComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadoEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
