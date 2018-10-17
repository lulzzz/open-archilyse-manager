import { Injectable } from '@angular/core';

/**
 * Generated unique String id's to identify elements in front-end
 */
@Injectable()
export class UniqueIdService {
  counter = 0;
  constructor() {}

  /**
   * We get an unique Id as a string
   */
  getNewId = () => (this.counter += 1).toString();
}
