import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class DiagramEvent {
  uniqueId: number;
  data;

  constructor(uniqueId, data) {
    this.uniqueId = uniqueId;
    this.data = data;
  }
}

export class ElementEvent {
  x: number;
  y: number;
  type: string;

  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
}

@Injectable()
export class DiagramService {
  constructor() {}

  private uniqueId = 1000;

  private eventData = new Subject<DiagramEvent>();
  eventData$ = this.eventData.asObservable();

  private elementDropped = new Subject();
  elementDropped$ = this.elementDropped.asObservable();


  private seatSelected = new Subject<ElementEvent>();
  seatSelected$ = this.seatSelected.asObservable();

  private heatmapSelected = new Subject<number>();
  heatmapSelected$ = this.heatmapSelected.asObservable();

  private layoutSelected = new Subject<number>();
  layoutSelected$ = this.layoutSelected.asObservable();

  private currentScale = new Subject<number>();
  currentScale$ = this.currentScale.asObservable();

  private isHeatmapDisplayed = new BehaviorSubject(true);
  isHeatmapDisplayed$ = this.isHeatmapDisplayed.asObservable();

  private isIsoViewDisplayed = new BehaviorSubject(false);
  isIsoViewDisplayed$ = this.isIsoViewDisplayed.asObservable();

  private areAreasDisplayed = new BehaviorSubject(false);
  areAreasDisplayed$ = this.areAreasDisplayed.asObservable();

  private areAreasDifferenceDisplayed = new BehaviorSubject(false);
  areAreasDifferenceDisplayed$ = this.areAreasDifferenceDisplayed.asObservable();

  private areSeatsDisplayed = new BehaviorSubject(true);
  areSeatsDisplayed$ = this.areSeatsDisplayed.asObservable();

  private displayMode = new Subject<string>();
  displayMode$ = this.displayMode.asObservable();

  private downloadImage = new Subject<number>();
  downloadImage$ = this.downloadImage.asObservable();

  private isElementSidebarDisplayed = new BehaviorSubject(true);
  isElementSidebarDisplayed$ = this.isElementSidebarDisplayed.asObservable();

  getUniqueId() {
    this.uniqueId += 1;
    return this.uniqueId;
  }

  /** Events */

  noEventFired(uniqueId) {
    this.eventData.next(new DiagramEvent(uniqueId, null));
  }

  eventFired(uniqueId, data) {
    this.eventData.next(new DiagramEvent(uniqueId, data));
  }

  /** event */


  newElementDropped(data: ElementEvent) {
    this.elementDropped.next(data);
  }


  /** Seat */

  noSeatSelected() {
    this.seatSelected.next(null);
  }

  selectSeat(seatId) {
    this.seatSelected.next(seatId);
  }

  /** Layout */

  noLayoutSelected() {
    this.layoutSelected.next(null);
  }

  selectLayout(layoutId) {
    this.layoutSelected.next(layoutId);
  }

  /** Heatmap */

  noHeatmapSelected() {
    this.heatmapSelected.next(null);
  }

  selectHeatmap(heatmapId) {
    console.log('selectHeatmap ', heatmapId);
    this.heatmapSelected.next(heatmapId);
  }

  /** Display Heatmap */

  displayHeatmap(isDisplayed) {
    this.isHeatmapDisplayed.next(isDisplayed);
  }

  /** Display Isometric */
  displayIso(isDisplayed) {
    this.isIsoViewDisplayed.next(isDisplayed);
  }

  /** Display Areas in heatmap */
  displayAreas(areDisplayed) {
    this.areAreasDisplayed.next(areDisplayed);
  }

  /** Display Difference Areas in heatmap */
  displayDifferenceAreas(areDisplayed) {
    this.areAreasDifferenceDisplayed.next(areDisplayed);
  }

  /** Display Seats in heatmap */
  displaySeats(areDisplayed) {
    this.areSeatsDisplayed.next(areDisplayed);
  }

  /** Display Seats in heatmap */
  displayElementSidebarDisplayed(isDisplayed) {
    this.isElementSidebarDisplayed.next(isDisplayed);
  }


  /** Display Mode in heatmap */
  changeDisplayMode(mode) {
    this.displayMode.next(mode);
  }

  /** Scale */

  selectScale(scale) {
    this.currentScale.next(scale);
  }

  /** Capture Image */
  captureImage() {
    this.downloadImage.next();
  }

  resetControls() {
    console.log('Reset controls');

    this.isHeatmapDisplayed.next(true);
    this.isIsoViewDisplayed.next(false);
    this.areAreasDisplayed.next(false);
    this.areAreasDifferenceDisplayed.next(false);
    this.areSeatsDisplayed.next(true);
    this.displayMode.next('Diff');
  }
}
