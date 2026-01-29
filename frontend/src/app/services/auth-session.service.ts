// src/app/services/auth-session.service.ts

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { decodeJwt } from '../utils/jwt.util';
import { safeGetStorageItem } from '../utils/ssr-storage.util';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;

    return (
      safeGetStorageItem('access_token') ||
      safeGetStorageItem('token') ||
      null
    );
  }

  getPayload(): any {
    const token = this.getToken();
    return decodeJwt(token);
  }

  getRole(): string | null {
    return this.getPayload()?.role ?? null;
  }

  getIdEstudiante(): number | null {
    const v = this.getPayload()?.idEstudiante;
    if (v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  isEgresado(): boolean {
    const role = this.getRole();
    // backend usa 'EGRESADO';  frontend tenía 'Egresado' 
    return role === 'EGRESADO' || role === 'Egresado';
  }
}
