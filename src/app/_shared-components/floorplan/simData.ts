import { EditorConstants } from './EditorConstants';

/**
 * Coordinates constants to index point arrays
 * */
export const COOR_X = 0;
export const COOR_Y = 1;
export const COOR_Z = 2;

function boundingBoxRecursive(polygonVertices, structure) {
  if (
    structure.type === EditorConstants.BATHROOM ||
    structure.type === EditorConstants.KITCHEN_DINING ||
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
