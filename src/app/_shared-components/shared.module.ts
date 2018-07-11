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
import {ErrorModalComponent} from './error-modal/error-modal.component';
import {BreadcrumbComponent} from './breadcrumb/breadcrumb.component';
import {NavigationComponent} from './navigation/navigation.component';
import {SafeHtmlPipe} from '../_pipes/safeHtml.pipe';
import {OrdinalPipe} from '../_pipes/ordinal.pipe';

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
    ErrorModalComponent,
    BreadcrumbComponent,
    NavigationComponent,
    SafeHtmlPipe,
    OrdinalPipe,
    IconComponent
  ],
  exports: [
    ErrorModalComponent,
    BreadcrumbComponent,
    NavigationComponent,
    SafeHtmlPipe,
    OrdinalPipe,
    IconComponent
  ],
  providers: [],
  entryComponents: [
    ErrorModalComponent,
  ],
  bootstrap: [],
})
export class SharedModule {}
