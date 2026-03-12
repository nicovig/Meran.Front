import { HttpInterceptorFn } from '@angular/common/http';
import { endpoints } from './app.endpoints';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('accessToken');

  const isLoginRequest =
    req.url.includes(endpoints.auth.login) ||
    req.url.toLowerCase().includes('/api/auth/login');

  if (!token || isLoginRequest) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};

