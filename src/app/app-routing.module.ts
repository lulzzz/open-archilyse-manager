import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { UpgradeBrowserComponent } from './upgrade-browser/upgrade-browser.component';
import { ErrorComponent } from './error/error.component';

import { AuthGuard } from './_guards/auth.guard';
import { IntroEditorComponent } from './editor/intro.component';
import { EditorComponent } from './editor/editor.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'manager',
  },
  {
    path: 'error',
    pathMatch: 'full',
    component: ErrorComponent,
  },
  {
    path: 'upgrade',
    pathMatch: 'full',
    component: UpgradeBrowserComponent,
  },
  {
    path: 'resetPassword',
    pathMatch: 'full',
    component: PasswordResetComponent,
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent,
    data: { state: 'login' },
  },
  {
    path: 'logout',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'editor',
    pathMatch: 'full',
    component: IntroEditorComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'editor/:layoutId',
    pathMatch: 'full',
    component: EditorComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'manager',
    pathMatch: 'prefix',
    loadChildren: 'app/manager/manager.module#ManagerModule',
  },
  {
    path: 'georeference',
    pathMatch: 'prefix',
    loadChildren: 'app/georeference/georeference.module#GeoreferenceModule',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'manager',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [AuthGuard],
  exports: [RouterModule],
})
export class AppRoutingModule {}
