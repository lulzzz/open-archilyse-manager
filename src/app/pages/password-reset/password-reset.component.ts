import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromStore from '../../_store/index';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../../environments/environment';
import { AngularFireAuth } from 'angularfire2/auth';
import { ManagerFunctions } from '../../_shared-libraries/ManagerFunctions';

@Component({
  selector: 'app-password-reset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit, OnDestroy {
  userError$;

  userErrorString = '';

  // Subscriptions:
  errorLoaded_sub: Subscription;

  constructor(
    private store: Store<fromStore.AppState>,
    private afAuth: AngularFireAuth,
    private _router: Router
  ) {}

  resetEmailForm = new FormGroup({
    email: new FormControl(environment.defaultUser, [Validators.required, Validators.email]),
  });

  ngOnInit() {
    this.userError$ = this.store.select(fromStore.getUserError);

    this.errorLoaded_sub = this.userError$.subscribe(error => {
      if (error !== null && error) {
        if (typeof error === 'object' && error.detail) {
          this.userErrorString = error.detail;
        } else if (typeof error === 'string') {
          this.userErrorString = error;
        } else {
          this.userErrorString = 'Unknown server error, please contact our technical service.';
        }
      } else {
        this.userErrorString = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.errorLoaded_sub) {
      this.errorLoaded_sub.unsubscribe();
    }
  }

  get email() {
    return this.resetEmailForm.get('email');
  }

  passwordReset() {
    const email = this.resetEmailForm.get('email').value.toLowerCase();
    this.afAuth.auth.sendPasswordResetEmail(email);

    ManagerFunctions.showWarning(
      'Email sent',
      `An email with instructions to change your password was sent to your address.`,
      'Ok',
      () => {
        this.navigateToLogin();
      }
    );
  }

  navigateToDashboard() {
    this._router.navigate(['/']);
  }

  navigateToLogin() {
    this._router.navigate(['/login']);
  }
}
