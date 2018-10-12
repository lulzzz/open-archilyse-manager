import {
  Mesh,
  Shape,
  Line,
  MeshPhongMaterial,
  LineBasicMaterial,
  ExtrudeGeometry,
  Geometry,
  Vector3,
} from 'three-full/builds/Three.es.js';
import { COOR_X, COOR_Y, COOR_Z } from './SimData';

export function drawMark(container, coordinates, lineColor, deltaZ) {
  const lineOpacity = 0.6;

  const material = new LineBasicMaterial({
    color: 0x000000,
    linewidth: 0.1,
    transparent: lineOpacity < 1,
    opacity: lineOpacity,
  });

  const materialEnd = new LineBasicMaterial({
    color: lineColor,
    linewidth: 15,
  });

  const geometry = new Geometry();
  const geometryEnd = new Geometry();

  geometry.vertices.push(
    new Vector3(coordinates[COOR_X], coordinates[COOR_Y], coordinates[COOR_Z])
  );

  const end1 = new Vector3(coordinates[COOR_X], coordinates[COOR_Y], coordinates[COOR_Z] + deltaZ);
  const end2 = new Vector3(
    coordinates[COOR_X],
    coordinates[COOR_Y],
    coordinates[COOR_Z] + deltaZ + 1
  );

  geometry.vertices.push(end1);
  geometryEnd.vertices.push(end1);
  geometryEnd.vertices.push(end2);

  const segment = new Line(geometry, material);
  const segmentEnd = new Line(geometryEnd, materialEnd);
  container.add(segment);
  container.add(segmentEnd);
}

export function drawGeometries(container, data, lineColor, lineWidth, zIndex) {
  const material = new LineBasicMaterial({
    color: lineColor,
    linewidth: lineWidth,
  });

  data.map(d => {
    const geometry = new Geometry();

    d.forEach(coordinates => {
      geometry.vertices.push(new Vector3(coordinates[COOR_X], coordinates[COOR_Y], 0.1));
    });

    const segment = new Line(geometry, material);
    container.add(segment);
  });
  container.position.set(0, 0, zIndex);
}

export function drawPolygons(
  container,
  objectClass,
  polygonSegments,
  materialColor,
  zIndex,
  forceMaterial,
  polygonOpacity,
  onCreate
) {
  const extrudeSettings = {
    amount: 0,
    bevelEnabled: false,
  };

  polygonSegments.map((d, i) => {
    const shape = new Shape();
    shape.moveTo(...d[0]);

    for (let j = 1; j < d.length; j += 1) {
      shape.lineTo(...d[j]);
    }

    let colorFinal = materialColor;
    if (Array.isArray(materialColor)) {
      colorFinal = materialColor[i % materialColor.length];
    }

    let material;
    if (forceMaterial) {
      material = forceMaterial;
    } else {
      material = new MeshPhongMaterial({
        color: colorFinal,
        emissive: colorFinal,
        transparent: polygonOpacity < 1,
        opacity: polygonOpacity,
      });
    }

    const segmentGeometry = new ExtrudeGeometry(shape, extrudeSettings);
    const segmentMesh = new Mesh(segmentGeometry, material);
    container.add(segmentMesh);

    container.position.set(0, 0, zIndex);

    onCreate(segmentMesh, objectClass, i, shape);
  });
}
