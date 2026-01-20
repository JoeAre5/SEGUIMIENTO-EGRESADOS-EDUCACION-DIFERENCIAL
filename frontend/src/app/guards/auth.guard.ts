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

  // SSR: no bloquear renderizado
  if (!isPlatformBrowser(platformId)) return true;

  const ok = login.isAuth();

  // Si no está autenticado, manda a login
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

  // SSR: no bloquear renderizado
  if (!isPlatformBrowser(platformId)) return true;

  const rolesPermitidos = (route.data['roles'] as Array<string>) ?? [];

  // Si la ruta no define roles, deja pasar
  if (rolesPermitidos.length === 0) return true;

  const tieneRol = servicioUsuario.tieneRol(rolesPermitidos);

  if (tieneRol) return true;

  // ❗ Antes mandabas a 'home' (no existe en tus routes)
  servicioRouter.navigate(['/menu']);
  return false;
};

export const loginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // SSR: permitir renderizado
  if (!isPlatformBrowser(platformId)) return true;

  // ✅ Revisar token en session/local y token/access_token
  const token =
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token');

  // Si ya está logueado, no dejar entrar a /login
  if (token) {
    router.navigate(['/menu']);
    return false;
  }

  return true;
};
