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


  public iniciarSesion(usuario: LoginUsuario): Observable<ResultadoLogin> {
    return this.http.post<RespuestaLogin>(`${this.url}/login`, usuario).pipe(
      map((respuesta: any) => {
        if (isPlatformBrowser(this.platformId)) {

          const token = respuesta?.access_token ?? respuesta?.token;

          if (token) {
            sessionStorage.setItem('access_token', token);


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


  public logout() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
    }
    this.router.navigateByUrl('login');
  }

  public isAuth(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) return of(true);

    const token =
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token');

    if (token) {
      return of(true);
    }

    this.router.navigateByUrl('login');
    return of(false);
  }
}
