import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/of';

import { User } from '../_models';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

const apiUrl = environment.apiUrl;

@Injectable()
export class UserService {
  /**
   * True if authenticated
   * @type
   */
  private _authenticated = false;

  constructor(private router: Router, private http: HttpClient) {}

  public isAuthenticated(): Observable<boolean> {
    return Observable.of(this._authenticated);
  }

  /**
   * Authenticate the user
   *
   * @param {string} email The user's email address
   * @param {string} password The user's password
   * @returns {Observable<User>} The authenticated user observable.
   */
  public authenticate(email: string, password: string): Observable<User> {
    return this.http
      .post(`${apiUrl}/users/login`, { email, password }, httpOptions)
      .map((response: Partial<User>) => response)
      .catch((err: any) => Observable.throw(err.error));
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  setLocalStorage({ accessToken, userId }) {
    localStorage.setItem('user_id', userId);
    localStorage.setItem('accessToken', accessToken);
    return Observable.of(userId);
  }

  getLocalStorage() {
    const access_token = localStorage.getItem('accessToken');
    const user_id = localStorage.getItem('user_id');
    return { access_token, user_id };
  }

  getUser(user_id): Observable<Partial<User>> {
    return this.http
      .get(`${apiUrl}/users/${user_id}`, httpOptions)
      .map((response: Partial<User>) => response)
      .catch((err: any) => Observable.throw(err));
  }

  signOut() {
    this.clearLocalStorage();
    window.location.href = '/login';
    // Router Navigate doesn't work
    // this.router.navigate(['/login']);
  }

  /**
   * This method updates a user
   * @param {User} user The details of the user that we want to update
   */
  updateUser(user: User): Observable<User> {
    return this.http
      .put(`${apiUrl}/users/${user.user_id}`, user, httpOptions)
      .map((response: User) => response)
      .catch((err: any) => Observable.throw(err));
  }
}
