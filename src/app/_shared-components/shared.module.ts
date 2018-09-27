import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon/icon.component';
import { RouterModule } from '@angular/router';
import { MatInputModule, MatSlideToggleModule } from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { NgxPopperModule } from 'ngx-popper';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

// import { BrowserModule } from '@angular/platform-browser';
import { NgDragDropModule } from 'ng-drag-drop';
import { ErrorModalComponent } from './error-modal/error-modal.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { NavigationComponent } from './navigation/navigation.component';
import { SafeHtmlPipe } from '../_pipes/safeHtml.pipe';
import { OrdinalPipe } from '../_pipes/ordinal.pipe';
import { MatCheckboxComponent } from './mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from './procent-renderer/procent-renderer.component';
import { InfoBoxOverlayComponent } from './overlays/info-box-overlay/info-box-overlay.component';
import { FloorplanEditorComponent } from './floorplan/floorplan-editor.component';
import { DragItemComponent } from './floorplan/editor-sidebar/drag-item/drag-item.component';
import { EditorSidebarComponent } from './floorplan/editor-sidebar/editor-sidebar.component';
import { EditorPropertiesSidebarComponent } from './floorplan/editor-properties-sidebar/editor-properties-sidebar.component';
import { CreateLayoutComponent } from './create-layout/create-layout.component';
import { EditLayoutComponent } from './edit-layout/edit-layout.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { UniqueIdService } from '../_services';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    TagInputModule,
    PerfectScrollbarModule,
    NgxPopperModule.forRoot({
      placement: 'top',
      trigger: 'hover',
      showDelay: 200,
      hideOnScroll: true,
      applyClass: 'arch',
    }),
    NgDragDropModule.forRoot(),
  ],
  declarations: [
    InfoBoxOverlayComponent,
    ErrorModalComponent,
    BreadcrumbComponent,
    CreateLayoutComponent,
    EditLayoutComponent,
    NavigationComponent,
    ToggleButtonComponent,
    SafeHtmlPipe,
    OrdinalPipe,
    FloorplanEditorComponent,
    EditorSidebarComponent,
    IconComponent,
    DragItemComponent,
    EditorPropertiesSidebarComponent,
  ],
  exports: [
    InfoBoxOverlayComponent,
    ErrorModalComponent,
    BreadcrumbComponent,
    CreateLayoutComponent,
    ToggleButtonComponent,
    EditLayoutComponent,
    NavigationComponent,
    SafeHtmlPipe,
    OrdinalPipe,
    IconComponent,
    FloorplanEditorComponent,
  ],
  providers: [UniqueIdService],
  entryComponents: [InfoBoxOverlayComponent, ErrorModalComponent],
  bootstrap: [FloorplanEditorComponent, DragItemComponent],
})
export class SharedModule {}
