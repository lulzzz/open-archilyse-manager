import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagerRoutingModule } from './manager-routing.module';
import { NgxPopperModule } from 'ngx-popper';
import { ManagerComponent } from './manager.component';
import { AgGridModule } from 'ag-grid-angular';

import { MatCheckboxComponent } from '../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../_shared-components/procent-renderer/procent-renderer.component';
import { MatCheckboxModule } from '@angular/material';

import { RegionOverviewComponent } from './region-overview/region-overview.component';
import { CountryOverviewComponent } from './country-overview/country-overview.component';

import { BuildingOverviewComponent } from './building-overview/building-overview.component';
import { SiteOverviewComponent } from './site-overview/site-overview.component';
import { UnitOverviewComponent } from './unit-overview/unit-overview.component';
import { LayoutOverviewComponent } from './layout-overview/layout-overview.component';
import { SimulationOverviewComponent } from './simulation-overview/simulation-overview.component';
import { DpoiOverviewComponent } from './dpoi-overview/dpoi-overview.component';
import { OverlayService } from '../_services/overlay.service';

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
    MatCheckboxComponent,
    ProcentRendererComponent,
    BuildingOverviewComponent,
    RegionOverviewComponent,
    CountryOverviewComponent,
    SiteOverviewComponent,
    UnitOverviewComponent,
    LayoutOverviewComponent,
    SimulationOverviewComponent,
    DpoiOverviewComponent,
  ],
  providers: [OverlayService],
})
export class ManagerModule {}
