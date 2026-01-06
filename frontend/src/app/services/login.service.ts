import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoginUsuario, RespuestaLogin } from '../models/login.dto';
import { catchError, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface ResultadoLogin {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private url = environment.apiUrl + 'auth';

  // ✅ compatible con tu LoginComponent (result.success / result.message)
  public iniciarSesion(usuario: LoginUsuario): Observable<ResultadoLogin> {
    return this.http.post<RespuestaLogin>(`${this.url}/login`, usuario).pipe(
      map((respuesta) => {
        if (isPlatformBrowser(this.platformId)) {
          // ✅ token compatible con token/access_token
          const token =
            (respuesta as any).token ?? (respuesta as any).access_token;

          if (token) {
            sessionStorage.setItem('token', token);
          }
        }

        return { success: true };
      }),
      catchError((err) => {
        const message =
          err?.error?.message ||
          err?.message ||
          'Error al iniciar sesión, verifica tus credenciales.';
        return of({ success: false, message });
      })
    );
  }

  // ✅ método que navbar espera
  public logout() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('token');
    }
    this.router.navigateByUrl('login');
  }

  public isAuth(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) return of(true);

    if (sessionStorage.getItem('token')) {
      return of(true);
    }

    this.router.navigateByUrl('login');
    return of(false);
  }
}
