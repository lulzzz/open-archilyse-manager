import * as d3 from 'd3';

/**
 * Given the array calculated the average
 * @param array
 * @returns {number} average
 */
export function getAverage(array) {
  const initialValue = 0;
  const sum = array.reduce((accumulator, currentValue) => accumulator + currentValue, initialValue);
  return sum / array.length;
}

/**
 * Given the array calculates the standard deviation
 * If average is not given calculates it out of the array
 * @param array - with the values to calculate
 * @param {any} avg - optional
 * @returns {number} standard deviation
 */
export function getStdDev(array, avg = null) {
  let average;
  if (avg === null) {
    average = getAverage(array);
  } else {
    average = avg;
  }
  /** Calculate standard deviation */
  const initialValue = 0;
  const diffsSum = array.reduce(
    (accumulator, value) => accumulator + (value - average) * (value - average),
    initialValue
  );
  const avgDiff = diffsSum / array.length;
  return Math.sqrt(avgDiff);
}

/**
 * Types with default scales for the parallel graph
 * @param innerHeight
 * @returns {any}
 */
export function getTypes(innerHeight) {
  const margin = innerHeight / 40;

  return {
    Number: {
      key: 'Number',
      extent: d3.extent,
      within(d, extent, dim) {
        return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
      },
      defaultScale: d3.scaleLinear().range([innerHeight - margin, margin]),
    },
    String: {
      key: 'String',
      coerce: String,
      extent(data) {
        return data; // .sort() We display the data as it comes, no order
      },
      within(d, extent, dim) {
        return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
      },
      defaultScale: d3.scalePoint().range([margin, innerHeight - margin]),
    },
    Date: {
      key: 'Date',
      coerce(d) {
        return new Date(d);
      },
      extent: d3.extent,
      within(d, extent, dim) {
        return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
      },
      defaultScale: d3.scaleTime().range([innerHeight - margin, margin]),
    },
  };
}

/**
 * Displays the legend in a given coordinate
 * @param left
 * @param top
 * @param text
 * @private
 */
export function showLegend(left, top, text) {
  const legend = document.getElementById('parallelLegend');
  legend.innerHTML = text;
  legend.style.visibility = 'visible';
  legend.style.left = left + 'px';
  legend.style.top = top + 'px';
}

/**
 * Hides the legend
 * @private
 */
export function hideLegend() {
  const legend = document.getElementById('parallelLegend');
  legend.style.visibility = 'hidden';
}
