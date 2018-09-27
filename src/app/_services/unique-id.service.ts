import { Injectable } from '@angular/core';

@Injectable()
export class UniqueIdService {
  counter = 0;
  constructor() {}
  getNewId = () => (this.counter += 1).toString();
}
