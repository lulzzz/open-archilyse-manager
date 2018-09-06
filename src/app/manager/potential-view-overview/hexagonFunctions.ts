import * as d3 from 'd3';

import OlStyle from 'ol/style/Style';
import OlStyleFill from 'ol/style/Fill';
import OlStyleStroke from 'ol/style/Stroke';
import OlFeature from 'ol/Feature';
import OlPolygon from 'ol/geom/Polygon';

/**
 * Draws an hexagon in the given x_off, y_off coordinates plus:
 * x,y matrix coordinates considering hexagon radius and odd rows offset
 * @param x_off
 * @param y_off
 * @param x
 * @param y
 * @param resolution is the radious of the hexagon
 * @param valueToColor is the function used to get the color
 * @param val is the value assigned to this hexagon.
 */
export function drawHexBlocks(
    source,
    x_off: number,
    y_off: number,
    x: number,
    y: number,
    resolution: number,
    valueToColor,
    val
  ) {

  const sin30 = 0.5; // 0.5 = sin 30 deg
  const cos30 = 0.866; // 0.866 = cos 30 deg

  const radious = resolution / 2;

  const deltaY = radious * sin30;
  const deltaX = radious * cos30;

  // If on an odd row, offset it so that the hexagons tessallate
  const offset = y % 2 ? radious : 0;
  const finalX = x_off + x * resolution + offset;
  const finalY = y_off + y * resolution * cos30;

  const coords = [
    [finalX, finalY - radious], // 12h
    [finalX - deltaX, finalY - deltaY], // 10h
    [finalX - deltaX, finalY + deltaY], //  8h
    [finalX, finalY + radious], //  6h
    [finalX + deltaX, finalY + deltaY], //  4h
    [finalX + deltaX, finalY - deltaY], //  2h
    [finalX, finalY - radious], // 12h
  ];

  const colorValue = valueToColor(val);
  const feature = new OlFeature({ geometry: new OlPolygon([coords]) });
  feature.setStyle(
    new OlStyle({
      fill: new OlStyleFill({
        color: colorValue,
      }),
      stroke: new OlStyleStroke({
        color: colorValue,
        width: 2,
      }),
    })
  );
  source.addFeature(feature);
}

export function reduceHeatmap(heatmap, resolution, no_value_number) {
  let numberOfhexagons = 0;
  heatmap.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== no_value_number) {
        numberOfhexagons += 1;
      }
    });
  });

  let currentHeatmap = heatmap;
  let resolutionCorrected = resolution;

  const maxNumberPoligons = 1900;

  while (numberOfhexagons > maxNumberPoligons) {
    numberOfhexagons = 0;
    const heatmapCorrected = [];
    let newY = 0;
    for (let y = 1; y < currentHeatmap.length - 1; y += 3) {
      if (!heatmapCorrected[newY]) {
        heatmapCorrected[newY] = [];
      }
      let newX = 0;
      for (let x = 1; x < currentHeatmap[y].length - 1; x += 3) {
        heatmapCorrected[newY][newX] = currentHeatmap[y][x];
        if (currentHeatmap[y][x] !== no_value_number) {
          numberOfhexagons += 1;
        }
        newX += 1;
      }
      newY += 1;
    }
    currentHeatmap = heatmapCorrected;
    resolutionCorrected = resolutionCorrected * 3;
  }

  console.log('numberOfhexagons END', numberOfhexagons);
  console.log('resolutionCorrected', resolutionCorrected);

  return {
    heatmap: currentHeatmap,
    resolution: resolutionCorrected,
  };
}

/**
 * Given the color array maps from min to max to a color
 * Returns the transforming function
 * @param color
 * @param min
 * @param max
 * @returns function
 */
export function calculateDomain(color, min, max) {
  // Create a domain that divides the range of values
  const domain = color.map((c, i) => min + i / (color.length - 1) * (max - min));

  // Create a scale that allows us to convert our values to a colour
  return d3
    .scaleLinear()
    .domain(domain)
    .range(color);
}
