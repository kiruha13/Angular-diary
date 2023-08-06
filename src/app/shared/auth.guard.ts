import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {AuthService} from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      const isAuth = await this.authService.isClientAuth();
      if (isAuth) {
        return true; // User is authenticated, allow access to the dashboard
      } else {
        // User is not authenticated, redirect to the login page
        this.router.navigate(['/login']);
        return false;
      }
    } catch (err) {
      console.error('Error checking authentication status:', err);
      // Handle the error as needed, for example, redirect to an error page
      this.router.navigate(['/error']);
      return false;
    }
  }
}

