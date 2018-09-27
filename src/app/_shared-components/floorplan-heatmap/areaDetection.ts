///<reference path="../../../../node_modules/@types/node/index.d.ts"/>
import { EXCLUDED_NUMBER } from './simData';
const hull = require('hull.js');
const clustering = require('density-clustering');

let areasFound;
let evaluatedHexagons;
let evaluatedGroupHexagons;

let evaluatedHeatmap;
let hexagonResolution;

let coordinatedOrderedByValue;

const sin30 = 0.5; // 0.5 = sin 30 deg
const cos30 = 0.866; // 0.866 = cos 30 deg

/**
 * Finds areas of same value
 * @param heatmap
 */
export function findAreas(heatmap, hexagonSize, min, max) {
  areasFound = [];
  evaluatedHexagons = [];
  evaluatedGroupHexagons = [];

  evaluatedHeatmap = heatmap;
  hexagonResolution = hexagonSize;

  coordinatedOrderedByValue = [];

  /** Initialize hexagons */
  for (let y = 0; y < heatmap.length; y += 1) {
    evaluatedHexagons[y] = [];
    evaluatedGroupHexagons[y] = [];
    for (let x = 0; x < heatmap[y].length; x += 1) {
      // Excluded numbers are not evaluated
      const isExcluded = heatmap[y][x] === EXCLUDED_NUMBER;
      evaluatedHexagons[y][x] = isExcluded ? 1 : 0; // group 1 excluded, group 0 = no group
      evaluatedGroupHexagons[y][x] = isExcluded; // true / false
      if (!isExcluded) {
        coordinatedOrderedByValue.push([x, y, heatmap[y][x]]);
      }
    }
  }

  // We order the coordinates
  coordinatedOrderedByValue.sort((a, b) => b[2] - a[2]);

  // Find groups
  let groupNumber = 2;
  for (let i = 0; i < coordinatedOrderedByValue.length; i += 1) {
    const x = coordinatedOrderedByValue[i][0];
    const y = coordinatedOrderedByValue[i][1];

    if (evaluatedHexagons[y][x] === 0) {
      const group = findGroup(x, y, groupNumber, max, min);

      // We only add big groupsBruselas, Bélgica
      if (group !== null) {
        areasFound.push(group);
      }

      groupNumber += 1;
    }
  }

  // We order the areas by size
  areasFound.sort((a, b) => b.data.length - a.data.length);

  // We take only the 5 bigger areas
  const areasMax = 10;
  const areasTotal = areasFound.length;
  const finalAreas = areasFound.slice(0, areasTotal >= areasMax ? areasMax : areasTotal);

  // Library documentation:
  // http://andriiheonia.github.io/hull/
  return finalAreas.map(area => {
    return {
      min: area.min,
      max: area.max,
      coords: area.coords,
      data: hull(area.data, hexagonResolution / 2),
    };
  });
}

function findGroup(x, y, groupNumber, max, min) {
  const range = max - min;

  const groupValue = evaluatedHeatmap[y][x];
  const addedHexagons = expandGroup(groupNumber, groupValue, x, y, range);

  if (addedHexagons > 20 && (groupValue > max / 5 || (min < 0 && groupValue < min / 5))) {
    const group = {
      min: Number.MAX_SAFE_INTEGER,
      max: Number.MIN_SAFE_INTEGER,
      coords: [],
      data: [],
    };
    groupToCoords(x, y, group, groupNumber);

    return group;
  }
  return null;
}

/**
 * Check if the coordinate is an edge
 * A) Is outside the heatmap
 * B) Belongs to another group
 * @param x
 * @param y
 * @param groupNumber
 * @returns {boolean}
 */
function checkNeightbour(x, y, groupNumber) {
  if (x < 0 || y < 0 || x >= evaluatedHeatmap[0].length || y >= evaluatedHeatmap.length) {
    return true;
  }

  return evaluatedHexagons[y][x] !== groupNumber;
}

/**
 * Check if the neightbours coordinates are an edges
 * Clockwise order:
 * ___6_1__
 * _5____2_
 * __4_3___
 * @param x
 * @param y
 * @param groupNumber
 * @returns {boolean[]}
 */
function checkNeightbours(x, y, groupNumber) {
  const odd = y % 2;

  return [
    checkNeightbour(x + odd, y - 1, groupNumber),
    checkNeightbour(x + 1, y, groupNumber),
    checkNeightbour(x + odd, y + 1, groupNumber),
    checkNeightbour(x + odd - 1, y + 1, groupNumber),
    checkNeightbour(x - 1, y, groupNumber),
    checkNeightbour(x + odd - 1, y - 1, groupNumber),
  ];
}

function groupToCoords(x, y, group, groupNumber) {
  if (!evaluatedGroupHexagons[y][x] && evaluatedHexagons[y][x] === groupNumber) {
    evaluatedGroupHexagons[y][x] = true;

    group.coords.push([x, y]);
    const currentVal = evaluatedHeatmap[y][x];
    if (currentVal < group.min) {
      group.min = currentVal;
    } else if (currentVal > group.max) {
      group.max = currentVal;
    }

    // dot is evaluated
    // if (isEdge1 || isEdge2 || isEdge3 || isEdge4 || isEdge5 || isEdge6 || group.length <= 0) {
    // If on an odd row, offset it so that the hexagons tessallate
    const offset = y % 2 ? hexagonResolution / 2 : 0;

    const radious = hexagonResolution / 2;

    const deltaY = radious * sin30;
    const deltaX = radious * cos30;

    const deltaTY = radious;

    const [isEdge1, isEdge2, isEdge3, isEdge4, isEdge5, isEdge6] = checkNeightbours(
      x,
      y,
      groupNumber
    );

    if (isEdge5 || isEdge6) {
      // 10h
      group.data.push([
        x * hexagonResolution + offset - deltaX,
        -y * hexagonResolution * cos30 + deltaY,
      ]);
    }
    if (isEdge4 || isEdge5) {
      //  8h
      group.data.push([
        x * hexagonResolution + offset - deltaX,
        -y * hexagonResolution * cos30 - deltaY,
      ]);
    }
    if (isEdge3 || isEdge4) {
      //  6h
      group.data.push([x * hexagonResolution + offset, -y * hexagonResolution * cos30 - deltaTY]);
    }
    if (isEdge2 || isEdge3) {
      //  4h
      group.data.push([
        x * hexagonResolution + offset + deltaX,
        -y * hexagonResolution * cos30 - deltaY,
      ]);
    }
    if (isEdge1 || isEdge2) {
      //  2h
      group.data.push([
        x * hexagonResolution + offset + deltaX,
        -y * hexagonResolution * cos30 + deltaY,
      ]);
    }
    if (isEdge6 || isEdge1) {
      // 12h
      group.data.push([x * hexagonResolution + offset, -y * hexagonResolution * cos30 + deltaTY]);
    }

    const odd = y % 2;

    if (!isEdge1) {
      groupToCoords(x + odd, y - 1, group, groupNumber);
    }
    if (!isEdge2) {
      groupToCoords(x + 1, y, group, groupNumber);
    }
    if (!isEdge3) {
      groupToCoords(x + odd, y + 1, group, groupNumber);
    }
    if (!isEdge4) {
      groupToCoords(x + odd - 1, y + 1, group, groupNumber);
    }
    if (!isEdge5) {
      groupToCoords(x - 1, y, group, groupNumber);
    }
    if (!isEdge6) {
      groupToCoords(x + odd - 1, y - 1, group, groupNumber);
    }
  }
}

function getDelta(x, y, val) {
  if (x < 0 || y < 0 || x >= evaluatedHeatmap[0].length || y >= evaluatedHeatmap.length) {
    return 99;
  }

  return Math.abs(evaluatedHeatmap[y][x] - val);
}

function getSumDeltas(x, y, val) {
  const odd = y % 2;

  return (
    getDelta(x + odd, y - 1, val) +
    getDelta(x + 1, y, val) +
    getDelta(x + odd, y + 1, val) +
    getDelta(x + odd - 1, y + 1, val) +
    getDelta(x - 1, y, val) +
    getDelta(x + odd - 1, y - 1, val)
  );
}

function expandGroup(groupNumber, previousVal, x, y, range) {
  /** Coordinates outside the matrix */
  if (x < 0 || y < 0 || x >= evaluatedHeatmap[0].length || y >= evaluatedHeatmap.length) {
    return 0;
  }

  const val = evaluatedHeatmap[y][x];
  /*
  const delta = getSumDeltas(x, y, val);

  // const isEdge = Math.abs(previousVal - val) < range;
  const isEdge = delta > range / 6; // Math.abs(previousVal - val) < range
  const inTheRange = !isEdge;

  // console.log('Math.abs(previousVal - val) < range ', Math.abs(previousVal - val), range);

  // console.log('groupNumber', inTheRange, groupNumber, delta, range, evaluatedHexagons[y][x]);
*/
  let inTheRange = previousVal === null || Math.abs(previousVal - val) < range / 2;

  if (previousVal > 0 && val < range / 5) {
    inTheRange = false;
  }
  if (previousVal < 0 && val > -range / 5) {
    inTheRange = false;
  }

  if (evaluatedHexagons[y][x] === 0 && inTheRange) {
    evaluatedHexagons[y][x] = groupNumber;

    // Because the hexagon form, pair rows have a +1 in the X coordinate
    const odd = y % 2;

    let numHexAdded = 1;

    // previous row
    numHexAdded += expandGroup(groupNumber, previousVal, x - odd, y - 1, range);
    numHexAdded += expandGroup(groupNumber, previousVal, x - odd + 1, y - 1, range);

    numHexAdded += expandGroup(groupNumber, previousVal, x - 1, y, range);
    numHexAdded += expandGroup(groupNumber, previousVal, x + 1, y, range);

    // next row
    numHexAdded += expandGroup(groupNumber, previousVal, x - odd, y + 1, range);
    numHexAdded += expandGroup(groupNumber, previousVal, x - odd + 1, y + 1, range);

    return numHexAdded;
  }

  return 0;
}
