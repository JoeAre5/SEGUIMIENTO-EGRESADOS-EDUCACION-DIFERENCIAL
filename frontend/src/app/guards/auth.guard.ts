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
  const router = inject(Router);


  if (!isPlatformBrowser(platformId)) return true;

  const ok = login.isAuth();


  if (!ok) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

export const hasRoleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const platformId = inject(PLATFORM_ID);
  const servicioUsuario = inject(UsuariosService);
  const servicioRouter = inject(Router);


  if (!isPlatformBrowser(platformId)) return true;

  const rolesPermitidos = (route.data['roles'] as Array<string>) ?? [];


  if (rolesPermitidos.length === 0) return true;

  const tieneRol = servicioUsuario.tieneRol(rolesPermitidos);

  if (tieneRol) return true;


  servicioRouter.navigate(['/menu']);
  return false;
};

export const loginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);


  if (!isPlatformBrowser(platformId)) return true;


  const token =
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token');


  if (token) {
    router.navigate(['/menu']);
    return false;
  }

  return true;
};
