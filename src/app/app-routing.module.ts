import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { UpgradeBrowserComponent } from './upgrade-browser/upgrade-browser.component';
import { ErrorComponent } from './error/error.component';

import { AuthGuard } from './_guards/auth.guard';

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
    path: 'manager',
    pathMatch: 'prefix',
    loadChildren: 'app/manager/manager.module#ManagerModule',
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
