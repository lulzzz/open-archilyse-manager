import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromStore from '../_store';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../environments/environment';
import { AngularFireAuth } from 'angularfire2/auth';

/**
 * Login component with email - password form.
 */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  userLoading$;
  userLoaded$;
  userError$;

  userErrorString = '';

  // Subscriptions:
  userLoaded_sub: Subscription;
  errorLoaded_sub: Subscription;

  constructor(
    private store: Store<fromStore.AppState>,
    private afAuth: AngularFireAuth,
    private _router: Router
  ) {}

  logInForm = new FormGroup({
    email: new FormControl(environment.defaultUser, [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl(environment.defaultPass, Validators.required),
  });

  ngOnInit() {
    this.userLoading$ = this.store.select(fromStore.getUserLoading);
    this.userError$ = this.store.select(fromStore.getUserError);
    this.userLoaded$ = this.store.select(fromStore.getUserLoaded);

    this.userLoaded_sub = this.userLoaded$.subscribe(loaded => {
      if (loaded) {
        this.navigateToDashboard();
      }
    });

    this.errorLoaded_sub = this.userError$.subscribe(error => {
      if (error !== null && error) {
        if (typeof error === 'object' && error.detail) {
          this.userErrorString = error.detail;
        } else if (typeof error === 'string') {
          this.userErrorString = error;
        } else {
          this.userErrorString =
            'Unknown server error, please contact our technical service.';
        }
      } else {
        this.userErrorString = '';
      }
    });
  }

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.errorLoaded_sub) {
      this.errorLoaded_sub.unsubscribe();
    }
    if (this.userLoaded_sub) {
      this.userLoaded_sub.unsubscribe();
    }
  }

  /** form email getter */
  get email() {
    return this.logInForm.get('email');
  }
  /** form password getter */
  get password() {
    return this.logInForm.get('password');
  }

  logIn() {
    const lowercase = this.logInForm.get('email').value.toLowerCase();
    this.logInForm.get('email').setValue(lowercase);
    this.store.dispatch(new fromStore.Authenticate(this.logInForm.value));
  }

  //     <a (click)="passwordReset()">Password reset</a>
  passwordReset(email: string) {
    this.afAuth.auth.sendPasswordResetEmail(email);
  }

  navigateToDashboard() {
    this._router.navigate(['/']);
  }
}
