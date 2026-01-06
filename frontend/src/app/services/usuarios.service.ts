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

  public tieneRol(roles: Array<string>): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const jwtToken = sessionStorage.getItem('token');
    if (!jwtToken) return false;

    try {
      const decoded_token: DecodedJWT = jwtDecode(jwtToken);
      return roles.some((role) => decoded_token.role == role);
    } catch (e) {
      return false;
    }
  }
}
