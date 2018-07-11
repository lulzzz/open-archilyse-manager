import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards/auth.guard';
import {ManagerComponent} from './manager.component';
import {OverviewComponent} from './overview/overview.component';
const routes: Routes = [
  {
    path: '',
    component: ManagerComponent,
    children: [
      {
        path: '',
        component: OverviewComponent,
        /** The Guards have to be in every children because they don't activate switching between children */
        canActivate: [AuthGuard],
      },
      {
        path: '**',
        component: OverviewComponent,
        // redirectTo: '',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class ManagerRoutingModule { }
