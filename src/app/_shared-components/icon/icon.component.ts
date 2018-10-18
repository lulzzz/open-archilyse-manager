import { Component, Input } from '@angular/core';

/**
 * Allows to display the specified icon
 */
@Component({
  selector: 'app-icon',
  template: `
  <div class="icon-wrapper" [ngClass]="{'small': small, 'medium': medium}">
    <i class="far {{icon}}"></i><ng-template></ng-template>
  </div>
  `,
  styles: [
    `
  .icon-wrapper {
    width: 36px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: inherit;
  }
    `,
  ],
})
export class IconComponent {
  @Input() icon;
  @Input() color;
  @Input() spin;
  @Input() small: boolean;
  @Input() medium: boolean;

  constructor() {}
}
