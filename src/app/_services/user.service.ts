///<reference path="../../../node_modules/angularfire2/auth/auth.d.ts"/>
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';

import { HttpClient } from '@angular/common/http';

import { User } from '../_models';
import { AngularFireAuth } from 'angularfire2/auth';
import { from } from 'rxjs/observable/from';
import { AngularFirestore } from 'angularfire2/firestore';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

/**
 * User related data
 */
@Injectable()
export class UserService {
  /**
   * True if authenticated
   */
  _authenticated;

  /** The api key of the current user */
  apiKey;

  /** The user object */
  user;

  /** Constructor */
  constructor(
    private router: Router,
    private http: HttpClient,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.setUpAll();
  }

  /**
   * We subscribe to get the user and then to get the api Key.
   */
  setUpAll() {
    //// Get auth data, then get firestore user document || null
    this._authenticated = this.afAuth.authState;

    //// Get auth data, then get firestore user document || null
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc(`users/${user.uid}`).valueChanges();
        }

        return of(null);
      })
    );

    this.user.subscribe(user => {
      if (user && user.api && user.api.key) {
        this.apiKey = user.api.key;
      } else {
        this.apiKey = null;
      }
    });
  }

  /**
   * Authenticate the user
   *
   * @param {string} email The user's email address
   * @param {string} password The user's password
   * @returns {Observable<User>} The authenticated user observable.
   */
  public authenticate(email: string, password: string) {
    return from(this.afAuth.auth.signInWithEmailAndPassword(email, password));
  }

  /**
   * We sign out from Firebase.
   * We link the user to the login page after.
   */
  signOut() {
    this.afAuth.auth.signOut().then(() => {
      // We reset everything
      // By reloading the page instead of navigating everything works fine.
      location.replace('/login');
      // this.router.navigate(['login']);
    });
  }
}
