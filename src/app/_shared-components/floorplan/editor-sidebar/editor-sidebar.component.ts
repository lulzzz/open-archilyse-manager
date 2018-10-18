import {
  Component,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-editor-sidebar',
  templateUrl: './editor-sidebar.component.html',
  styleUrls: ['./editor-sidebar.component.scss'],
})
export class EditorSidebarComponent implements OnInit, OnChanges, OnDestroy {
  @Output() close = new EventEmitter<void>();

  /** Sidebar title */
  title;

  /** Sidebar subtitle or description */
  description;

  /** Sidebar content */
  content;

  /** Sidebar footer */
  footer;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {}

  mousemoveListener(event: any) {
    // event.preventDefault();
    // event.stopPropagation();
  }

  mouseoutListener(event: any) {
    // event.preventDefault();
    event.stopPropagation();
  }

  mousedownListener(event: any) {
    // console.log('mousedownListener', event, event.target);
    // event.target.focus();
    // const selection = window.getSelection();
    // console.log('selection', selection);
    // event.preventDefault();
    event.stopPropagation();
  }

  /** Click event */
  onClick(event: any) {
    // console.log('onClick');
    // event.preventDefault();
    event.stopPropagation();
  }
}
