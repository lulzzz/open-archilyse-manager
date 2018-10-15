import { Injectable } from '@angular/core';

@Injectable()
export class UniqueIdService {
  counter = 0;
  constructor() {}

  /**
   * We get an unique Id as a string
   */
  getNewId = () => (this.counter += 1).toString();
}
