import { OverlayRef } from '@angular/cdk/overlay';

export class GenericOverlayRef {
  constructor(private overlayRef: OverlayRef) {}

  close(): void {
    this.overlayRef.dispose();
  }
}
