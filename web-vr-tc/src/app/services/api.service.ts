import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { User } from '../classes/user';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ApiService implements CanActivate {
  endpoint = environment.apiEndpoint;

  signedIn = false;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post(
      `${this.endpoint}/api/users/login`,
      {
        username,
        password,
        withCredentials: true,
      },
      { withCredentials: true }
    );
  }

  register(username: string, password: string, phone: string) {
    return this.http.post(
      `${this.endpoint}/api/users/signup`,
      {
        username,
        password,
        phone,
      },
      { withCredentials: true }
    );
  }

  logout() {
    return this.http.get(`${this.endpoint}/api/users/logout`, {
      withCredentials: true,
    });
  }

  recoverPassword(username: string) {
    return this.http.post(
      `${this.endpoint}/api/users/forgot-password`,
      {
        username,
      },
      { withCredentials: true }
    );
  }

  verifyCode(username: string, code: string) {
    return this.http.post(
      `${this.endpoint}/api/users/verify-code`,
      {
        username,
        code,
      },
      { withCredentials: true }
    );
  }

  resetPassword(username: string, password: string, code: string) {
    return this.http.post(
      `${this.endpoint}/api/users/reset-password`,
      {
        username,
        password,
        code,
      },
      { withCredentials: true }
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.endpoint}/api/users/me`, {
      withCredentials: true,
    });
  }

  canActivate(): Observable<boolean> {
    return this.me().pipe(
      map((user: User) => {
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }

  getPremium(): Observable<Location> {
    return this.http.post<Location>(
      `${this.endpoint}/api/stripe/create-checkout-session`,
      {},
      { withCredentials: true }
    );
  }
}
