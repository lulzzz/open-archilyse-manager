const apiUrl = 'https://api.archilyse.com/v0.1/';

export class ApiFunctions {
  public static get(httpService, url, onComplete, onError?) {
    return httpService.get(apiUrl + url).subscribe(onComplete, onError ? onError : console.error);
  }
  public static post(httpService, url, params, onComplete, onError?) {
    return httpService
      .post(apiUrl + url, params)
      .subscribe(onComplete, onError ? onError : console.error);
  }
  public static delete(httpService, url, onComplete, onError?) {
    return httpService
      .delete(apiUrl + url)
      .subscribe(onComplete, onError ? onError : console.error);
  }
  public static patch(httpService, url, params, onComplete, onError?) {
    return httpService
      .patch(apiUrl + url, params)
      .subscribe(onComplete, onError ? onError : console.error);
  }
}
