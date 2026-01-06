import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { LoginService } from '../services/login.service';
import { UsuariosService } from '../services/usuarios.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const platformId = inject(PLATFORM_ID);
  const login = inject(LoginService);

  // SSR: no bloquear renderizado
  if (!isPlatformBrowser(platformId)) return true;

  return login.isAuth();
};

export const hasRoleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const platformId = inject(PLATFORM_ID);
  const servicioUsuario = inject(UsuariosService);
  const servicioRouter = inject(Router);

  // SSR: no bloquear renderizado
  if (!isPlatformBrowser(platformId)) return true;

  const rolesPermitidos = route.data['roles'] as Array<string>;
  const tieneRol = servicioUsuario.tieneRol(rolesPermitidos);

  if (tieneRol) return true;

  servicioRouter.navigate(['home']);
  return false;
};

export const loginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const platformId = inject(PLATFORM_ID);
  const login = inject(LoginService);
  const router = inject(Router);

  // SSR: permitir renderizado
  if (!isPlatformBrowser(platformId)) return true;

  // Si ya está logueado, no dejar entrar a /login
  const token = sessionStorage.getItem('token');
  if (token) {
    router.navigate(['home']);
    return false;
  }

  return true;
};
