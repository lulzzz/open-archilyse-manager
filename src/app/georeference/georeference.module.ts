import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { GeoreferenceComponent } from './georeference.component';

import { IntroComponent } from './intro/intro.component';
import { MapComponent } from './map/map.component';
import { BuildingComponent } from './building/building.component';
import { SharedModule } from '../_shared-components/shared.module';

import { GeoreferenceRoutingModule } from './georeference-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPopperModule } from 'ngx-popper';
import { GeoEditorComponent } from './building/geo-editor/geo-editor.component';
import { MultipleComponent } from './multiple/multiple.component';
import { GeoPreviewComponent } from './building/geo-preview/geo-preview.component';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    GeoreferenceRoutingModule,
    ReactiveFormsModule,
    FormsModule,
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
    GeoreferenceComponent,
    IntroComponent,
    MapComponent,
    BuildingComponent,
    GeoEditorComponent,
    MultipleComponent,
    GeoPreviewComponent,
  ],
})
export class GeoreferenceModule {}
