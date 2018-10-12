import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { svgBoundingBox } from '../../../_shared-libraries/SimData';

import {
  OrthographicCamera,
  WebGLRenderer,
  Scene,
  Group,
  Box3,
  Raycaster,
  Vector2,
} from 'three-full/builds/Three.es.js';
import { drawPolygons, drawGeometries } from '../../../_shared-libraries/Geometries';
import { EditorControls } from '../../../_shared-libraries/EditorControls';
import { EditorConstants } from '../../../_shared-libraries/EditorConstants';

const LAYER_CONTROLS = 0.1;

@Component({
  selector: 'app-geo-editor',
  templateUrl: './geo-editor.component.html',
  styleUrls: ['./geo-editor.component.scss'],
})
export class GeoEditorComponent implements OnInit, AfterContentInit, OnChanges, OnDestroy {
  @Input() previousCoords;
  @Input() allPossibleCoords;
  @Output() previews = new EventEmitter<any>();
  @Output() manualPreset = new EventEmitter<any>();

  @Input() buildingPerimeterScale;
  @Input() buildingPerimeter;
  @Input() modelStructure;

  @Input() referenceX;
  @Input() referenceY;

  @Input() coords;

  building = null;
  floorplan = null;
  floorplanWrapper = null;
  floorplanWrapperWrapper = null;
  controlsGroup = null;

  domLoaded = false;

  container;

  /** Calculations mouse to 3d: */
  raycaster;
  mouse;

  /** Camera controls */
  camera;
  renderer;
  scene;

  cameraInfo;

  // On window Resize, (We need to store it to unsubscribe later)
  windowListener;
  mousemoveListener;
  mouseoutListener;
  mousedownListener;
  mouseupListener;

  top; /** Here we store the top & left of the container */
  left;
  width; /** Here we store the width & height of the container */
  height;

  // Container box of the SVG's
  geometryBox;

  constructor() {}

  ngOnInit() {
    this.init3d();
  }
  ngAfterContentInit() {
    this.updateCameraAndRender();
    this.capturePreviews();
    this.backToDefaultCoordinates();
    this.domLoaded = true;
  }

  onMouseUpdate(event) {
    this.updateMouse(event);
    const rayCaster = new Raycaster();
    rayCaster.setFromCamera(this.mouse, this.camera);
    return rayCaster;
  }

  /**
   * MOUSE CONTROLS
   */

  onMouseMove(event) {
    const rayCaster = this.onMouseUpdate(event);
    // calculate objects intersecting the picking ray
    EditorControls.onMouseMove(event, rayCaster);
  }
  onMouseClick(event) {
    const rayCaster = this.onMouseUpdate(event);
    // calculate objects intersecting the picking ray
    EditorControls.onMouseDown(event, rayCaster);
  }
  onMouseOut(event) {
    const rayCaster = this.onMouseUpdate(event);
    // calculate objects intersecting the picking ray
    EditorControls.onMouseOut(event, rayCaster);
  }
  onMouseUp(event) {
    const rayCaster = this.onMouseUpdate(event);
    // calculate objects intersecting the picking ray
    EditorControls.onMouseUp(event, rayCaster);
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

  onWindowResize(event) {
    this.addFloorplan(true);
    this.updateCamera();
    EditorControls.addControlsForElement(this.floorplanWrapper, LAYER_CONTROLS);
  }
  updateCamera() {
    const props = this.containerProps();
    this.renderer.setSize(this.width, this.height);
    this.camera = Object.assign(this.camera, props);
    this.camera.updateProjectionMatrix();
  }
  updateCameraAndRender() {
    this.updateCamera();
    this.render();
  }

  init3d() {
    this.container = document.getElementById('floorplanGraph');

    this.mousemoveListener = this.onMouseMove.bind(this);
    this.mouseoutListener = this.onMouseOut.bind(this);
    this.mousedownListener = this.onMouseClick.bind(this);
    this.mouseupListener = this.onMouseUp.bind(this);

    this.container.addEventListener('mousemove', this.mousemoveListener, false);
    this.container.addEventListener('mouseout', this.mouseoutListener, false);
    this.container.addEventListener('mousedown', this.mousedownListener, false);
    this.container.addEventListener('mouseup', this.mouseupListener, false);

    this.windowListener = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.windowListener, false);

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    this.geometryBox = svgBoundingBox([this.buildingPerimeter]);
    this.setUpCamera();

    // webGL renderer
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true, // required to support .toDataURL()
    });

    this.renderer.setSize(this.width, this.height); //
    this.container.appendChild(this.renderer.domElement);

    // building group
    this.building = new Group();
    // Floorplan group
    this.floorplan = new Group();
    this.floorplanWrapper = new Group();
    this.floorplanWrapperWrapper = new Group();
    // Controls group
    this.controlsGroup = new Group();
    this.controlsGroup.position.z = -1;

    EditorControls.init(
      this.controlsGroup,
      this.render.bind(this),
      this.updateObjectProperties.bind(this),
      this.camera,
      this.container,
      EditorControls.GEOPOSITION,
      null,
      null
    );

    // scene
    this.scene = new Scene();

    this.scene.add(this.building);
    this.scene.add(this.floorplanWrapperWrapper);
    this.floorplanWrapperWrapper.add(this.floorplanWrapper);
    this.floorplanWrapper.add(this.floorplan);
    this.scene.add(this.controlsGroup);

    this.addBuilding();
    this.updateCameraAndRender();

    this.addFloorplan(false);
  }

  correctRadiansAngle(radians) {
    let correctedAngle = (-radians * 180 / Math.PI) % 360;
    while (correctedAngle < 0) {
      correctedAngle += 360;
    }
    while (correctedAngle > 360) {
      correctedAngle -= 360;
    }

    return correctedAngle;
  }
  updateObjectProperties(object, type, newPositionX, newPositionY, newScale, newAngle) {
    if (type === EditorConstants.SIZE) {
      object.scale.x = newScale;
      object.scale.y = newScale;
    } else if (type === EditorConstants.MOVE) {
      object.position.x = newPositionX;
      object.position.y = newPositionY;
    } else if (type === EditorConstants.ROTATE) {
      object.rotation.z = newAngle;
    }

    /**
      this.floorplanWrapper.position.x =
        mapDomBox['width'] / 2 +
        pivotX +
        (this.coords.x_off - this.referenceX) * this.buildingPerimeterScale;
      this.floorplanWrapper.position.y =
        mapDomBox['height'] / 2 +
        pivotY -
        (this.coords.y_off - this.referenceY) * this.buildingPerimeterScale;
    */

    const mapDom = document.getElementById('map');
    const mapDomBox = mapDom.getBoundingClientRect();

    console.log(newPositionX, newPositionY);

    const newPosX =
      +((newPositionX - mapDomBox['width'] / 2) / this.buildingPerimeterScale) -
      this.coords.x_pivot +
      this.referenceX;
    const newPosY =
      -((newPositionY - mapDomBox['height'] / 2) / this.buildingPerimeterScale) -
      this.coords.y_pivot +
      this.referenceY;

    this.manualPreset.emit({
      angle: this.correctRadiansAngle(newAngle),
      x_off: newPosX,
      y_off: newPosY,
    });
    this.render();
  }

  updateCameraRotation() {
    const cameraRotation = this.camera.rotation;
    cameraRotation.x = this.cameraInfo.rotationX;
    cameraRotation.y = this.cameraInfo.rotationY;
    cameraRotation.z = this.cameraInfo.rotationZ;
  }

  setUpCamera() {
    const props = this.containerProps();
    this.camera = new OrthographicCamera(props.left, props.right, props.top, props.bottom, 1, 1000);

    // TOP
    this.camera.position.set(0, 0, -45);
    this.camera.rotation.order = 'ZYX';

    this.cameraInfo = {
      rotationX: Math.PI,
      rotationY: 0,
      rotationZ: 0,
    };

    this.updateCameraRotation();
  }

  /**
   * Update the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
    // Display render debug data: console.log(this.renderer.info);
  }

  updateComponentCoordinates() {
    const rect = this.container.getBoundingClientRect();
    const rectBody = document.body.getBoundingClientRect();

    this.top = rect.top - rectBody.top;
    this.left = rect.left - rectBody.left;

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
  }

  containerProps() {
    this.updateComponentCoordinates();

    const geometryWidth = this.geometryBox.x2 - this.geometryBox.x1;
    const geometryHeight = this.geometryBox.y2 - this.geometryBox.y1;

    // const aspectRatio = geometryWidth / geometryHeight;
    const aspectRatio = this.width / this.height;

    return {
      left: -this.width / 2,
      right: this.width / 2,
      top: this.height / 2,
      bottom: -this.height / 2,
    };
  }

  /**
   * Component input data changes like:
   * New hexagon data, compare hexagon data A & B
   * @param {SimpleChanges} changes
   */
  ngOnChanges(changes: SimpleChanges) {
    // Resolution changed, we've to redraw
    if (changes.buildingPerimeter && !changes.buildingPerimeter.firstChange) {
      this.addBuilding();
      this.addFloorplan(false);

      // Generate images
      this.updateCameraAndRender();
      this.capturePreviews();
      this.backToDefaultCoordinates();

      this.render();
    }
    if (changes.modelStructure && !changes.modelStructure.firstChange) {
      this.addFloorplan(true);
      this.render();
      EditorControls.addControlsForElement(this.floorplanWrapper, LAYER_CONTROLS);
    }
    if (changes.coords && !changes.coords.firstChange) {
      this.addFloorplan(true);
      this.render();
      EditorControls.addControlsForElement(this.floorplanWrapper, LAYER_CONTROLS);
    }
  }

  addFloorplanByStructure() {
    console.log('addFloorplanByStructure', this.modelStructure);

    this.removeOldFloorplan();
    this.analyzeStructure(this.modelStructure);
  }

  analyzeStructure(structure) {
    structure.floors.forEach(floor => {
      this.analyzeStructureRecursive(floor);
    });
  }

  analyzeStructureRecursive(structure) {
    const white = 0xffffff;
    const grey = 0xaaaaaa;
    const darkGrey = 0x666666;
    const black = 0x000000;

    const zIndex = -0.01;
    const forceMaterial = null;
    const polygonOpacity = 1;
    const onCreate = () => {};

    /** Features */
    if (structure.type === EditorConstants.TOILET) {
    } else if (structure.type === EditorConstants.STAIRS) {
    } else if (structure.type === EditorConstants.SINK) {
    } else if (structure.type === EditorConstants.KITCHEN) {
    } else if (structure.type === EditorConstants.DESK) {
    } else if (structure.type === EditorConstants.CHAIR) {
    } else if (structure.type === EditorConstants.OFFICE_MISC) {
    } else if (structure.type === EditorConstants.MISC) {
      /** Separators */
    } else if (
      structure.type === EditorConstants.SEPARATOR_NOT_DEFINED ||
      structure.type === EditorConstants.ENVELOPE ||
      structure.type === EditorConstants.RAILING
    ) {
      drawPolygons(
        this.floorplan,
        EditorConstants.WALL,
        structure.footprint.coordinates,
        black,
        zIndex,
        forceMaterial,
        polygonOpacity,
        onCreate
      );

      /** AreaType */
    } else if (
      structure.type === EditorConstants.SHAFT ||
      structure.type === EditorConstants.BALCONY ||
      structure.type === EditorConstants.CORRIDOR ||
      structure.type === EditorConstants.STOREROOM ||
      structure.type === EditorConstants.ROOM ||
      structure.type === EditorConstants.DINING ||
      structure.type === EditorConstants.BATHROOM ||
      structure.type === EditorConstants.AREA_KITCHEN ||
      structure.type === EditorConstants.AREA_KITCHEN_DINING ||
      structure.type === EditorConstants.AREA_NOT_DEFINED
    ) {
      drawPolygons(
        this.floorplan,
        EditorConstants.AREA,
        structure.footprint.coordinates,
        grey,
        zIndex,
        forceMaterial,
        polygonOpacity,
        onCreate
      );

      /** SpaceType */
    } else if (structure.type === EditorConstants.SPACE_NOT_DEFINED) {
      if (structure.footprint && structure.footprint.coordinates) {
        drawPolygons(
          this.floorplan,
          EditorConstants.AREA,
          structure.footprint.coordinates,
          grey,
          zIndex,
          forceMaterial,
          polygonOpacity,
          onCreate
        );
      }

      /** OpeningType */
    } else if (structure.type === EditorConstants.DOOR) {
      if (structure.footprint && structure.footprint.coordinates) {
        drawGeometries(this.floorplan, structure.footprint.coordinates, darkGrey, 1.5, -1);
      }
      if (structure.opening_area && structure.opening_area.coordinates) {
        drawGeometries(this.floorplan, structure.opening_area.coordinates, darkGrey, 1.5, -1);
      }
    } else if (
      structure.type === EditorConstants.WINDOW_ENVELOPE ||
      structure.type === EditorConstants.WINDOW_INTERIOR
    ) {
      drawGeometries(this.floorplan, structure.footprint.coordinates, 0x333333, 1, -1);
      drawPolygons(
        this.floorplan,
        structure.type,
        structure.footprint.coordinates,
        white, // grey,
        -0.09,
        forceMaterial,
        polygonOpacity,
        onCreate
      );

      /** Undefined */
    } else if (structure.type === EditorConstants.to_be_filled) {
    } else if (structure.type) {
      console.error('UNKNOWN analyzeStructure ', structure.type);
    }

    if (structure.children) {
      structure.children.forEach(child => {
        this.analyzeStructureRecursive(child);
      });
    }
  }

  /**
   * Add the floorplan with the selected coordinates.
   * White background with black walls.
   */
  addFloorplan(reset) {
    if (reset) {
      this.correctCoordinates();
    } else {
      this.removeOldFloorplan();
      this.addFloorplanByStructure();
      this.correctCoordinates();
    }
  }

  resetCoordinates() {
    // this.floorplan.rotateZ(-this.floorplan.rotation.z);
    this.floorplanWrapper.rotateZ(-this.floorplanWrapper.rotation.z);

    const floorplanBounds = new Box3().setFromObject(this.floorplan);

    this.floorplan.position.x = 0;
    this.floorplan.position.y = 0;

    this.floorplanWrapper.position.x = 0;
    this.floorplanWrapper.position.y = 0;

    this.floorplan.scale.x = this.buildingPerimeterScale;
    this.floorplan.scale.y = -this.buildingPerimeterScale;
  }

  /**
   * After the floorplan is loaded we center and correct the coordinates
   */
  correctCoordinates() {
    this.resetCoordinates();

    if (this.coords) {
      let pivotX = 0;
      let pivotY = 0;
      let angle = 0;

      if (this.coords.x_pivot) {
        pivotX = this.coords.x_pivot * this.buildingPerimeterScale;
        this.floorplan.translateX(-pivotX);
      }

      if (this.coords.y_pivot) {
        pivotY = -this.coords.y_pivot * this.buildingPerimeterScale;
        this.floorplan.translateY(-pivotY);
      }

      if (this.coords.angle) {
        angle = -this.coords.angle * Math.PI / 180;
        this.floorplanWrapper.rotateZ(angle);
      }

      const mapDom = document.getElementById('map');
      const mapDomBox = mapDom.getBoundingClientRect();

      this.floorplanWrapper.position.x =
        mapDomBox['width'] / 2 +
        pivotX +
        (this.coords.x_off - this.referenceX) * this.buildingPerimeterScale;
      this.floorplanWrapper.position.y =
        mapDomBox['height'] / 2 +
        pivotY -
        (this.coords.y_off - this.referenceY) * this.buildingPerimeterScale;
    }
  }

  /**
   * Add the perimeter of the building
   * White background with black walls.
   */
  addBuilding() {
    const objectClass = EditorConstants.WALL;
    const materialColor = 0xffffff;
    const lineColor = 0x000000;
    const zIndex = 0.01;
    const forceMaterial = null;
    const polygonOpacity = 1;

    this.removeOldBuilding();

    drawGeometries(this.building, [this.buildingPerimeter], lineColor, 5, zIndex);

    drawPolygons(
      this.building,
      objectClass,
      [this.buildingPerimeter],
      materialColor,
      zIndex,
      forceMaterial,
      polygonOpacity,
      () => {}
    );

    const buildingBounds = new Box3().setFromObject(this.building);

    const deltaX = (buildingBounds.max.x + buildingBounds.min.x) / 2;
    const deltaY = (buildingBounds.max.y + buildingBounds.min.y) / 2;

    // Center the scene
    this.scene.translateY(-deltaY);
    this.scene.translateX(-deltaX);
  }

  clearGroup(group) {
    if (group && group.children) {
      for (let i = group.children.length - 1; i >= 0; i -= 1) {
        group.remove(group.children[i]);
      }
    }
  }

  removeOldControls() {
    this.clearGroup(this.controlsGroup);
  }

  removeOldFloorplan() {
    this.clearGroup(this.floorplan);
  }

  removeOldBuilding() {
    this.clearGroup(this.building);
  }

  ngOnDestroy(): void {
    if (this.windowListener) {
      // Unsubscribe from window events
      window.removeEventListener('resize', this.windowListener);
    }
    if (this.mousemoveListener) {
      this.container.removeEventListener('mousemove', this.mousemoveListener);
    }
    if (this.mouseoutListener) {
      this.container.removeEventListener('mouseout', this.mouseoutListener);
    }
    if (this.mousedownListener) {
      this.container.removeEventListener('mousedown', this.mousedownListener);
    }
    if (this.mouseupListener) {
      this.container.removeEventListener('mouseup', this.mouseupListener);
    }
  }

  /**
   * We add the picture from the PREVIOUS Coordinates to the previews
   */
  capturePreviousPreviews(previews, reset) {
    if (this.previousCoords) {
      this.coords = this.previousCoords;
      this.addFloorplan(reset);
      this.render();
      const image = this.renderer.domElement.toDataURL('image/png');
      previews.push({
        index: 'preselected',
        img: image,
      });
    }
  }

  /**
   * We add the picture from the GIVEN Coordinates to the previews
   */
  capturePreviewsPreviews(previews, reset) {
    for (let i = 0; i < this.allPossibleCoords.length; i += 1) {
      this.coords = this.allPossibleCoords[i];
      this.addFloorplan(reset);
      this.render();
      const image = this.renderer.domElement.toDataURL('image/png');
      previews.push({
        index: i,
        img: image,
      });
    }
  }

  /**
   * Captures previous and 5 previews
   */
  capturePreviews() {
    const reset = true;
    const previews = [];

    this.capturePreviousPreviews(previews, reset);
    this.capturePreviewsPreviews(previews, reset);

    this.previews.emit(previews);
  }

  /**
   * We go back to the default coordinates
   */
  backToDefaultCoordinates() {
    // Back to default position
    this.coords = this.previousCoords ? this.previousCoords : this.allPossibleCoords[0];

    this.addFloorplan(true);
    this.render();
    EditorControls.addControlsForElement(this.floorplanWrapper, LAYER_CONTROLS);
  }
}
