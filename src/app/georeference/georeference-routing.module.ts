import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards/auth.guard';
import { GeoreferenceComponent } from './georeference.component';

import { IntroComponent } from './intro/intro.component';
import { BuildingComponent } from './building/building.component';
import { MapComponent } from './map/map.component';
import { MultipleComponent } from './multiple/multiple.component';
import { LogOverviewComponent } from './log-overview/log-overview.component';

const routes: Routes = [
  {
    path: '',
    component: GeoreferenceComponent,
    children: [
      {
        path: '',
        component: IntroComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'log',
        component: LogOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'multiple',
        component: MultipleComponent,
        canActivate: [AuthGuard],
      },
      {
        // Geopositions the building and back to init.
        path: 'map/:buildingid',
        component: MapComponent,
        canActivate: [AuthGuard],
      },
      {
        // Geopositions the building and then the layout.
        path: 'map/:buildingid/:layoutid',
        component: MapComponent,
        canActivate: [AuthGuard],
      },
      {
        // Geopositions the layout.
        path: 'building/:layoutid',
        component: BuildingComponent,
        canActivate: [AuthGuard],
      },
      {
        path: '**',
        component: IntroComponent,
        // redirectTo: '',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class GeoreferenceRoutingModule {}
