// ANGULAR
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers, effects } from './_store';

// MATERIAL
import {
  MatSnackBarModule,
  MatSidenavModule,
  MatListModule,
  MatButtonModule,
  MatMenuModule,
  MatIconModule,
  MatDividerModule,
  MatExpansionModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatSlideToggleModule,
} from '@angular/material';

// SERVICES
import {
  UserService,
  LogService,
  TokenInterceptor,
  NavigationService,
  BatchService,
  OverlayService,
  EditorService,
  DiagramService,
} from './_services';

// DIRECTIVES
import { SharedDirectiveModule } from './_directives/shared-directives.module';

// MODULES
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './_shared-components/shared.module';
import { LoginModule } from './login/login.module';
import { SweetAlert2Module } from '@toverux/ngsweetalert2';
import { TagInputModule } from 'ngx-chips';
import { NgxPopperModule } from 'ngx-popper';
import {
  PerfectScrollbarModule,
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
} from 'ngx-perfect-scrollbar';
import { ToastrModule } from 'ngx-toastr';
import { NgxMaskModule } from 'ngx-mask';

// COMPONENTS
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { UpgradeBrowserComponent } from './pages/upgrade-browser/upgrade-browser.component';
import { ErrorComponent } from './pages/error/error.component';

import { logout } from './_store/reducers/user.reducer';
import { ToastComponent } from './_shared-components/toast/toast.component';
import { NavBarComponent } from './_shared-components/nav-bar/nav-bar.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth, AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { EditorComponent } from './editor/editor.component';
import { IntroEditorComponent } from './editor/intro.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  // suppressScrollX: true,
};

@NgModule({
  declarations: [
    AppComponent,
    UpgradeBrowserComponent,
    ErrorComponent,
    NavBarComponent,
    ToastComponent,
    EditorComponent,
    IntroEditorComponent,
    PasswordResetComponent,
  ],
  entryComponents: [ToastComponent],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase), // imports firebase/app needed for everything
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedDirectiveModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatExpansionModule,
    LoginModule,
    SharedModule,
    TagInputModule,
    PerfectScrollbarModule,
    NgxMaskModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 2500,
      positionClass: 'toast-bottom-center',
      toastComponent: ToastComponent,
      preventDuplicates: true,
    }),
    NgxPopperModule.forRoot({
      placement: 'top',
      trigger: 'hover',
      showDelay: 500,
      hideOnScroll: true,
      applyClass: 'arch',
    }),
    StoreModule.forRoot(reducers, { metaReducers: [logout] }),
    EffectsModule.forRoot(effects),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    SweetAlert2Module.forRoot({
      buttonsStyling: false,
      customClass: 'modal-content',
      confirmButtonClass: 'btn blue',
      cancelButtonClass: 'btn',
    }),
    AppRoutingModule,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    OverlayService,
    EditorService,
    DiagramService,
    UserService,
    LogService,
    NavigationService,
    AngularFireAuth,
    BatchService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
