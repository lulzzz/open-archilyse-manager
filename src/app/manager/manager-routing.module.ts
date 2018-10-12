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
import { SimulationOverviewComponent } from './simulation-overview/simulation-overview.component';
import { DpoiOverviewComponent } from './dpoi-overview/dpoi-overview.component';
import { MapOverviewComponent } from './map-overview/map-overview.component';
import { PotentialViewOverviewComponent } from './potential-view-overview/potential-view-overview.component';
import { LogOverviewComponent } from './log-overview/log-overview.component';
import { ViewSimOverviewComponent } from './view-sim-overview/view-sim-overview.component';
import { DpoiViewerOverviewComponent } from './dpoi-viewer-overview/dpoi-viewer-overview.component';

const routes: Routes = [
  {
    path: '',
    component: ManagerComponent,
    children: [
      {
        path: '',
        component: BuildingOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'log',
        component: LogOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'map',
        component: MapOverviewComponent,
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
        path: 'potentialView/:buildingId',
        component: PotentialViewOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'viewSim/:layoutId',
        component: ViewSimOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'dpoi/:buildingId',
        component: DpoiOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'dpoiView/:buildingId',
        component: DpoiViewerOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'dpoi/:buildingId/:buildingIdCompare',
        component: DpoiOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'simulation/building/:buildingId',
        component: SimulationOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'simulation/layout/:layoutId',
        component: SimulationOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: '**',
        component: BuildingOverviewComponent,
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
