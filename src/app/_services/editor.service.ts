import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export class EditorEvent {
  uniqueId: number;
  data;

  constructor(uniqueId, data) {
    this.uniqueId = uniqueId;
    this.data = data;
  }
}

@Injectable()
export class EditorService {
  constructor() {}

  private uniqueId = 1000;

  private eventData = new Subject<EditorEvent>();
  eventData$ = this.eventData.asObservable();

  getUniqueId() {
    this.uniqueId += 1;
    return this.uniqueId;
  }

  /** Events */

  noEventFired(uniqueId) {
    this.eventData.next(new EditorEvent(uniqueId, null));
  }

  eventFired(uniqueId, data) {
    this.eventData.next(new EditorEvent(uniqueId, data));
  }

  resetControls() {
    console.log('Reset controls');
  }
}
