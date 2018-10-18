import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Easing, Tween, autoPlay } from 'es6-tween';
import {
  OrbitControls,
  OrthographicCamera,
  WebGLRenderer,
  MOUSE,
  Scene,
  Group,
  Box3,
  Raycaster,
  Vector2,
  MeshPhongMaterial,
} from 'three-full/builds/Three.es.js';

/** Base Layer */
const LAYER_1 = 0.4;
/** 2nd Layer */
const LAYER_2 = 0.8;
/** 3rd Layer */
const LAYER_3 = 1.2;
/** 4th Layer */
const LAYER_4 = 1.6;

/** Z-Index for the controls */
const LAYER_CONTROLS = 1;

/** Color when clicked */
const colorClick = 0x99ff;

/** Color when mouse over */
const colorOver = 0xff99;

import { Subscription } from 'rxjs/Subscription';
import { hideLegend } from '../../_shared-libraries/Legend';
import {
  drawGeometries,
  drawPolygons,
} from '../../_shared-libraries/Geometries';

import { DiagramService, ElementEvent, EditorService } from '../../_services';
import { EditorConstants } from '../../_shared-libraries/EditorConstants';
import {
  boundingBox,
  COOR_X,
  COOR_Y,
  COOR_Z,
} from '../../_shared-libraries/SimData';
import { EditorControls } from '../../_shared-libraries/EditorControls';

/**
 * Container for the editor and the sidebar
 * Provides data for both elements
 */
@Component({
  selector: 'floorplan-editor',
  templateUrl: './floorplan-editor.component.html',
  styleUrls: ['./floorplan-editor.component.scss'],
})
export class FloorplanEditorComponent implements OnInit, OnDestroy {
  @Input() modelStructure;

  container;

  top; /** Here we store the top & left of the container */
  left;
  width; /** Here we store the width & height of the container */
  height;

  // Container box of the SVG's
  geometryBox;

  /** Sidebar controls */

  isSidebarVisible = true;
  isSidebarPropertiesVisible = false;
  sidebarProperties = null;
  sidebarPropertiesData = null;

  /** Camera controls */
  camera;
  controls;
  renderer;
  scene;

  cameraInfo;

  tween;

  /** Calculations mouse to 3d: */
  raycaster;
  mouse;
  uuidToObject = {};
  objectsToIntersect;
  objectsToIntersectElement;

  /** Highlight Click */
  previousMeshMaterial = null;
  previousMesh = null;

  /** HighlightOver */
  previousMeshOverMaterial = null;
  previousMeshOver = null;

  buildingStructure;

  seatPolygons;
  deskPolygons;
  areaPolygons;

  controlsGroup;

  seatCenters;

  // On window Resize, (We need to store it to unsubscribe later)
  windowListener;
  mousemoveListener;
  mouseoutListener;
  mousedownListener;
  mouseupListener;

  uniqueId;

  subscriptionEditor: Subscription;
  subscriptionSidebar: Subscription;
  newElementDropped: Subscription;

  constructor(
    private editorService: EditorService,
    private diagramService: DiagramService
  ) {}

  ngOnInit() {
    this.uniqueId = this.editorService.getUniqueId();
    this.subscriptionEditor = this.editorService.eventData$.subscribe(
      eventData => {
        if (this.uniqueId !== eventData.uniqueId) {
          console.log('EDITOR - eventData', this.uniqueId, eventData);
        }
      }
    );

    this.subscriptionSidebar = this.diagramService.isElementSidebarDisplayed$.subscribe(
      isVisible => {
        this.isSidebarVisible = isVisible;
        if (isVisible) {
          this.closeSidebarProperties();
        }
      }
    );

    this.newElementDropped = this.diagramService.elementDropped$.subscribe(
      data => {
        const eventData = <ElementEvent>data;
        if (
          !(
            eventData.x < this.left ||
            eventData.y < this.top ||
            eventData.x > this.left + this.width ||
            eventData.y > this.top + this.height
          )
        ) {
          this.updateMouseGeneral(eventData.x, eventData.y);

          const raycaster = new Raycaster();
          raycaster.setFromCamera(this.mouse, this.camera);
          // calculate objects intersecting the picking ray
          const result = this.identifyMaterialElementDrop(
            raycaster.intersectObjects(this.objectsToIntersectElement)
          );
          if (result !== null) {
            const coorX = result.x;
            const coorY = result.y;

            if (eventData.type === 'Chair') {
              const sizeX = 0.5 / 2;
              const sizeY = 0.4 / 2;

              const seatPolygons = [
                [
                  [coorX - sizeX, coorY - sizeY],
                  [coorX + sizeX, coorY - sizeY],
                  [coorX + sizeX, coorY + sizeY],
                  [coorX - sizeX, coorY + sizeY],
                  [coorX - sizeX, coorY - sizeY],
                ],
              ];

              this.drawSeatGroup(this.seatPolygons, {}, seatPolygons);
            } else {
              const sizeX = 0.75 / 2;
              const sizeY = 1.2 / 2;

              const deskPolygons = [
                [
                  [coorX - sizeX, coorY - sizeY],
                  [coorX + sizeX, coorY - sizeY],
                  [coorX + sizeX, coorY + sizeY],
                  [coorX - sizeX, coorY + sizeY],
                  [coorX - sizeX, coorY - sizeY],
                ],
              ];

              this.drawDeskGroup(this.deskPolygons, {}, deskPolygons);
            }

            this.calculateObjectsToIntersect();
            this.render();
          }
        }
      }
    );

    this.init3d(false);
  }

  init3d(isReset) {
    // camera

    if (!isReset) {
      this.container = document.getElementById('floorplanGraph');

      this.mousemoveListener = this.onMouseMove.bind(this);
      this.mouseoutListener = this.onMouseOut.bind(this);
      this.mousedownListener = this.onMouseClick.bind(this);
      this.mouseupListener = this.onMouseUp.bind(this);

      this.container.addEventListener(
        'mousemove',
        this.mousemoveListener,
        false
      );
      this.container.addEventListener('mouseout', this.mouseoutListener, false);
      this.container.addEventListener(
        'mousedown',
        this.mousedownListener,
        false
      );
      this.container.addEventListener('mouseup', this.mouseupListener, false);

      this.windowListener = this.onWindowResize.bind(this);
      window.addEventListener('resize', this.windowListener, false);

      this.raycaster = new Raycaster();
      this.mouse = new Vector2();

      this.geometryBox = boundingBox(this.modelStructure);

      // Controls group
      this.controlsGroup = new Group();

      this.setUpCamera();
      // webGL renderer
      this.renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true, // required to support .toDataURL()
      });

      EditorControls.init(
        this.controlsGroup,
        this.render.bind(this),
        this.updateObjectProperties.bind(this),
        this.camera,
        this.container,
        EditorControls.FLOORPLAN,
        this.enableCameraControls.bind(this),
        this.disableCameraControls.bind(this)
      );

      this.renderer.setSize(this.width, this.height); //
      this.container.appendChild(this.renderer.domElement);

      // scene
      this.scene = new Scene();

      this.controlsGroup.position.z = 1;
      this.scene.add(this.controlsGroup);
    }
    /**
     * Original data for simple display
     */

    if (isReset) {
      for (let i = this.buildingStructure.children.length - 1; i >= 0; i -= 1) {
        this.buildingStructure.remove(this.buildingStructure.children[i]);
      }
    } else {
      this.buildingStructure = new Group();
    }

    const polygonGroups = this.addFloorplanByStructure(this.buildingStructure);

    this.areaPolygons = polygonGroups.area;
    this.seatPolygons = polygonGroups.seat;
    this.seatCenters = polygonGroups.seatCenters;
    this.deskPolygons = polygonGroups.desk;

    this.calculateObjectsToIntersect();
  }

  updateObjectProperties(
    object,
    type,
    newPositionX,
    newPositionY,
    newScale,
    newAngle
  ) {
    /** center of the element
    const buildingBounds = new Box3().setFromObject(object);
    const xxx = buildingBounds.min.x + (buildingBounds.max.x - buildingBounds.min.x) / 2;
    const yyy = buildingBounds.min.y + (buildingBounds.max.y - buildingBounds.min.y) / 2;
    */

    if (type === EditorConstants.SIZE) {
      // TODO:  is not yet centered
      object.scale.x = newScale;
      object.scale.y = newScale;

      this.editorService.eventFired(this.uniqueId, {
        type: 'SIZE',
        id: this.sidebarPropertiesData.data.object.id,
        scale: newScale,
      });
    } else if (type === EditorConstants.MOVE) {
      object.position.x = newPositionX;
      object.position.y = newPositionY;

      this.editorService.eventFired(this.uniqueId, {
        type: 'MOVE',
        id: this.sidebarPropertiesData.data.object.id,
        posx: newPositionX,
        posy: newPositionY,
      });
    } else if (type === EditorConstants.ROTATE) {
      // TODO:  is not yet centered
      object.children[0].rotation.z = newAngle;
      object.children[1].rotation.z = newAngle;

      this.editorService.eventFired(this.uniqueId, {
        type: 'ROTATE',
        id: this.sidebarPropertiesData.data.object.id,
        angle: newAngle,
      });
    }

    this.render();
  }

  setUpCamera() {
    const props = this.containerProps();
    this.camera = new OrthographicCamera(
      props.left,
      props.right,
      props.top,
      props.bottom,
      1,
      1000
    );

    // TOP
    this.camera.position.set(0, 0, 90);
    this.camera.rotation.order = 'ZYX';

    this.cameraInfo = {
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
    };

    this.updateCameraRotation();

    // controls
    // controls = new THREE.OrbitControls( camera, renderer.domElement );
    this.controls = new OrbitControls(this.camera);
    this.controls.addEventListener('change', () => {
      // The legend makes no sense when
      hideLegend();
      this.updateCameraRotation();
      this.camera.updateProjectionMatrix();
      this.render();
    });

    // this.enableCameraControls();
  }

  enableCameraControls() {
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = false;

    // Don't let to go below the ground
    // this.controls.maxPolarAngle = 10; //Math.PI / 2; // 90°

    this.controls.mouseButtons = {
      PAN: MOUSE.RIGHT, // Mouse right to move the camera
      ZOOM: MOUSE.MIDDLE, // Wheel to zoom
      // ORBIT: MOUSE.LEFT, (No rotate)
    };
  }

  disableCameraControls() {
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = false;
    this.controls.mouseButtons = {};
  }

  /**
   * Update the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
    // Display render debug data: console.log(this.renderer.info);
  }

  updateCameraRotation() {
    const cameraRotation = this.camera.rotation;
    cameraRotation.x = this.cameraInfo.rotationX;
    cameraRotation.y = this.cameraInfo.rotationY;
    cameraRotation.z = this.cameraInfo.rotationZ;
  }

  calculateObjectsToIntersect() {
    let objects = [];
    objects = this.concatIfVisibleGroupOfGroups(objects, this.seatPolygons);
    objects = this.concatIfVisibleGroupOfGroups(objects, this.deskPolygons);
    objects = this.concatIfVisible(objects, this.buildingStructure);
    this.objectsToIntersect = this.concatIfVisible(objects, this.areaPolygons);
    this.objectsToIntersectElement = this.areaPolygons.children;
  }

  concatIfVisibleGroupOfGroups(objects, group) {
    if (group.visible) {
      const meshes = group.children.map(children => children.children[1]);
      return [...objects, ...meshes];
    }
    return objects;
  }
  concatIfVisible(objects, group) {
    if (group.visible) {
      return [...objects, ...group.children];
    }
    return objects;
  }

  drawWindows(buildingStructure, objectType, originalObject, windowSegments) {
    this.drawPolygonsAndRegister(
      buildingStructure,
      originalObject,
      objectType,
      windowSegments,
      0xffffff,
      LAYER_2,
      null
    );
  }

  drawOpenings(buildingStructure, opening_area) {
    const numPoints = 10;
    const points = [opening_area.axis];

    const distRef = this.distance(
      opening_area.open[COOR_X],
      opening_area.open[COOR_Y],
      opening_area.axis[COOR_X],
      opening_area.axis[COOR_Y]
    );

    for (let i = 0; i <= numPoints; i += 1) {
      const rectX =
        opening_area.close[COOR_X] * i / numPoints +
        opening_area.open[COOR_X] * (numPoints - i) / numPoints;
      const rectY =
        opening_area.close[COOR_Y] * i / numPoints +
        opening_area.open[COOR_Y] * (numPoints - i) / numPoints;

      const currentDist = this.distance(
        opening_area.axis[COOR_X],
        opening_area.axis[COOR_Y],
        rectX,
        rectY
      );

      const correction = 1 - currentDist / distRef;

      const newPoint = [
        rectX + (rectX - opening_area.axis[COOR_X]) * correction,
        rectY + (rectY - opening_area.axis[COOR_Y]) * correction,
      ];

      points.push(newPoint);
    }

    points.push(opening_area.axis);

    drawGeometries(buildingStructure, [points], 0x333333, 1.5, LAYER_1);
  }

  distance(coor1X, coor1Y, coor2X, coor2Y) {
    return Math.sqrt(
      Math.pow(coor2X - coor1X, 2) + Math.pow(coor2Y - coor1Y, 2)
    );
  }

  drawDoors(buildingStructure, data) {
    console.log('drawDoors', data);
    drawGeometries(buildingStructure, data, 0x333333, 1.5, LAYER_1);
  }

  drawLines(buildingStructure, data) {
    drawGeometries(buildingStructure, data, 0x0, 1, LAYER_3);
  }

  drawDeskGroup(deskPolygons, originalObject, desks) {
    desks.forEach(desk => {
      const deskGroup = new Group();
      this.drawDesks(deskGroup, [desk]);
      this.drawDesksPolygon(deskGroup, originalObject, [desk]);
      deskPolygons.add(deskGroup);
    });
  }
  drawDesks(seatPolygons, data) {
    drawGeometries(seatPolygons, data, 0x0, 1, LAYER_3);
  }
  drawDesksPolygon(seatPolygons, originalObject, data) {
    this.drawPolygonsAndRegister(
      seatPolygons,
      originalObject,
      EditorConstants.DESK,
      data,
      0xffffff,
      LAYER_1,
      null,
      0.4
    );
  }

  correctCoordinatesByAngle(px, py, x, y, cos, sin) {
    const xFinal = px + x * cos - y * sin;
    const yFinal = py + x * sin + y * cos;
    return [xFinal, yFinal];
  }

  drawGenericElement(objectPolygons, originalObject) {
    const pX = originalObject.pos[COOR_X];
    const pY = originalObject.pos[COOR_Y];

    const dX = originalObject.dim[COOR_X];
    const dY = originalObject.dim[COOR_Y];
    const dZ = originalObject.dim[COOR_Z];

    const dX2 = dX / 2;
    const dY2 = dY / 2;
    const dZ2 = dZ / 2;

    const angle = (originalObject.direction + 90) * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const point00 = this.correctCoordinatesByAngle(
      pX,
      pY,
      -dX2,
      -dY2,
      cos,
      sin
    );
    const point01 = this.correctCoordinatesByAngle(
      pX,
      pY,
      +dX2,
      -dY2,
      cos,
      sin
    );
    const point11 = this.correctCoordinatesByAngle(
      pX,
      pY,
      -dX2,
      +dY2,
      cos,
      sin
    );
    const point10 = this.correctCoordinatesByAngle(
      pX,
      pY,
      +dX2,
      +dY2,
      cos,
      sin
    );

    if (originalObject.footprint) {
      console.error('Generic element with footprint');
    }

    const object = [point00, point01, point10, point11, point00];
    const objectGroup = new Group();
    this.drawGenerics(objectGroup, [object]);
    this.drawGenericsPolygon(objectGroup, originalObject, [object]);
    objectPolygons.add(objectGroup);
  }

  drawGenericGroup(objectPolygons, originalObject, objects) {
    objects.forEach(object => {
      const objectGroup = new Group();
      this.drawGenerics(objectGroup, [object]);
      this.drawGenericsPolygon(objectGroup, originalObject, [object]);
      objectPolygons.add(objectGroup);
    });
  }
  drawGenerics(objectPolygons, data) {
    drawGeometries(objectPolygons, data, 0x0, 1, LAYER_3);
  }
  drawGenericsPolygon(deskPolygons, originalObject, data) {
    let objectClass;
    if (originalObject.type === EditorConstants.TOILET) {
      objectClass = EditorConstants.TOILET;
    } else if (originalObject.type === EditorConstants.STAIRS) {
      objectClass = EditorConstants.STAIRS;
    } else if (originalObject.type === EditorConstants.SINK) {
      objectClass = EditorConstants.SINK;
    } else if (originalObject.type === EditorConstants.KITCHEN) {
      objectClass = EditorConstants.KITCHEN;
    } else if (originalObject.type === EditorConstants.OFFICE_MISC) {
      objectClass = EditorConstants.OFFICE_MISC;
    } else if (originalObject.type === EditorConstants.MISC) {
      objectClass = EditorConstants.MISC;
    } else if (originalObject.type === EditorConstants.DESK) {
      objectClass = EditorConstants.DESK;
    } else if (originalObject.type === EditorConstants.CHAIR) {
      objectClass = EditorConstants.CHAIR;
    } else {
      console.error('Unknown Object type', originalObject, originalObject.type);
    }

    this.drawPolygonsAndRegister(
      deskPolygons,
      originalObject,
      objectClass,
      data,
      0xffffff,
      LAYER_3,
      null,
      0.4
    );
  }

  drawSeatGroup(seatPolygons, originalObject, seats) {
    seats.forEach(seat => {
      const seatGroup = new Group();
      this.drawSeats(seatGroup, [seat]);
      this.drawSeatsPolygon(seatGroup, originalObject, [seat]);
      seatPolygons.add(seatGroup);
    });
  }
  drawSeats(deskPolygons, data) {
    drawGeometries(deskPolygons, data, 0x0, 1, LAYER_3);
  }
  drawSeatsPolygon(deskPolygons, originalObject, data) {
    this.drawPolygonsAndRegister(
      deskPolygons,
      originalObject,
      EditorConstants.CHAIR,
      data,
      0xffffff,
      LAYER_1,
      null,
      0.4
    );
  }
  drawAreas(areaPolygons, originalObject, fillAreaColors, data) {
    // Hidden by default

    // NO REGISTER:
    // drawPolygons(areaPolygons,AREA,data,fillAreaColors,LAYER_1,null,0.6,() => {});

    this.drawPolygonsAndRegister(
      areaPolygons,
      originalObject,
      EditorConstants.AREA,
      data,
      fillAreaColors,
      -LAYER_1,
      null,
      0.6
    );
  }

  drawWalls(buildingStructure, originalObject, wallSegments) {
    this.drawPolygonsAndRegister(
      buildingStructure,
      originalObject,
      EditorConstants.WALL,
      wallSegments,
      0x0,
      LAYER_1
    );
  }

  drawPolygonsAndRegister(
    container,
    originalObject,
    objectClass,
    polygonSegments,
    materialColor,
    zIndex,
    forceMaterial = null,
    polygonOpacity = 1,
    data = null
  ) {
    drawPolygons(
      container,
      objectClass,
      polygonSegments,
      materialColor,
      zIndex,
      forceMaterial,
      polygonOpacity,
      (segmentMesh, objectClass, i) => {
        let object;
        if (objectClass === EditorConstants.CHAIR) {
          object = {
            seatIndex: i,
            object: originalObject,
          };
        } else if (objectClass === EditorConstants.DESK) {
          const seatsGeometries = null;
          object = {
            deskData: polygonSegments[i],
            seats: seatsGeometries,
            object: originalObject,
          };
        } else if (
          objectClass === EditorConstants.TOILET ||
          objectClass === EditorConstants.KITCHEN ||
          objectClass === EditorConstants.OFFICE_MISC
        ) {
          object = {
            object: originalObject,
          };
        } else if (objectClass === EditorConstants.AREA_DIFF) {
          object = { areaData: data };
        } else if (objectClass === EditorConstants.AREA) {
          object = {
            areaIndex: i,
            areaData: polygonSegments[i],
            object: originalObject,
          };
        } else {
          object = {
            object: originalObject,
          };
        }
        this.registerObject(segmentMesh, objectClass, object);
      }
    );
  }

  cleanObjects() {
    this.uuidToObject = {};
  }

  registerObject(mesh, objectClass, object) {
    this.uuidToObject[mesh.uuid] = {
      group: objectClass,
      data: object,
    };
  }

  addFloorplanByStructure(buildingStructure) {
    console.log('addFloorplanByStructure');

    if (this.modelStructure) {
      const seatPolygons = new Group();
      const deskPolygons = new Group();
      const areaPolygons = new Group();

      areaPolygons.visible = true;

      const seatCntrs = [];
      // TODO: Fill seatCntrs

      this.modelStructure.floors.forEach(floor => {
        this.analyzeStructure(
          buildingStructure,
          seatPolygons,
          deskPolygons,
          areaPolygons,
          floor
        );
      });

      buildingStructure
        .add(areaPolygons)
        .add(seatPolygons)
        .add(deskPolygons);

      this.scene.add(buildingStructure);

      const buildingBounds = new Box3().setFromObject(this.scene);

      const deltaX = (buildingBounds.max.x + buildingBounds.min.x) / 2;
      const deltaY = (buildingBounds.max.y + buildingBounds.min.y) / 2;

      // Center the scene
      this.scene.translateY(-deltaY);
      this.scene.translateX(-deltaX);

      this.render();

      return {
        area: areaPolygons,
        seat: seatPolygons,
        seatCenters: seatCntrs,
        desk: deskPolygons,
      };
    }

    console.error('modelStructure not found', this.modelStructure);
  }

  analyzeStructure(
    buildingStructure,
    seatPolygons,
    deskPolygons,
    areaPolygons,
    structure
  ) {
    if (structure.type) {
      /** Features */

      if (structure.type === EditorConstants.TOILET) {
        this.drawGenericElement(seatPolygons, structure);
      } else if (structure.type === EditorConstants.SINK) {
        this.drawGenericElement(seatPolygons, structure);
      } else if (structure.type === EditorConstants.STAIRS) {
        this.drawGenericElement(seatPolygons, structure);
      } else if (structure.type === EditorConstants.KITCHEN) {
        this.drawGenericElement(seatPolygons, structure);
      } else if (structure.type === EditorConstants.DESK) {
        this.drawGenericElement(seatPolygons, structure);
      } else if (structure.type === EditorConstants.CHAIR) {
        this.drawGenericElement(seatPolygons, structure);
      } else if (structure.type === EditorConstants.OFFICE_MISC) {
        this.drawGenericElement(seatPolygons, structure);
      } else if (structure.type === EditorConstants.MISC) {
        this.drawGenericElement(seatPolygons, structure);
        /** Separators */
      } else if (
        structure.type === EditorConstants.SEPARATOR_NOT_DEFINED ||
        structure.type === EditorConstants.RAILING ||
        structure.type === EditorConstants.ENVELOPE
      ) {
        // ************ structure.footprint.coordinates
        this.drawWalls(
          buildingStructure,
          structure,
          structure.footprint.coordinates
        );

        /** AreaType */
      } else if (
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
        // ************ structure.footprint.coordinates

        this.drawAreas(
          areaPolygons,
          structure,
          [0xffffff, 0xeeeeee, 0xdddddd],
          structure.footprint.coordinates
        );

        /** SpaceType */
      } else if (structure.type === EditorConstants.SPACE_NOT_DEFINED) {
        if (structure.footprint && structure.footprint.coordinates) {
          // ************ structure.footprint.coordinates
        }

        /** OpeningType */
      } else if (structure.type === EditorConstants.DOOR) {
        if (structure.footprint && structure.footprint.coordinates) {
          // ************ structure.footprint.coordinates
          this.drawDoors(buildingStructure, structure.footprint.coordinates);
        }
        if (structure.opening_area) {
          // ************ structure.opening_area.coordinates
          structure.opening_area.forEach(opening => {
            this.drawOpenings(buildingStructure, opening);
          });
        }
      } else if (
        structure.type === EditorConstants.WINDOW_ENVELOPE ||
        structure.type === EditorConstants.WINDOW_INTERIOR
      ) {
        // ************ structure.footprint.coordinates,

        this.drawWindows(
          buildingStructure,
          structure.type,
          structure,
          structure.footprint.coordinates
        ); // Over the walls.
        this.drawLines(buildingStructure, structure.footprint.coordinates);

        /** Undefined */
      } else if (structure.type === 'to be filled') {
      } else {
        console.error('UNKNOWN analyzeStructure ', structure.type);
      }
    }

    if (structure.children) {
      structure.children.forEach(child => {
        this.analyzeStructure(
          buildingStructure,
          seatPolygons,
          deskPolygons,
          areaPolygons,
          child
        );
      });
    }
  }

  containerProps() {
    this.updateComponentCoordinates();

    const geometryWidth = this.geometryBox.x2 - this.geometryBox.x1;
    const geometryHeight = this.geometryBox.y2 - this.geometryBox.y1;

    const rationScreen = this.width / this.height;
    const rationModel = geometryWidth / geometryHeight;

    const aspectRatio = this.width / this.height;

    const dv = this.height / geometryHeight;
    const dh = this.width / geometryWidth;

    let maxDistance;
    let margin;
    if (rationScreen > rationModel) {
      margin = Math.floor((dv * 2 - geometryHeight) / 2);
      maxDistance = dv - margin;

      return {
        left: -maxDistance * aspectRatio,
        right: maxDistance * aspectRatio,
        top: maxDistance,
        bottom: -maxDistance,
      };
    }

    margin = Math.floor((dh * 2 - geometryWidth) / 2);
    maxDistance = dh - margin;

    return {
      left: -maxDistance,
      right: maxDistance,
      top: maxDistance / aspectRatio,
      bottom: -maxDistance / aspectRatio,
    };
  }

  onWindowResize() {
    // The legend makes not sense when the object is going to move.
    hideLegend();

    const props = this.containerProps();
    this.renderer.setSize(this.width, this.height);
    this.camera = Object.assign(this.camera, props);
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  onMouseUpdate(event) {
    this.updateMouse(event);
    const raycaster = new Raycaster();
    raycaster.setFromCamera(this.mouse, this.camera);
    return raycaster;
  }

  onMouseMove(event) {
    const raycaster = this.onMouseUpdate(event);

    // calculate objects intersecting the picking ray
    EditorControls.onMouseMove(event, raycaster);

    if (!EditorControls.isDragging()) {
      // calculate objects intersecting the picking ray
      this.identifyMaterial(
        event,
        raycaster.intersectObjects(this.objectsToIntersect),
        0x00ff00
      );
    }
  }

  onMouseClick(event) {
    const raycaster = this.onMouseUpdate(event);

    // calculate objects intersecting the picking ray
    EditorControls.onMouseDown(event, raycaster);

    if (!EditorControls.isDragging()) {
      // calculate objects intersecting the picking ray
      this.identifyMaterial(
        event,
        raycaster.intersectObjects(this.objectsToIntersect),
        0xff0000
      );
    }
  }

  onMouseUp(event) {
    const raycaster = this.onMouseUpdate(event);

    // calculate objects intersecting the picking ray
    EditorControls.onMouseUp(event, raycaster);
  }

  updateMouseGeneral(eventX, eventY) {
    this.updateComponentCoordinates();
    this.mouse.x = (eventX - this.left) / this.width * 2 - 1;
    this.mouse.y = -(eventY - this.top) / this.height * 2 + 1;
  }
  updateMouse(event) {
    event.preventDefault();
    this.updateMouseGeneral(event.clientX, event.clientY);
  }

  onMouseOut(event) {
    document.body.style.cursor = 'default';
    hideLegend();

    const raycaster = this.onMouseUpdate(event);

    // calculate objects intersecting the picking ray
    EditorControls.onMouseOut(event, raycaster);
  }

  updateComponentCoordinates() {
    const rect = this.container.getBoundingClientRect();
    const rectBody = document.body.getBoundingClientRect();

    this.top = rect.top - rectBody.top;
    this.left = rect.left - rectBody.left;

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
  }

  mouseOverMaterial(event, material, color, objectData) {
    let mouseOver = false;

    const clickForInfo = `<br><div class="clickForInfo">Click for detailed info.</div>`;

    if (objectData && !EditorControls.isDragging()) {
      // Mouse over highlight
      document.body.style.cursor = 'pointer';

      if (
        objectData.group === EditorConstants.AREA ||
        objectData.group === EditorConstants.AREA_DIFF ||
        objectData.group === EditorConstants.DESK ||
        objectData.group === EditorConstants.CHAIR ||
        objectData.group === EditorConstants.TOILET ||
        objectData.group === EditorConstants.KITCHEN ||
        objectData.group === EditorConstants.OFFICE_MISC
      ) {
        this.highlightMaterialOver(material);
        mouseOver = true;
      }
    }

    if (!mouseOver) {
      document.body.style.cursor = 'default';
      this.restoreMaterialOver(material);
    }
  }

  clickMaterial(event, material, color, objectData) {
    // console.log('clickMaterial', event, material, color, objectData);

    this.closeSidebar();

    if (objectData) {
      /**
      this.sidebarObjectData = objectData;
      this.sidebarMaterial = material;
      */

      if (objectData.group === EditorConstants.CHAIR) {
        this.diagramService.selectSeat(objectData.data.seatIndex);
      } else if (objectData.group === EditorConstants.DESK) {
        // ?? What to do
      } else if (objectData.group === EditorConstants.AREA) {
        // ?? What to do
      }

      // We don't show anything for not meaningful elements
      if (
        objectData.group === EditorConstants.DOOR ||
        objectData.group === EditorConstants.WALL ||
        objectData.group === EditorConstants.WINDOW_ENVELOPE
      ) {
        this.closeSidebarProperties();
        this.restoreMaterial();
      } else {
        this.openSidebarProperties(material, objectData);
        const selected = this.highlightMaterial(material);

        // We display the
        if (
          selected &&
          (objectData.group === EditorConstants.CHAIR ||
            objectData.group === EditorConstants.DESK ||
            objectData.group === EditorConstants.TOILET ||
            objectData.group === EditorConstants.KITCHEN ||
            objectData.group === EditorConstants.OFFICE_MISC)
        ) {
          EditorControls.addControlsForElement(material.parent, LAYER_CONTROLS);
        } else {
          EditorControls.cancelDragging();
          EditorControls.removeOldControls();
        }
      }
    } else {
      this.closeSidebarProperties();
      this.restoreMaterial();
    }
  }

  identifyMaterialElementDrop(intersects) {
    // We intersected at least 1 element
    if (intersects.length) {
      const filtered = intersects.filter(o => o.object.type === 'Mesh');
      // It's a mesh
      if (filtered.length) {
        const lestDistanceObject = filtered[0].object;
        const objectData = this.getObject(lestDistanceObject);
        return {
          uuid: objectData.uuid,
          x: filtered[0].uv.x,
          y: filtered[0].uv.y,
        };
      }
    }
    return null;
  }

  identifyMaterial(event, intersects, color) {
    // We intersected at least 1 element
    if (intersects.length) {
      const filtered = intersects.filter(o => o.object.type === 'Mesh');
      // It's a mesh
      if (filtered.length) {
        const lestDistanceObject = filtered[0].object;
        const objectData = this.getObject(lestDistanceObject);

        if (event.type === 'mousemove') {
          this.mouseOverMaterial(event, lestDistanceObject, color, objectData);
        } else if (event.type === 'click' || event.type === 'mousedown') {
          console.log('identifyMaterial', intersects, color);
          this.clickMaterial(event, lestDistanceObject, color, objectData);
        } else {
          console.error('Event event.type: ', event.type);
        }
        return;
      }
    }

    if (event.type === 'click' || event.type === 'mousedown') {
      this.closeSidebar();
      this.restoreMaterial();
    }

    hideLegend();
  }

  getObject(mesh) {
    return this.uuidToObject[mesh.uuid];
  }

  /**
   * Sidebar controls
   */

  openSidebar() {
    this.diagramService.displayElementSidebarDisplayed(true);
  }

  closeSidebar() {
    this.diagramService.displayElementSidebarDisplayed(false);
  }

  openSidebarProperties(material, objectData) {
    this.sidebarProperties = material;
    this.sidebarPropertiesData = objectData;
    this.isSidebarPropertiesVisible = true;
  }
  closeSidebarProperties() {
    this.isSidebarPropertiesVisible = false;
  }

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.subscriptionEditor) {
      this.subscriptionEditor.unsubscribe();
    }
    if (this.subscriptionSidebar) {
      this.subscriptionSidebar.unsubscribe();
    }
    if (this.newElementDropped) {
      this.newElementDropped.unsubscribe();
    }
  }

  /**
   * Mouse over
   */

  highlightMaterial(mesh) {
    this.restoreMaterial();

    if (this.previousMesh !== null && this.previousMesh.uuid === mesh.uuid) {
      this.closeSidebarProperties();
      this.render();
      return false;
    }

    const material = new MeshPhongMaterial({
      color: colorClick,
      emissive: colorClick,
      transparent: true,
      opacity: 0.5,
    });

    if (
      this.previousMeshOver !== null &&
      this.previousMeshOver.uuid === mesh.uuid
    ) {
      this.previousMeshMaterial = this.previousMeshOverMaterial;
    } else {
      this.previousMeshMaterial = mesh.material;
    }

    this.previousMesh = mesh;
    mesh.material = material;
    this.render();
    return true;
  }

  highlightMaterialOver(mesh) {
    if (!this.restoreMaterialOver(mesh)) {
      return false;
    }

    if (
      this.previousMeshOver !== null &&
      this.previousMeshOver.uuid === mesh.uuid
    ) {
      this.previousMeshOver = null;
    } else if (
      this.previousMesh !== null &&
      this.previousMesh.uuid === mesh.uuid
    ) {
      // Do nothing
    } else {
      const material = new MeshPhongMaterial({
        color: colorOver,
        emissive: colorOver,
        transparent: true,
        opacity: 0.5,
      });

      this.previousMeshOverMaterial = mesh.material;
      this.previousMeshOver = mesh;

      mesh.material = material;
    }
    this.render();
  }

  restoreMaterial() {
    if (this.previousMesh !== null) {
      this.previousMesh.material = this.previousMeshMaterial;
      this.previousMesh = null;
      EditorControls.cancelDragging();
      EditorControls.removeOldControls();
      this.render();
    }
  }

  restoreMaterialOver(newMesh) {
    if (this.previousMeshOver !== null) {
      // Skip when the second mouse over reached the same polygon
      if (newMesh !== null && this.previousMeshOver.uuid === newMesh.uuid) {
        return false;
      }

      // No restore when was clicked
      if (
        this.previousMesh !== null &&
        this.previousMesh.uuid === this.previousMeshOver.uuid
      ) {
        this.previousMeshOver = null;
        return false;
      }

      this.previousMeshOver.material = this.previousMeshOverMaterial;
      this.previousMeshOver = null;

      this.render();
    }
    return true;
  }
}
