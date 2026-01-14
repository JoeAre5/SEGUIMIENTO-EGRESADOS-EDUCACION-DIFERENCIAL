import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // SSR: no tocar storage
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(req);
    }

    // ✅ MISMA KEY que usas en LoginService
    const token = sessionStorage.getItem('token');

    if (!token) return next.handle(req);

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authReq);
  }
}
