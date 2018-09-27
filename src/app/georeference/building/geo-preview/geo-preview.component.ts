import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-geo-preview',
  templateUrl: './geo-preview.component.html',
  styleUrls: ['./geo-preview.component.scss'],
})
export class GeoPreviewComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() preset = new EventEmitter<number | null>();

  @Input() previewImages;
  @Input() currentPreset;

  widthPrev;
  heightPrev;

  windowListener;

  constructor() {}

  ngOnInit() {
    this.windowListener = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.windowListener, false);

    this.setUp();
  }

  onWindowResize() {
    this.setUp();
  }

  /**
   * Depending on the resolution we display the previews in different sizes
   */
  setUp() {
    const clientHeight = document.body.clientHeight;

    if (clientHeight > 850) {
      this.widthPrev = 355;
      this.heightPrev = (clientHeight - 175) / 6;
    } else {
      this.widthPrev = 170;
      this.heightPrev = 170;
    }
  }

  public onCloseEventStop(event: any): void {
    event.stopPropagation(event);
    this.close.emit();
  }

  /**
   * We avoid the mouse mouse event to propagate in the sidebar
   * @param event
   */
  public onEventStop(event: any): void {
    event.stopPropagation();
  }

  ngOnDestroy(): void {}
}
