import { trigger, transition, query, animateChild } from '@angular/animations';

export const ngIfAnimation = trigger('ngIfAnimation', [
  transition(':enter, :leave', [query('@*', animateChild(), { optional: true })]),
]);
