/**
 * Title: auth.guard.ts
 * Author: Shane Hingtgen
 * Date: 8/15/23
 */

// import statements
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

// authGuard function that protects our routes from unauthorized users
export const authGuard: CanActivateFn = (route, state) => {
  const cookie = inject(CookieService);

  if (cookie.get('session_user')) {
    console.log('You are logged in and have a valid session cookie');
    return true;
  } else {
    console.log('You must be logged in to access this page!');
    const router = inject(Router);
    router.navigate(['/security/signin'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
};
