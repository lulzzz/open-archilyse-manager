import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileInputDirective } from './file-input.directive';
import { ClickStopPropagationDirective } from './click-propogation.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [FileInputDirective, ClickStopPropagationDirective],
  exports: [FileInputDirective, ClickStopPropagationDirective],
})
export class SharedDirectiveModule {}
