import { Injectable } from '@angular/core';

@Injectable()
export class LogService {
  constructor() {}

  private requestLog = [];

  addRequest(url, request) {
    console.log('LogService request', request);
    this.requestLog.push({
      request: request,
      url: url,
      time: new Date().getTime(),
    });
  }

  getRequestLog() {
    return this.requestLog;
  }
}
