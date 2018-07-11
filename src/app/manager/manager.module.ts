import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview/overview.component';
import {ManagerRoutingModule} from './manager-routing.module';
import {NgxPopperModule} from 'ngx-popper';
import {ManagerComponent} from './manager.component';
import {AgGridModule} from 'ag-grid-angular';

@NgModule({
  imports: [
    CommonModule,
    ManagerRoutingModule,
    AgGridModule.withComponents([]),
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
    OverviewComponent
  ]
})
export class ManagerModule { }
