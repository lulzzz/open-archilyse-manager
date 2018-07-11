import {
  trigger,
  transition,
  query,
  stagger,
  animateChild,
  style,
  animate,
} from '@angular/animations';

export const list = trigger('list', [
  transition(':enter', [
    // child animation selector + stagger
    query('@items', stagger(160, animateChild()), { optional: true }),
  ]),
]);

export const items = trigger('items', [
  // cubic-bezier for a tiny bouncing feel
  transition(':enter', [
    style({ transform: 'translateY(20px) scale(1)', opacity: 0 }),
    animate('800ms cubic-bezier(.8,-0.6,0.2,1.5)', style({ transform: 'scale(1)', opacity: 1 })),
  ]),
  transition(':leave', [
    style({ transform: 'translateY(0px) scale(1)', opacity: 1, height: '*' }),
    animate(
      '800ms cubic-bezier(.52,.01,.2,1.5)',
      style({ transform: 'scale(0.8)', opacity: 0, height: '0px', margin: '0px' })
    ),
  ]),
]);
