import { environment } from '../../environments/environment';

/**
 * Collection of functions to centralize the API calls.
 */
export class ApiFunctions {
  /**
   * Helper function for API GET requests
   * @param httpService
   * @param url
   * @param onComplete
   * @param onError
   * @param options
   */
  public static get(httpService, url, onComplete, onError?, options?) {
    return httpService
      .get(environment.apiUrl + url, options)
      .subscribe(onComplete, onError ? onError : console.error);
  }

  /**
   * Helper function for API POST requests
   * @param httpService
   * @param url
   * @param onComplete
   * @param onError
   * @param options
   */
  public static post(httpService, url, params, onComplete, onError?) {
    return httpService
      .post(environment.apiUrl + url, params)
      .subscribe(onComplete, onError ? onError : console.error);
  }

  /**
   * Helper function for API DELETE requests
   * @param httpService
   * @param url
   * @param onComplete
   * @param onError
   * @param options
   */
  public static delete(httpService, url, onComplete, onError?) {
    return httpService
      .delete(environment.apiUrl + url)
      .subscribe(onComplete, onError ? onError : console.error);
  }

  /**
   * Helper function for API PATCH requests
   * @param httpService
   * @param url
   * @param onComplete
   * @param onError
   * @param options
   */
  public static patch(httpService, url, params, onComplete, onError?) {
    return httpService
      .patch(environment.apiUrl + url, params)
      .subscribe(onComplete, onError ? onError : console.error);
  }

  /**
   * Helper funtion to request a DPOI path to the API
   * @param httpService
   * @param coord   origin coordinate [x,y]
   * @param coordDest   destination coordinate [x,y]
   * @param vehicle   foot / car / bicycle
   * @param onComplete  result function
   * @param onError  error function
   */
  public static getPath(
    httpService,
    coord,
    coordDest,
    vehicle,
    onComplete,
    onError?
  ) {
    if (
      coord &&
      coord.latitude &&
      coord.longitude &&
      coordDest &&
      coordDest.latitude &&
      coordDest.longitude
    ) {
      const url =
        `?point=${coord.latitude}%2C${coord.longitude}&point=${
          coordDest.latitude
        }%2C${coordDest.longitude}` +
        `&type=json&locale=en-US&vehicle=${vehicle}&points_encoded=false&vehicle=car&weighting=fastest&elevation=false&use_miles=false&layer=Omniscale`;

      // TODO: Debug only
      onComplete(
        JSON.parse(
          '{"hints":{"visited_nodes.average":"68.0","visited_nodes.sum":"68"},"paths":[{"instructions":[{"distance":41.496,"sign":0,"interval":[0,1],"text":"Continue","time":29876,"street_name":""},{"distance":250.065,"sign":2,"interval":[1,5],"text":"Turn right onto Fischerweg","time":180046,"street_name":"Fischerweg"},{"distance":175.588,"sign":-2,"interval":[5,8],"text":"Turn left onto Ampèresteg","time":126419,"street_name":"Ampèresteg"},{"distance":3.063,"sign":-2,"interval":[8,9],"text":"Turn left onto Breitensteinstrasse","time":2205,"street_name":"Breitensteinstrasse"},{"distance":70.316,"sign":2,"interval":[9,10],"text":"Turn right","time":50627,"street_name":""},{"distance":153.845,"sign":-2,"interval":[10,13],"text":"Turn left onto Im Sydefädeli","time":110767,"street_name":"Im Sydefädeli"},{"distance":56.873,"sign":2,"interval":[13,15],"text":"Turn right","time":40948,"street_name":""},{"distance":33.228,"sign":2,"interval":[15,18],"text":"Turn right onto Waidfussweg","time":23922,"street_name":"Waidfussweg"},{"distance":4.088,"sign":3,"interval":[18,19],"text":"Turn sharp right onto Hönggerstrasse","time":2943,"street_name":"Hönggerstrasse"},{"distance":76.071,"sign":2,"interval":[19,22],"text":"Turn right","time":54771,"street_name":""},{"distance":0.0,"sign":4,"interval":[22,22],"text":"Arrive at destination","time":0,"street_name":""}],"descend":0.0,"ascend":0.0,"distance":864.633,"bbox":[8.515908,47.392181,8.519887,47.395564],"weight":514.405905,"points_encoded":false,"points":{"coordinates":[[8.515908,47.392774],[8.516123,47.393117],[8.516717,47.392898],[8.516887,47.392819],[8.517761,47.392524],[8.519133,47.392181],[8.519178,47.392904],[8.519492,47.393464],[8.519654,47.393695],[8.519617,47.393706],[8.519887,47.394311],[8.51906,47.394565],[8.518494,47.394707],[8.517983,47.394806],[8.518046,47.394994],[8.518091,47.395311],[8.518154,47.395311],[8.518187,47.39547],[8.518157,47.395564],[8.518211,47.395558],[8.518291,47.395445],[8.518587,47.395385],[8.519046,47.395227]],"type":"LineString"},"transfers":0,"legs":[],"details":{},"time":622524,"snapped_waypoints":{"coordinates":[[8.515908,47.392774],[8.519046,47.395227]],"type":"LineString"}}],"info":{"took":5,"copyrights":["GraphHopper","OpenStreetMap contributors"]}}'
        )
      );

      /**
      return httpService
        .get(apiPath + url)
        .subscribe(onComplete, onError ? onError : console.error);
       */
    }

    if (onError) {
      return onError('Parameters not properly set ', coord, coordDest);
    }
    console.error('Parameters not properly set ', coord, coordDest);
  }
}
