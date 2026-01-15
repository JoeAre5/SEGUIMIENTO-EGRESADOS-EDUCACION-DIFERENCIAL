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

  // ✅ helper: buscar token donde realmente lo estás guardando
  private getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    return (
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('access_token')
    );
  }

  public tieneRol(roles: Array<string>): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const jwtToken = this.getToken();
    if (!jwtToken) return false;

    try {
      const decoded_token: DecodedJWT = jwtDecode(jwtToken);

      const userRole = (decoded_token?.role ?? '').toString().trim();

      // ✅ match directo (igual a como lo tienes)
      return roles.some((role) => userRole === role);
    } catch (e) {
      return false;
    }
  }
}
