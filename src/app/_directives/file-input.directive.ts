import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appFileInput]',
})
export class FileInputDirective {
  fileName: string;

  constructor() {}

  @HostListener('input', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    console.log(input);
  }
}
