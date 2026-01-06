import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TieneRolDirective } from '../../directives/tiene-rol.directive';
import { Roles } from '../../models/login.dto';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CardModule, TieneRolDirective],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  JEFA_CARRERA = Roles.JEFA_CARRERA;
  COORDINADOR = Roles.COORDINADOR;
  DOCENTE = Roles.DOCENTE;
  ADMINISTRADOR = Roles.ADMINISTRADOR;
  SECRETARIO = Roles.SECRETARIO;

  constructor(private router: Router) {}

  public redirigirHacia(route: string) {
    this.router.navigateByUrl(`/${route}`);
  }
}
