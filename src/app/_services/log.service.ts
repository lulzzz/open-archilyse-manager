import { Injectable } from '@angular/core';

/**
 * The LogService stores all the requests done to be displayed in the API usage log for developers
 */
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
