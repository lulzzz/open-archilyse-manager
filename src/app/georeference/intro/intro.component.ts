import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BatchService } from '../../_services';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../../environments/environment';
import { parseParms } from '../../_shared-libraries/Url';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent implements OnInit, OnDestroy {
  /** References could be: open_street_maps | swiss_topo */
  referenceSource = '';

  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private batchService: BatchService
  ) {}

  /** buildingId form and for LayoutId */
  buildingForm = new FormGroup({
    building: new FormControl('', Validators.required),
  });

  /** LayoutId form */
  layoutForm = new FormGroup({
    layout: new FormControl('', Validators.required),
  });

  /**
   * We subscribe to url # changes and assign them to our forms
   */
  ngOnInit() {
    this.fragment_sub = this.route.fragment.subscribe(fragment => {
      console.log('fragment', fragment);

      const urlParams = parseParms(fragment);
      if (urlParams.hasOwnProperty('building')) {
        this.building.setValue(urlParams['building']);
      }
      if (urlParams.hasOwnProperty('layout')) {
        this.layout.setValue(urlParams['layout']);
      }
      if (urlParams.hasOwnProperty('source')) {
        this.referenceSource = urlParams['source'];
      }
    });

    this.batchService.setLines(null);
  }

  /**
   * Form methods
   */

  /** form building getter */
  get building() {
    return this.buildingForm.get('building');
  }

  /** form layout getter */
  get layout() {
    return this.layoutForm.get('layout');
  }

  /**
   * We link to georeference a building with the selected source if any
   */
  startBuilding() {
    const building = this.buildingForm.get('building').value;

    const extras = {};
    if (this.referenceSource && this.referenceSource !== '') {
      extras['fragment'] = 'source=' + this.referenceSource;
    }

    this._router.navigate(['georeference', 'map', building], extras);
  }

  /**
   * We link to georeference a layout with the selected source if any
   */
  startLayout() {
    const layout = this.layoutForm.get('layout').value;

    const extras = {};
    if (this.referenceSource && this.referenceSource !== '') {
      extras['fragment'] = 'source=' + this.referenceSource;
    }

    this._router.navigate(['georeference', 'building', layout], extras);
  }

  /**
   * Link to batch input.
   * We keep the source selection in the URL
   */
  batch() {
    const extras = {};
    if (this.referenceSource && this.referenceSource !== '') {
      extras['fragment'] = 'source=' + this.referenceSource;
    }

    this._router.navigate(['georeference', 'multiple'], extras);
  }

  /**
   * Link to the portfolio
   */
  portfolio() {
    location.assign(environment.urlPortfolio);
  }

  /**
   * Change the source of the surroundings
   */
  selectSource(newValue) {
    this.referenceSource = newValue;
  }

  /**
   * We unsubscribe from the URL
   */
  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
