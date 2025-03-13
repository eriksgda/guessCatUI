import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth.service';

export const reverseAuthguardGuard: CanActivateFn = (): boolean | UrlTree=> {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? router.parseUrl("/game") : true;
};
