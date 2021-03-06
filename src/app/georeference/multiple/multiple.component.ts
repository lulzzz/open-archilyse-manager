import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BatchService } from '../../_services';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../../environments/environment';
import { parseParms } from '../../_shared-libraries/Url';

@Component({
  selector: 'app-multiple',
  templateUrl: './multiple.component.html',
  styleUrls: ['./multiple.component.scss'],
})
export class MultipleComponent implements OnInit, OnDestroy {
  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private batchService: BatchService
  ) {}

  /** Number of lines for the batch */
  numberOfLines = 0;

  /** Global error */
  error = null;

  /** First building to link to */
  firstBuilding = null;
  /** First layout to link to */
  firstLayout = null;

  /** Main form has the list for the batch and the map source OSM or ST */
  geoForm = new FormGroup({
    list: new FormControl('', Validators.required),
    source: new FormControl(''),
  });

  /**
   * We subscribe to the route fragment to read the parameters set in the URL with HASH
   * list
   * source
   */
  ngOnInit() {
    this.fragment_sub = this.route.fragment.subscribe(fragment => {
      const urlParams = parseParms(fragment);
      if (urlParams.hasOwnProperty('list')) {
        this.list.setValue(urlParams['list']);
        this.reviewText(urlParams['list']);
      }
      if (urlParams.hasOwnProperty('source')) {
        const newValue = urlParams['source'];
        this.source.setValue(newValue);
        this.batchService.setSource(newValue);
      }
    });
  }

  /** form list getter */
  get list() {
    return this.geoForm.get('list');
  }

  /** form source getter */
  get source() {
    return this.geoForm.get('source');
  }

  /**
   * Link to normal input.
   * We keep the source selection in the URL
   */
  normal() {
    const extras = {};

    if (this.source.value && this.source.value !== '') {
      extras['fragment'] = 'source=' + this.source.value;
    }

    this._router.navigate(['georeference'], extras);
  }

  /** Link to the portfolio*/
  portfolio() {
    this._router.navigate(['manager']);
  }

  /**
   * We listen to key down events to be able to have TABS in the list
   * @param event
   */
  onKeydown(event) {
    if (event.key === 'Tab') {
      //  && !event.shiftKey
      event.preventDefault();

      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;

      event.target.value =
        event.target.value.substring(0, start) +
        '\t' +
        event.target.value.substring(end);

      event.target.selectionStart = event.target.selectionEnd = start + 1;
    }
  }

  /** We display an error from one of the batch lines */
  addErrorLine(line, error) {
    const text = `Line ${line + 1} ${error}`;
    if (this.error === null) {
      this.error = text;
    } else {
      this.error = `${this.error}<br/>${text}`;
    }
  }

  /** We review all the text from the batch */
  reviewText(textValue) {
    const textValueLines = textValue.split('\n');
    this.error = null;

    this.firstBuilding = null;
    this.firstLayout = null;

    const lines = [];

    let numberOfLines = 0;
    for (let i = 0; i < textValueLines.length; i += 1) {
      const line = textValueLines[i];
      if (line !== '') {
        let lineParts = line.split(';');
        if (lineParts.length <= 1) {
          lineParts = line.split('\t');
        }

        if (lineParts.length <= 1) {
          this.addErrorLine(i, 'has no unitId, separate it with a tab or ";"');
        } else if (lineParts.length === 2) {
          let buildingId = lineParts[0];
          let layoutId = lineParts[1];

          if (buildingId.length !== 0 && buildingId.length !== 24) {
            this.addErrorLine(
              i,
              'should have a building Id with 24 hexadecimal characters, has ' +
                buildingId.length
            );
          } else if (
            buildingId.length !== 0 &&
            !buildingId.match(/^[0-9a-fA-F]{24}$/)
          ) {
            this.addErrorLine(
              i,
              'has a wrong buildingId, should have 24 hexadecimal characters'
            );
          } else if (layoutId.length !== 0 && layoutId.length !== 24) {
            this.addErrorLine(
              i,
              'should have a layout Id with 24 hexadecimal characters, has ' +
                layoutId.length
            );
          } else if (
            layoutId.length !== 0 &&
            !layoutId.match(/^[0-9a-fA-F]{24}$/)
          ) {
            this.addErrorLine(
              i,
              'has a wrong layoutId, should have 24 hexadecimal characters'
            );
          } else {
            if (buildingId === '') {
              buildingId = null;
            }
            if (layoutId === '') {
              layoutId = null;
            }

            if (this.firstBuilding === null && this.firstLayout === null) {
              this.firstBuilding = buildingId;
              this.firstLayout = layoutId;
            } else {
              lines.push({
                building: buildingId,
                layout: layoutId,
              });
            }
          }
        } else {
          this.addErrorLine(i, 'has too many parts');
        }
        numberOfLines += 1;
      }
    }

    this.batchService.setLines(lines);
    this.numberOfLines = numberOfLines;
  }

  /** Start the batch process */
  start() {
    /**
     * We've to review before submitting
     */
    this.reviewText(this.geoForm.get('list').value);

    if (
      this.error === null &&
      (this.firstBuilding !== null || this.firstLayout !== null)
    ) {
      if (this.firstBuilding !== null && this.firstLayout !== null) {
        this._router.navigate([
          'georeference',
          'map',
          this.firstBuilding,
          this.firstLayout,
        ]);
      } else if (this.firstBuilding !== null) {
        this._router.navigate(['georeference', 'map', this.firstBuilding]);
      } else if (this.firstLayout !== null) {
        this._router.navigate(['georeference', 'building', this.firstLayout]);
      } else {
        console.error('Imposible situation');
      }
    }
  }

  /**
   * Change the source of the surroundings
   */
  selectSource(newValue) {
    this.batchService.setSource(newValue);
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
