import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

/**
 * This event identifies an elements and brings data attached.
 */
export class EditorEvent {
  /** Id of the element to triggered the event
   *  This way we avoid an item to react to himself
   * */
  uniqueId: number;

  /** Data regarding the specific event */
  data;

  constructor(uniqueId, data) {
    this.uniqueId = uniqueId;
    this.data = data;
  }
}

@Injectable()
/**
 *  The EditorService communicates the editor ad the sidebar to work together and in a bi-directional way.
 *  Changes in the editor are displayed in the sidebar, and changes in the sidebar are displayed in the editor
 */
export class EditorService {
  /** Constructor */
  constructor() {}

  /** Counter to have unique identifiers */
  private uniqueId = 1000;

  private eventData = new Subject<EditorEvent>();
  eventData$ = this.eventData.asObservable();

  /** Gets local unique identifiers */
  getUniqueId() {
    this.uniqueId += 1;
    return this.uniqueId;
  }

  /** We set the current event to null, nothing has to be done (Ex: On mouse out events)*/
  noEventFired(uniqueId) {
    this.eventData.next(new EditorEvent(uniqueId, null));
  }

  /** Something happend we have to react to it (Ex: Mouse over or mouse click)*/
  eventFired(uniqueId, data) {
    this.eventData.next(new EditorEvent(uniqueId, data));
  }
}
