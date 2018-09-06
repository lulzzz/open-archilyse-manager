import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NavigationService {
  private current = new Subject<string>();
  current$ = this.current.asObservable();

  private diagramLinkActive = new Subject<boolean>();
  diagramLinkActive$ = this.diagramLinkActive.asObservable();

  private options = new Subject<any[]>();
  options$ = this.options.asObservable();

  public profile;
  public profile$;

  constructor() {
    const initialValue = localStorage.getItem('profile');
    console.log('initialValue', initialValue);
    if (initialValue) {
      this.profile = new BehaviorSubject<string>(initialValue);
    } else {
      this.profile = new BehaviorSubject<string>('manager');
    }
    this.profile$ = this.profile.asObservable();
  }

  /**
   * Current profile option selected
   * @param value
   */
  setProfile(value) {
    this.profile.next(value);
    localStorage.setItem('profile', value);
    // location.reload();
  }

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
