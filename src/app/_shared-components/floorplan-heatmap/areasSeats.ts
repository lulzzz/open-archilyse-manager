import { getAverage, getStdDev } from '../parallel/parallel.shared';

const inside = require('point-in-polygon');

export function deskInfoToHuman(deskInfo, unit) {
  if (deskInfo) {
    if (deskInfo.values.length < 1) {
      return `<br/> No seats assigned to this desk `;
    }
    if (deskInfo.values.length > 1) {
      const numSeats = deskInfo.values.length;
      return `<br/><div class="valueRow">
                  <span class="valueTitle">  Seats in this desk: </span>
                  <span class="valueColumn">${numSeats}</span></div>
            <div class="valueRow">
                  <span class="valueTitle"> * Average </span>
                  <span class="valueColumn">${deskInfo.average.toFixed(2)} ${unit}</span></div>
            <div class="valueRow">
                  <span class="valueTitle"> * Standard deviation </span>
                  <span class="valueColumn">${deskInfo.deviation.toFixed(2)} ${unit}</span></div>`;
    }

    return `<br/><div class="valueRow">
                  <span class="valueTitle"> 1 seat in this desk, value: </span>
                  <span class="valueColumn">${deskInfo.average.toFixed(2)} ${unit}</span>
                  </div>`;
  }
  return '';
}
export function growDesk(deskPolygon) {
  const scale = 0.1;

  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;

  let minY = Number.MAX_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;

  deskPolygon.forEach(coords => {
    if (minX > coords[0]) {
      minX = coords[0];
    }
    if (maxX < coords[0]) {
      maxX = coords[0];
    }

    if (minY > coords[1]) {
      minY = coords[1];
    }
    if (maxY < coords[1]) {
      maxY = coords[1];
    }
  });

  const middleX = (maxX + minX) / 2;
  const middleY = (maxY + minY) / 2;

  return deskPolygon.map(coords => [
    coords[0] + (coords[0] - middleX) * scale,
    coords[1] + (coords[1] - middleY) * scale,
  ]);
}
export function calculateSeatDeskInfo(deskPolygon, seatPolygons, seatData) {
  const seatsInsideIndexes = [];
  const seatsInsidevalues = [];

  if (seatPolygons) {
    const deskPolygonMargin = growDesk(deskPolygon);

    for (let seatIndex = 0; seatIndex < seatPolygons.length; seatIndex += 1) {
      const coordinates = seatPolygons[seatIndex];
      let isSeatInside = false;
      for (let j = 0; j < coordinates.length && !isSeatInside; j += 1) {
        const coordinate = coordinates[j];
        isSeatInside = inside(coordinate, deskPolygonMargin);
        if (isSeatInside) {
          seatsInsideIndexes.push(seatIndex);
          seatsInsidevalues.push(seatData[seatIndex]);
        }
      }
    }
  }

  const avg = getAverage(seatsInsidevalues);
  const sigma = getStdDev(seatsInsidevalues, avg);

  return {
    indexes: seatsInsideIndexes,
    values: seatsInsidevalues,
    average: avg,
    deviation: sigma,
  };
}

/**
 * Given an array of coordinates for an area gives the seats that are in.
 * @param seatCenters Center coordinates from the seats.
 * @param currentArray
 * @param seatData Array of seat Data from a simulation
 * @returns {{indices: any[]; data: any[]; minimum: number; maximum: number; average: number}}
 */
export function calculateSeatInfo(seatCenters, currentArray, seatData = null) {
  // console.log('calculateSeatInfo - seatCenters: ', seatCenters);
  // console.log('calculateSeatInfo - currentArray: ', currentArray);
  // console.log('calculateSeatInfo - seatData: ', seatData);

  const currentArrayMargin = growDesk(currentArray);

  const seatsInside = seatCenters.map(seat => inside(seat, currentArrayMargin));
  const seatsInsideIndices = [];
  const seatsInsideData = [];

  let max = 0;
  let min = 0;
  let sum = 0;
  let avg = 0;

  if (seatsInside.length > 0) {
    // Without the data we don't calculate min, max
    if (seatData !== null) {
      max = Number.MIN_SAFE_INTEGER;
      min = Number.MAX_SAFE_INTEGER;
    }

    /**
     * We check if each seat is inside the area
     */
    for (let i = 0; i < seatsInside.length; i += 1) {
      if (seatsInside[i]) {
        seatsInsideIndices.push(i);

        // Without the data we don't calculate the current values
        if (seatData !== null) {
          const value = seatData[i];
          seatsInsideData.push(value);
          sum += value;
          if (value > max) {
            max = value;
          }
          if (value < min) {
            min = value;
          }
        }
      }
    }
  }
  if (seatsInsideIndices.length > 0) {
    avg = sum / seatsInsideIndices.length;
  }

  return {
    indices: seatsInsideIndices,
    data: seatsInsideData,
    minimum: min,
    maximum: max,
    average: avg,
  };
}
