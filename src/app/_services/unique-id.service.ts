import { Injectable } from '@angular/core';

/**
 * Generated unique String id's to identify elements in front-end
 */
@Injectable()
export class UniqueIdService {
  /** Increase the counter with each request */
  private _counter = 0;

  /** Constructor */
  constructor() {}

  /**
   * We get an unique Id as a string
   */
  getNewId = () => (this._counter += 1).toString();
}
