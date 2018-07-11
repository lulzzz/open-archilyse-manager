import { trigger, transition, style, animate } from '@angular/animations';

export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('600ms cubic-bezier(0.2, 1, 0.3, 1)', style({ transform: 'translateX(0%)' })),
  ]),
  transition(':leave', [
    animate('600ms cubic-bezier(0.2, 1, 0.3, 1)', style({ transform: 'translateX(100%)' })),
  ]),
]);
