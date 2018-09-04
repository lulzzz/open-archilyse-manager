import { Injectable } from '@angular/core';

@Injectable()
export class LogService {
  constructor() {}

  private requestLog = [];

  /**
   * Every time a request is done is stored here.
   * @param urlString
   * @param requestObject
   */
  addRequest(urlString, requestObject) {
    this.requestLog.push({
      request: requestObject,
      url: urlString,
      time: new Date().getTime(),
    });
  }

  /**
   * Gets all the requests done since the page was reloaded
   */
  getRequestLog() {
    return this.requestLog;
  }
}
