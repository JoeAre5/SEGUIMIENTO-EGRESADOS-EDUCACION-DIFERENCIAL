import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { DecodedJWT } from '../models/login.dto';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return sessionStorage.getItem('token');
  }

  /** ✅ Devuelve el payload del token, o null si no hay token / inválido */
  public getDecodedToken(): DecodedJWT | null {
    const jwtToken = this.getToken();
    if (!jwtToken) return null;

    try {
      return jwtDecode<DecodedJWT>(jwtToken);
    } catch {
      return null;
    }
  }

  /** ✅ TU MÉTODO ORIGINAL (sin romper) */
  public tieneRol(roles: Array<string>): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const jwtToken = sessionStorage.getItem('token');
    if (!jwtToken) return false;

    try {
      const decoded_token: DecodedJWT = jwtDecode(jwtToken);
      return roles.some((role) => decoded_token.role == role);
    } catch {
      return false;
    }
  }

  /** ✅ Nuevo: obtener role directo */
  public getRole(): string | null {
    const decoded = this.getDecodedToken();
    return (decoded as any)?.role ?? null;
  }

  /** ✅ Nuevo: detectar estudiante (string fijo, no enum) */
  public isEstudiante(): boolean {
    return this.getRole() === 'ESTUDIANTE';
  }

  /** ✅ Nuevo: obtener estudianteId desde el token */
  public getEstudianteId(): number | null {
    const decoded: any = this.getDecodedToken();
    const id = decoded?.estudianteId;

    if (id === undefined || id === null) return null;

    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }
}
