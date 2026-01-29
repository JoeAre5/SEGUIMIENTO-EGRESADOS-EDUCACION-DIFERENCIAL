import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TieneRolDirective } from '../../directives/tiene-rol.directive';
import { Roles } from '../../models/login.dto';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, CardModule, TieneRolDirective],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  JEFA_CARRERA = Roles.JEFA_CARRERA;
  COORDINADOR = Roles.COORDINADOR;
  DOCENTE = Roles.DOCENTE;
  ADMINISTRADOR = Roles.ADMINISTRADOR;
  SECRETARIO = Roles.SECRETARIO;
  EGRESADO = Roles.EGRESADO;

  public isEgresado = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token');

    const payload = this.decodeJwt(token);
    const role = payload?.role;

    this.isEgresado = role === Roles.EGRESADO || role === 'EGRESADO';
  }

  private decodeJwt(token: string | null): any {
    if (!token) return null;
    try {
      const payloadPart = token.split('.')[1];
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  public redirigirHacia(route: string) {
    this.router.navigateByUrl(`/${route}`);
  }
}
