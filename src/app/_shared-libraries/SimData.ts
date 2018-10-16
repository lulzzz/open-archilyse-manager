import * as d3 from 'd3';
import { EditorConstants } from './EditorConstants';

// Each area has a different color
export const areaColors = [
  0xe6194b,
  0x0082c8,
  0x3cb44b,
  0xffe119,
  0xf58231,
  0x911eb4,
  0x46f0f0,
  0xf032e6,
  0xd2f53c,
  0xfabebe,
  0x008080,
  0xe6beff,
  0xaa6e28,
  0xfffac8,
  0x800000,
  0xaaffc3,
  0x808000,
  0xffd8b1,
  0x000080,
];

// Same colors, different format.
export const areaColorsHex = [
  '#e6194b',
  '#0082c8',
  '#3cb44b',
  '#ffe119',
  '#f58231',
  '#911eb4',
  '#46f0f0',
  '#f032e6',
  '#d2f53c',
  '#fabebe',
  '#008080',
  '#e6beff',
  '#aa6e28',
  '#fffac8',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000080',
];

/**
 * The Hexagons with this value are not displayed or taken into consideration
 * @type {number}
 */
export const EXCLUDED_NUMBER = -666;

/**
 * Coordinates constants to index point arrays
 * */
export const COOR_X = 0;
export const COOR_Y = 1;
export const COOR_Z = 2;

export const BOUND_X1 = 0;
export const BOUND_Y1 = 1;
export const BOUND_X2 = 2;
export const BOUND_Y2 = 3;

export const colors = [
  '#2c7bb6',
  '#00a6ca',
  '#00ccbc',
  '#90eb9d',
  '#ffff8c',
  '#f9d057',
  '#f29e2e',
  '#e76818',
  '#d7191c',
];

export const colorsCompareAB = [
  '#e0191d',
  '#e24445',
  '#d7666a',
  '#e8b5b8',
  '#ffffff',
  '#b0ecf2',
  '#67d0ee',
  '#0ca9ff',
  '#2989ff',
];

export const colorsCompareNeg = [
  '#d7191c',
  '#e76818',
  '#ff9e44',
  '#ffc495',
  '#e9e9e9',
  '#e0ffC0',
  '#80ff80',
  '#40ff40',
  '#00df00',
];

export const colorsComparePos = [
  '#e9e9e9',
  '#D0ffD0',
  '#C0ffC0',
  '#A0ffA0',
  '#80ff80',
  '#60ff60',
  '#40ff40',
  '#20ef20',
  '#00df00',
];

/**
 * Recursive function to analyze the bounding box of a model structure.
 * Triggered by the function "boundingBox"
 * @param polygonVertices
 * @param structure
 */
function boundingBoxRecursive(polygonVertices, structure) {
  if (
    structure.type === EditorConstants.BATHROOM ||
    structure.type === EditorConstants.AREA_KITCHEN_DINING ||
    structure.type === EditorConstants.SHAFT ||
    structure.type === EditorConstants.BALCONY ||
    structure.type === EditorConstants.CORRIDOR ||
    structure.type === EditorConstants.STOREROOM ||
    structure.type === EditorConstants.ROOM ||
    structure.type === EditorConstants.DINING ||
    structure.type === EditorConstants.AREA_NOT_DEFINED
  ) {
    polygonVertices.push(...structure.footprint.coordinates);
  }

  if (structure.children) {
    structure.children.forEach(childStructure => {
      boundingBoxRecursive(polygonVertices, childStructure);
    });
  }
}

/**
 * Calculation of the bounding box out of the modelStructure
 * @param modelStructure
 */
export function boundingBox(modelStructure) {
  console.log('boundingBox', modelStructure);

  const polygonVertices = [];
  modelStructure.floors.forEach(floor => {
    boundingBoxRecursive(polygonVertices, floor);
  });

  console.log(
    'polygonVertices',
    [[[0, 0], [50, 0], [0, 50], [-50, 0], [-50, -50]]],
    polygonVertices
  );

  // Here we calculate the bounding box
  let boxX1 = null;
  let boxX2 = null;
  let boxY1 = null;
  let boxY2 = null;
  polygonVertices.map(polygonVerticesRows => {
    polygonVerticesRows.map(polygonVertice => {
      const x = polygonVertice[COOR_X];
      const y = polygonVertice[COOR_Y];

      if (!boxX1) {
        boxX1 = x;
        boxX2 = x;
        boxY1 = y;
        boxY2 = y;
      } else {
        if (x < boxX1) {
          boxX1 = x;
        }
        if (x > boxX2) {
          boxX2 = x;
        }
        if (y < boxY1) {
          boxY1 = y;
        }
        if (y > boxY2) {
          boxY2 = y;
        }
      }
    });
  });

  return {
    x1: boxX1,
    x2: boxX2,
    y1: boxY1,
    y2: boxY2,
  };
}

export function svgToImg(container, newContainer) {
  // let width = container.node().width();
  //  console.log('width', width);

  const doctype =
    '<?xml version="1.0" standalone="no"?>' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
  // +'<svg width="1000" height="500">'

  const node = container.node();

  const ref_width = node.width.baseVal.value;
  const ref_height = node.height.baseVal.value;
  const ref_id = node.id;

  // serialize our SVG XML to a string.
  const source = new XMLSerializer().serializeToString(container.node()); // d3.select('svg').node());

  newContainer.select('img').remove();
  // container.select('g').remove();
  // console.log('XXXX', newContainer.select('#' + node.id));

  // create a file blob of our SVG.
  //  + '</svg>'
  const blob = new Blob([doctype + source], { type: 'image/svg+xml;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);

  // Put the svg into an image tag so that the Canvas element can read it in.
  const img = newContainer // d3.select('body')
    .append('img')
    .attr('width', 1)
    .attr('height', 1)
    .node();

  img.onload = function() {
    console.log('img.onload');

    // Now that the image has loaded, put the image into a canvas element.
    const canvas = newContainer // d3.select('body')
      .append('canvas')
      .style('display', 'none')
      .node();
    canvas.width = ref_width;
    canvas.height = ref_height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const canvasUrl = canvas.toDataURL('image/png');

    const img2 = newContainer // d3.select('body')
      // .append('img')
      .insert('img', ':first-child')
      .attr('id', ref_id + '_img')
      .attr('width', ref_width)
      .attr('height', ref_height)
      .style('position', 'absolute')
      .style('top', '0px')
      .style('left', '0px')
      .style('opacity', '0.8')
      .node();
    // this is now the base64 encoded version of our PNG! you could optionally
    // redirect the user to download the PNG by sending them to the url with
    // `window.location.href= canvasUrl`.
    img2.src = canvasUrl;
  };

  // start loading the image.
  img.src = url;
}

/**
 *
 * @param min
 * @param max
 * @returns {(v) => (string | any)}
 */
export function getNumberToHexFunction(min, max) {
  const domain = [];

  const grad = colors.length;
  for (let i = 0; i < grad; i += 1) {
    domain.push(i / grad * max);
  }
  const corrColor = d3
    .scaleLinear()
    .domain(domain)
    .range(colors);
  return v => {
    if (v === EXCLUDED_NUMBER) {
      return 'rgba(255,255,255,0)';
    }
    return corrColor(v);
  };
}

/**
 *  Gets the box containing the geometries
 * @param geometries
 * @param toInclude Array with the categories to include, null to include all.
 * @returns {any[]}
 */
export function geometriesToBounds(geometries, toInclude = null) {
  const bounds = [null, null, null, null];

  const keys = Object.keys(geometries);
  for (let i = 0; i < keys.length; i += 1) {
    const category = keys[i];
    // null to parse all categories, array to include only ones.
    if (toInclude === null || toInclude.indexOf(category) > -1) {
      const polygonList = geometries[category];
      for (let j = 0; j < polygonList.length; j += 1) {
        const polygon = polygonList[j];
        for (let k = 0; k < polygon.length; k += 1) {
          const points = polygon[k];

          const pointX = points[COOR_X];
          const pointY = points[COOR_Y];

          if (bounds[BOUND_X1] == null || bounds[BOUND_X1] > pointX) {
            bounds[BOUND_X1] = pointX;
          } // min x
          if (bounds[BOUND_Y1] == null || bounds[BOUND_Y1] > pointY) {
            bounds[BOUND_Y1] = pointY;
          } // min y

          if (bounds[BOUND_X2] == null || bounds[BOUND_X2] < pointX) {
            bounds[BOUND_X2] = pointX;
          } // max x
          if (bounds[BOUND_Y2] == null || bounds[BOUND_Y2] < pointY) {
            bounds[BOUND_Y2] = pointY;
          } // max y
        }
      }
    }
  }

  return bounds;
}

export function areBoundsVertical(bounds) {
  const height = bounds[BOUND_Y2] - bounds[BOUND_Y1];
  const width = bounds[BOUND_X2] - bounds[BOUND_X1];
  return height > width;
}

/**
 * Applies the same transformation as in the CSS translate
 * translate, scale and rotate
 *
 * @param x current position in the x, in pixels
 * @param y current position in the y, in pixels
 * @param tx translate in the x, in pixels
 * @param ty translate in the y, in pixels
 * @param sx scale in the X, 1 as reference
 * @param sy scale in the Y, 1 as reference
 * @param angle to rotate
 * @param w, with of the element
 * @param h, height of the element
 * @returns {number[]}
 */
export function translatePoint(x, y, tx, ty, sx, sy, angle, w, h) {
  const radians = angle * Math.PI / 180;

  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const cx = w / 2; // Center point X
  const cy = h / 2; // Center point Y

  const dx = x - cx; // Delta X, difference between X and the center.
  const dy = y - cy; // Delta Y, difference between Y and the center.

  const newX = cx + tx + (dx * cos - dy * sin) * sx;
  const newY = cy + ty + (dy * cos + dx * sin) * sy;

  return [Math.round(newX), Math.round(newY)];
}

/**
 * Transforms a point from the 2d dimension into the 3d - ISO dimension
 * @param x
 * @param y
 * @param options - an object with the same CSS transformations applied
 * @param w
 * @param h
 * @returns {number[]}
 */
export function pointToIsoPoint(x, y, options, w, h) {
  let tx = 0;
  let ty = 0;

  let sx = 1;
  let sy = 1;

  if (options.translateX) {
    tx = options.translateX;
  }
  if (options.translateY) {
    ty = options.translateY;
  }
  if (options.scaleX) {
    sx = options.scaleX;
  }
  if (options.scaleY) {
    sy = options.scaleY;
  }

  let angle = 0;
  if (options.rotate) {
    angle = options.rotate;
  }

  return translatePoint(x, y, tx, ty, sx, sy, angle, w, h);
}

/**
 * Transforms a point from the 3d - ISO dimension into the 2d dimension
 * @param x
 * @param y
 * @param options - an object with the same CSS transformations applied
 * @param w
 * @param h
 * @returns {number[]}
 */
export function isoPointToPoint(x, y, options, w, h) {
  let tx = 0;
  let ty = 0;

  let sx = 1;
  let sy = 1;

  if (options.translateX) {
    tx = -options.translateX;
  }
  if (options.translateY) {
    ty = -options.translateY;
  }
  if (options.scaleX) {
    sx = 1 / options.scaleX;
  }
  if (options.scaleY) {
    sy = 1 / options.scaleY;
  }

  let angle = 0;
  if (options.rotate) {
    angle = -options.rotate;
  }

  return translatePoint(x, y, tx, ty, sx, sy, angle, w, h);
}

// array of coordinates of each vertex of the polygon
// var polygon = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];
// insidePolygon([ 1.5, 1.5 ], polygon); // true

export function insidePolygon(point, vs) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  const x = point[0];
  const y = point[1];

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i += 1) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];

    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Draws the geometries including or excluding categories
 * @param _this
 * @param layer
 * @param colors
 * @param svgGeometries
 * @param categoriesToInclude null for all, array with values to include only some.
 * @param categoriesToAvoid null for any, array with values to exclude only some.
 */
export function drawGeometriesFilter(
  _this,
  layer,
  colors,
  svgGeometries,
  categoriesToInclude,
  categoriesToAvoid
) {
  for (const category in svgGeometries) {
    if (svgGeometries.hasOwnProperty(category)) {
      if (categoriesToAvoid !== null && categoriesToAvoid.includes(category)) {
        continue;
      }

      if (categoriesToInclude === null || categoriesToInclude.includes(category)) {
        if (colors[category]) {
          const color = colors[category];
          for (let i = 0; i < svgGeometries[category].length; i += 1) {
            _this.drawPolygon(svgGeometries[category][i], layer, color, category, i);
          }
        } else {
          console.error(`Color category doesn't exit`, category, colors);
        }
      }
    }
  }
}

/**
 *
 * @param dataArray
 * @param min
 * @param max
 * @param numSteps
 */
export function getHexColorsAndLegend(dataArray, min, max, numSteps = 30) {
  const flatArray = [].concat.apply([], dataArray);
  const numberToHex = getNumberToHexFunction(min, max);
  const hexColors = flatArray.map(el => numberToHex(el));

  const numDecimals = 1;

  const legend = {};
  const range = max - min;

  for (let i = 0; i < numSteps; i += 1) {
    const rawVal = min + range * i / numSteps;

    const value = rawVal.toFixed(numDecimals);
    legend[value] = numberToHex(rawVal);
  }

  return {
    hexColors,
    legend,
    max,
    min,
  };
}

export function svgBoundingBox(polygonVertices) {
  // Here we calculate the bounding box
  let boxX1 = null;
  let boxX2 = null;
  let boxY1 = null;
  let boxY2 = null;
  polygonVertices.map(polygonVerticesRows => {
    polygonVerticesRows.map(polygonVertice => {
      const x = polygonVertice[COOR_X];
      const y = polygonVertice[COOR_Y];

      if (!boxX1) {
        boxX1 = x;
        boxX2 = x;
        boxY1 = y;
        boxY2 = y;
      } else {
        if (x < boxX1) {
          boxX1 = x;
        }
        if (x > boxX2) {
          boxX2 = x;
        }
        if (y < boxY1) {
          boxY1 = y;
        }
        if (y > boxY2) {
          boxY2 = y;
        }
      }
    });
  });

  return {
    x1: boxX1,
    x2: boxX2,
    y1: boxY1,
    y2: boxY2,
  };
}

export const svgColors: object = {
  floors: {
    stroke: '#fff',
    fill: '#FFF',
    opacity: 0,
    zIndex: 0,
  },
  windows: {
    stroke: '#252C3A',
    fill: '#fff',
    opacity: 1,
    zIndex: 8,
  },
  walls: {
    stroke: '#252C3A',
    fill: '#252C3A',
    opacity: 1.0,
    zIndex: 0,
  },
  doors: {
    stroke: '#252C3A',
    fill: '#fff',
    opacity: 1,
    zIndex: 3,
  },
  desks: {
    stroke: '#252C3A',
    fill: 'rgba(0,0,0,0.01)', // Need to fill so mouse over works.
    opacity: 1,
    zIndex: 2,
  },
  seats: {
    stroke: '#252C3A',
    fill: 'rgba(0,0,0,0.01)', // Need to fill so mouse over works.
    opacity: 1,
    zIndex: 1,
  },
  separators: {
    stroke: '#252C3A',
    fill: '#252C3A',
    opacity: 1,
    zIndex: 0,
  },
  openings: {
    stroke: '#252C3A',
    fill: 'none',
    opacity: 1,
    zIndex: 5,
  },
  lines: {
    stroke: '#252C3A',
    strokeWidth: 1,
    fill: '#252C3A',
    opacity: 1,
    zIndex: 6,
  },
};

export const svgColorsMini: object = {
  ...svgColors,
  desks: {
    stroke: '#252C3A',
    fill: 'rgba(200,250,0,1)',
    opacity: 1,
    zIndex: 2,
  },
  seats: {
    stroke: '#252C3A',
    fill: 'rgba(0,250,200,1)',
    opacity: 1,
    zIndex: 1,
  },
};
