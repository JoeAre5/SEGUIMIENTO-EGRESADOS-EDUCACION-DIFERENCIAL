import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private normalizeRole(role: any): string {
    if (!role) return '';
    const r = String(role).trim();

    // soportar "ROLE_ADMIN" -> "ADMIN"
    const cleaned = r.replace(/^ROLE_/i, '');

    return cleaned.toUpperCase();
  }

  private extractUserRoles(user: any): string[] {
    if (!user) return [];

    // casos comunes:
    // user.role: "ADMIN"
    // user.roles: ["ADMIN","..."]
    // user.rol: "ADMIN" (a veces en español)
    // user.rolesUsuario: [...]
    const candidates: any[] = [];

    if (user.role) candidates.push(user.role);
    if (user.rol) candidates.push(user.rol);

    if (Array.isArray(user.roles)) candidates.push(...user.roles);
    if (Array.isArray(user.rolesUsuario)) candidates.push(...user.rolesUsuario);

    // por si viene como string con comas
    if (typeof user.roles === 'string') candidates.push(...user.roles.split(','));

    return candidates
      .map((x) => this.normalizeRole(x))
      .filter((x) => !!x);
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // si no se pidieron roles, deja pasar
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const userRoles = this.extractUserRoles(user);
    if (userRoles.length === 0) return false;

    const required = requiredRoles.map((r) => this.normalizeRole(r));

    return required.some((r) => userRoles.includes(r));
  }
}
