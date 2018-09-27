import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class BatchService {
  constructor() {}

  private lines = new BehaviorSubject([]);
  lines$ = this.lines.asObservable();

  private source = new BehaviorSubject(null);
  source$ = this.source.asObservable();

  private coordinates = new BehaviorSubject(null);
  coordinates$ = this.coordinates.asObservable();

  /** Coordinate Sytem defined by the user */

  setCoordinates(coordinates) {
    this.coordinates.next(coordinates);
  }

  getCoordinates() {
    return this.coordinates.getValue();
  }

  /** Data source defined by the user */

  setSource(source) {
    this.source.next(source);
  }

  getSource() {
    return this.source.getValue();
  }

  /** Next batch lines to process */

  setLines(lines) {
    this.lines.next(lines);
  }

  getLines() {
    return this.lines.getValue();
  }

  hasNextLine() {
    const lines = this.getLines();
    if (lines && lines !== null) {
      return lines.length > 0;
    }
    return 0;
  }

  getNextLine() {
    const lines = this.getLines();

    if (lines && lines !== null && lines.length > 0) {
      const nextLine = lines.shift(); // .pop();
      this.setLines(lines);
      return nextLine;
    }
    return null;
  }
}
