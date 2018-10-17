import { DomSanitizer } from '@angular/platform-browser';
import { PipeTransform, Pipe } from '@angular/core';

/**
 * Documentation about DomSanitizer
 * https://medium.com/@swarnakishore/angular-safe-pipe-implementation-to-bypass-domsanitizer-stripping-out-content-c1bf0f1cc36b
 */
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
