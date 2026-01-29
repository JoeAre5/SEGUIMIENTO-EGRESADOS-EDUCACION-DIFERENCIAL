import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // SSR-safe
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token =
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token');

  if (!token) {
    return next(req);
  }


  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
