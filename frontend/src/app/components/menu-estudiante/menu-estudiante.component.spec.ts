import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuEstudianteComponent } from './menu-estudiante.component';

describe('MenuEstudianteComponent', () => {
  let component: MenuEstudianteComponent;
  let fixture: ComponentFixture<MenuEstudianteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuEstudianteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuEstudianteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
