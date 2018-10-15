import { register as RegisterProjections } from 'ol/proj/proj4';
import proj4 from 'proj4';

/**
 * We define the Swiss topo (EPSG:2056) and EPSG:3035 projection.
 * EPSG:2056
 * http://spatialreference.org/ref/epsg/ch1903-lv95/
 * EPSG:3035
 * http://spatialreference.org/ref/epsg/etrs89-etrs-laea/
 */

export function registerAllProjections() {
  /**
   * EPSG:2056 definition
   */
  proj4.defs(
    'EPSG:2056',
    '+proj=somerc ' +
      '+lat_0=46.95240555555556 +lon_0=7.439583333333333 ' +
      '+k_0=1 +x_0=2600000 +y_0=1200000 ' +
      '+ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
  );

  /**
   * EPSG:3035 definition
   */
  proj4.defs(
    'EPSG:3035',
    '+proj=laea ' +
      '+lat_0=52 +lon_0=10 +x_0=4321000 ' +
      '+y_0=3210000 ' +
      '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
  );

  RegisterProjections(proj4);
}
