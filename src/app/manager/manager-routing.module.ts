import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards/auth.guard';
import { ManagerComponent } from './manager.component';

import { BuildingOverviewComponent } from './building-overview/building-overview.component';
import { CountryOverviewComponent } from './country-overview/country-overview.component';
import { RegionOverviewComponent } from './region-overview/region-overview.component';
import { UnitOverviewComponent } from './unit-overview/unit-overview.component';
import { SiteOverviewComponent } from './site-overview/site-overview.component';
import { LayoutOverviewComponent } from './layout-overview/layout-overview.component';

const routes: Routes = [
  {
    path: '',
    component: ManagerComponent,
    children: [
      {
        path: '',
        component: CountryOverviewComponent,
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
        path: 'site',
        component: SiteOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'building',
        component: BuildingOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'unit',
        component: UnitOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'layout',
        component: LayoutOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: '**',
        component: CountryOverviewComponent,
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
export class ManagerRoutingModule {}
