import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview/overview.component';
import {ManagerRoutingModule} from './manager-routing.module';
import {NgxPopperModule} from 'ngx-popper';
import {ManagerComponent} from './manager.component';
import {AgGridModule} from 'ag-grid-angular';
import { BuildingOverviewComponent } from './building-overview/building-overview.component';
import { RegionOverviewComponent } from './region-overview/region-overview.component';
import { CountryOverviewComponent } from './country-overview/country-overview.component';
import { FloorplanOverviewComponent } from './floorplan-overview/floorplan-overview.component';
import { MatCheckboxComponent} from '../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../_shared-components/procent-renderer/procent-renderer.component';
import {MatCheckboxModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    ManagerRoutingModule,
    MatCheckboxModule,
    AgGridModule.withComponents([MatCheckboxComponent, ProcentRendererComponent]),
    NgxPopperModule.forRoot({
      placement: 'top',
      trigger: 'hover',
      showDelay: 300,
      hideOnScroll: true,
      hideOnMouseLeave: true,
      applyClass: 'arch',
    }),
  ],
  declarations: [
    ManagerComponent,
    OverviewComponent,
    MatCheckboxComponent,
    ProcentRendererComponent,
    BuildingOverviewComponent,
    RegionOverviewComponent,
    CountryOverviewComponent,
    FloorplanOverviewComponent
  ]
})
export class ManagerModule { }
