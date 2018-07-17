import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NavigationService {
  constructor() {}

  private current = new Subject<string>();
  current$ = this.current.asObservable();

  private diagramLinkActive = new Subject<boolean>();
  diagramLinkActive$ = this.diagramLinkActive.asObservable();

  private options = new Subject<any[]>();
  options$ = this.options.asObservable();

  /**
   * Current navigation option selected
   * @param value
   */
  setCurrent(value) {
    this.current.next(value);
  }

  setDiagramLinkActive(value: boolean) {
    this.diagramLinkActive.next(value);
  }

  /**
   * Current navigation options
   * @param options
   */
  setOptions(options) {
    this.options.next(options);
  }
}
