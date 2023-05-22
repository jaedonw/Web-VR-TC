import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { User } from '../classes/user';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class PremiumGuard implements CanActivate {
  constructor(private apiService: ApiService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.apiService.me().pipe(
      map((user: User) => {
        if (user.premiumEnabled) {
          return true;
        } else {
          this.router.navigate(['/dashboard']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
