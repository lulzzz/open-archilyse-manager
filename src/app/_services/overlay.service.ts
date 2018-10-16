import { Injectable, Inject, OnInit, Injector, ComponentRef } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

import { InfoBoxOverlayComponent } from '../_shared-components/overlays/info-box-overlay/info-box-overlay.component';

import { GenericOverlayRef } from '../_shared-components/overlays/generic-overlay-ref';
import { INFO_BOX_OVERLAY_DATA } from '../_shared-components/overlays/info-box-overlay/info-box-overlay.tokens';

interface InfoBoxDialogConfig {
  panelClass?: string;
  hasBackdrop?: boolean;
  backdropClass?: string;
  data?: any;
  // image?: Image;
}

const DEFAULT_CONFIG: InfoBoxDialogConfig = {
  hasBackdrop: true,
  backdropClass: 'dark-backdrop',
  panelClass: 'info-box-dialog-panel',
};

@Injectable()
export class OverlayService {
  constructor(private injector: Injector, private overlay: Overlay) {}

  open(config: InfoBoxDialogConfig = {}) {
    // Override default configuration
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };

    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(dialogConfig);

    // Instantiate remote control
    const dialogRef = new GenericOverlayRef(overlayRef);

    const overlayComponent = this.attachDialogContainer(overlayRef, dialogConfig, dialogRef);

    overlayRef.backdropClick().subscribe(_ => dialogRef.close());

    return dialogRef;
  }

  private createOverlay(config: InfoBoxDialogConfig) {
    const overlayConfig = this.getOverlayConfig(config);
    return this.overlay.create(overlayConfig);
  }

  private attachDialogContainer(
    overlayRef: OverlayRef,
    config: InfoBoxDialogConfig,
    dialogRef: GenericOverlayRef
  ) {
    const injector = this.createInjector(config, dialogRef);

    const containerPortal = new ComponentPortal(InfoBoxOverlayComponent, null, injector);
    const containerRef: ComponentRef<InfoBoxOverlayComponent> = overlayRef.attach(containerPortal);

    return containerRef.instance;
  }

  private createInjector(
    config: InfoBoxDialogConfig,
    dialogRef: GenericOverlayRef
  ): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(GenericOverlayRef, dialogRef);
    injectionTokens.set(INFO_BOX_OVERLAY_DATA, config.data);

    return new PortalInjector(this.injector, injectionTokens);
  }

  private getOverlayConfig(config: InfoBoxDialogConfig): OverlayConfig {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    /**
     * Overlay config
     */
    return new OverlayConfig({
      positionStrategy,
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
  }
}
