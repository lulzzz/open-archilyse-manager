import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards/auth.guard';
import {ManagerComponent} from './manager.component';
import {OverviewComponent} from './overview/overview.component';
import {BuildingOverviewComponent} from './building-overview/building-overview.component';
import {CountryOverviewComponent} from './country-overview/country-overview.component';
import {RegionOverviewComponent} from './region-overview/region-overview.component';
import {FloorplanOverviewComponent} from './floorplan-overview/floorplan-overview.component';

const routes: Routes = [
  {
    path: '',
    component: ManagerComponent,
    children: [
      {
        path: '',
        component: OverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'overview',
        component: OverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'country',
        component: CountryOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'region',
        component: RegionOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'building',
        component: BuildingOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'floorplan',
        component: FloorplanOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: '**',
        component: OverviewComponent,
        redirectTo: '',
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
