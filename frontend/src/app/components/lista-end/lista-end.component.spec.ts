import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaEndComponent } from './lista-end.component';

describe('ListaEndComponent', () => {
  let component: ListaEndComponent;
  let fixture: ComponentFixture<ListaEndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaEndComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
