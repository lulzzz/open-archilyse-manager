import {
  Mesh,
  Group,
  Box3,
  MeshBasicMaterial,
  TextureLoader,
  BoxGeometry,
} from 'three-full/builds/Three.es.js';

import { EditorConstants } from './EditorConstants';

/** TODO document */
let controlsToIntersect = [];
/** TODO document */
let uuidToControl = {};

/** TODO document */
let selectedControl = null;
/** TODO document */
let selectedControlMetadata = null;

/** TODO document */
let controlsGroup;
/** TODO document */
let controlsGroupX;
/** TODO document */
let controlsGroupY;

/** TODO document */
let controlsGroupRealX;
/** TODO document */
let controlsGroupRealY;

/** TODO document */
let controlsInnerGroup;

/** TODO document */
let renderMethod;

/** TODO document */
let dragging = false;
/** TODO document */
let draggingElement = null;
/** TODO document */
let draggingType = null;
/** TODO document */
let onDragging = null;

/** TODO document */
let draggingRefX = null;
/** TODO document */
let draggingRefY = null;

/** TODO document */
let elementOriginalX = null;
/** TODO document */
let elementOriginalY = null;
/** TODO document */
let elementOriginalAngle = null;
/** TODO document */
let elementOriginalScale = null;

/** TODO document */
let scale;
/** TODO document */
let distance;
/** TODO document */
const distanceReference = 150;

/** TODO document */
let expandCoordX;
/** TODO document */
let expandCoordY;

/** TODO document */
let rotateCoordX;
/** TODO document */
let rotateCoordY;

/** TODO document */
let controlSizeX = 50;
/** TODO document */
let controlSizeY = 50;

/** TODO document */
let sceneContainer = null;
/** TODO document */
let sceneCamera = null;

/** TODO document */
let enableCamera;
/** TODO document */
let disableCamera;

/** TODO document */
let showScale;
/** TODO document */
let controlMode;

/**
 * The EditorControls class adds user controls to elements so can change the properties.
 * Is used to Georeference Layouts and also in the Layout editor
 */
export class EditorControls {
  /**
   * Control modes
   */
  public static GEOPOSITION = 10; // Doesn't have resize
  public static FLOORPLAN = 20;

  public static init(
    group,
    onRender,
    onUpdateObjectProperties,
    camera,
    container,
    mode,
    enableCameraControls,
    disableCameraControls
  ) {
    // We can disable the camera control of the scene
    enableCamera = enableCameraControls;
    disableCamera = disableCameraControls;

    controlsGroup = group;
    renderMethod = onRender;

    controlsToIntersect = [];
    uuidToControl = {};

    selectedControl = null;
    selectedControlMetadata = null;

    sceneContainer = container;
    sceneCamera = camera;

    this.cancelDragging();

    onDragging = onUpdateObjectProperties;
    showScale = true;

    controlMode = mode;

    if (controlMode === EditorControls.GEOPOSITION) {
      scale = 1;
      showScale = false;
    } else if (controlMode === EditorControls.FLOORPLAN) {
      scale = 0.035;
    }

    controlSizeX = 50 * scale;
    controlSizeY = 50 * scale;

    distance = distanceReference * scale;

    expandCoordX = 0;
    expandCoordY = distance;

    rotateCoordX = -distance;
    rotateCoordY = 0;
  }

  /**
   * Mouse controls
   */
  public static onMouseMove(event, raycaster) {
    // calculate objects intersecting the picking ray
    this.identifyMaterial(
      event,
      raycaster.intersectObjects(controlsToIntersect)
    );
  }

  public static onMouseDown(event, raycaster) {
    // calculate objects intersecting the picking ray
    this.identifyMaterial(
      event,
      raycaster.intersectObjects(controlsToIntersect)
    );
  }

  public static onMouseUp(event, raycaster) {
    // calculate objects intersecting the picking ray
    this.identifyMaterial(
      event,
      raycaster.intersectObjects(controlsToIntersect)
    );
  }

  public static onMouseOut(event, raycaster) {
    // calculate objects intersecting the picking ray
    this.identifyMaterial(
      event,
      raycaster.intersectObjects(controlsToIntersect)
    );
  }

  public static isDragging() {
    return dragging;
  }

  public static cancelDragging() {
    if (draggingType === EditorConstants.SIZE) {
      selectedControl.position.y = expandCoordY;
    }

    if (enableCamera !== null && typeof enableCamera !== 'undefined') {
      enableCamera();
    }

    dragging = false;
    draggingType = null;

    draggingRefX = null;
    draggingRefY = null;

    elementOriginalX = null;
    elementOriginalY = null;
    elementOriginalAngle = null;
    elementOriginalScale = null;
  }

  /**
   * We calculate the top left corner from the scene in pixels
   */
  public static topLeft() {
    const rect = sceneContainer.getBoundingClientRect();
    const rectBody = document.body.getBoundingClientRect();
    return {
      top: rect.top - rectBody.top,
      left: rect.left - rectBody.left,
    };
  }

  /**
   * Angle changes only 0.025 radians each time
   */
  public static magnetizeAngle(original) {
    const magnetStep = 0.025;
    return Math.floor(original / magnetStep) * magnetStep;
  }

  public static identifyMaterial(event, intersects) {
    let over = false;
    if (event.type === 'mouseup' || event.type === 'mouseout') {
      this.cancelDragging();
    } else if (dragging) {
      event.stopPropagation();

      let newScale = elementOriginalScale;
      let newAngle = elementOriginalAngle;

      const tl = this.topLeft();

      const incX = event.clientX - tl.left - draggingRefX;
      let incY = event.clientY - tl.top - draggingRefY;

      if (controlMode === EditorControls.GEOPOSITION) {
      } else if (controlMode === EditorControls.FLOORPLAN) {
        incY = -incY;
      }

      let newPositionX = elementOriginalX + incX * scale;
      let newPositionY = elementOriginalY + incY * scale;

      if (draggingType === EditorConstants.MOVE) {
        controlsGroup.position.x = controlsGroupX + incX * scale;
        controlsGroup.position.y = controlsGroupY + incY * scale;
      } else if (
        draggingType === EditorConstants.SIZE ||
        draggingType === EditorConstants.ROTATE
      ) {
        const rect = sceneContainer.getBoundingClientRect();
        const rectBody = document.body.getBoundingClientRect();

        const tl = this.topLeft();
        const top = tl.top;
        const left = tl.left;

        const deltaX = Math.trunc(
          incX + draggingRefX - left - controlsGroupX - 25
        );
        const deltaY = Math.trunc(
          incY + draggingRefY - top - controlsGroupY - 25
        );

        if (draggingType === EditorConstants.SIZE) {
          let dist = 150;
          if (controlMode === EditorControls.GEOPOSITION) {
            dist = Math.sqrt(deltaY * deltaY + deltaX * deltaX);
          } else if (controlMode === EditorControls.FLOORPLAN) {
            const inc2X = event.clientX - tl.left - controlsGroupRealX;
            const inc2Y = event.clientY - tl.top - controlsGroupRealY;

            dist = Math.sqrt(inc2Y * inc2Y + inc2X * inc2X);
          }

          newScale = elementOriginalScale * (dist + 5) / distanceReference;
          selectedControl.position.y = dist * scale;
        } else if (draggingType === EditorConstants.ROTATE) {
          const inc2X = event.clientX - tl.left - controlsGroupRealX;
          const inc2Y = event.clientY - tl.top - controlsGroupRealY;

          if (controlMode === EditorControls.GEOPOSITION) {
            newAngle = this.magnetizeAngle(Math.atan2(inc2Y, inc2X) + Math.PI);

            // The position doesn't chenge.
            newPositionX = elementOriginalX;
            newPositionY = elementOriginalY;
          } else if (controlMode === EditorControls.FLOORPLAN) {
            newAngle = -this.magnetizeAngle(Math.atan2(inc2Y, inc2X) + Math.PI);
          }

          controlsInnerGroup.rotation.z = newAngle;
        }
      }

      onDragging(
        draggingElement,
        draggingType,
        newPositionX,
        newPositionY,
        newScale,
        newAngle
      );

      // We intersected at least 1 element
    } else if (intersects.length) {
      const filtered = intersects.filter(o => o.object.type === 'Mesh');

      // It's a mesh
      if (filtered.length) {
        event.stopPropagation();

        const lestDistanceObject = filtered[0].object;
        const control = uuidToControl[lestDistanceObject.uuid];

        if (
          selectedControl !== null &&
          selectedControl.uuid !== lestDistanceObject.uuid
        ) {
          selectedControl.material = selectedControlMetadata.material1;
        }

        selectedControl = lestDistanceObject;
        selectedControlMetadata = control;

        if (
          control.type === EditorConstants.SIZE ||
          control.type === EditorConstants.MOVE ||
          control.type === EditorConstants.ROTATE
        ) {
          document.body.style.cursor = 'move';
        }

        over = true;

        if (event.type === 'mousemove') {
          if (!dragging) {
            lestDistanceObject.material = control.material2;
          }
        } else if (event.type === 'click' || event.type === 'mousedown') {
          lestDistanceObject.material = control.material3;
          dragging = true;

          if (disableCamera !== null) {
            disableCamera();
          }

          const tl = this.topLeft();

          draggingRefX = event.clientX - tl.left;
          draggingRefY = event.clientY - tl.top;

          draggingType = control.type;

          controlsGroupX = controlsGroup.position.x;
          controlsGroupY = controlsGroup.position.y;

          const pos = controlsGroup.getWorldPosition().clone();
          pos.project(sceneCamera);

          const rect = sceneContainer.getBoundingClientRect();
          const width = rect.width;
          const height = rect.height;
          const widthHalf = width / 2;
          const heightHalf = height / 2;

          controlsGroupRealX = pos.x * widthHalf + widthHalf;
          controlsGroupRealY = -pos.y * heightHalf + heightHalf;

          elementOriginalX = draggingElement.position.x;
          elementOriginalY = draggingElement.position.y;
          elementOriginalAngle = draggingElement.rotation.z;
          elementOriginalScale = draggingElement.scale.x;
        } else {
          console.error('Event event.type: ', event.type);
        }

        renderMethod();
      }
    }

    if (!over && !dragging) {
      document.body.style.cursor = 'default';

      if (selectedControl !== null) {
        selectedControl.material = selectedControlMetadata.material1;
        selectedControlMetadata = null;
        selectedControl = null;

        renderMethod();
      }
    }
  }

  /**
   * Given element
   * @param element
   * @param coorZ
   */
  public static addControlsForElement(element, coorZ) {
    EditorControls.removeOldControls();

    const controlsGroupBounds = new Box3().setFromObject(element);
    const centerX =
      controlsGroupBounds.min.x +
      (controlsGroupBounds.max.x - controlsGroupBounds.min.x) / 2;
    const centerY =
      controlsGroupBounds.min.y +
      (controlsGroupBounds.max.y - controlsGroupBounds.min.y) / 2;

    draggingElement = element;

    if (controlMode === EditorControls.GEOPOSITION) {
      controlsGroup.position.x = element.position.x;
      controlsGroup.position.y = element.position.y;
    } else if (controlMode === EditorControls.FLOORPLAN) {
      controlsGroup.position.x = centerX;
      controlsGroup.position.y = centerY;
    }

    controlsInnerGroup = new Group();
    controlsGroup.add(controlsInnerGroup);

    controlsInnerGroup.rotation.z = element.rotation.z;

    this.addControls(coorZ);
  }

  public static addControl(
    coorX,
    coorY,
    coorZ,
    control_type,
    url1,
    url2,
    url3,
    url4,
    onComplete
  ) {
    new TextureLoader().load(url1, img1 => {
      new TextureLoader().load(url2, img2 => {
        new TextureLoader().load(url3, img3 => {
          new TextureLoader().load(url4, img4 => {
            const geometry = new BoxGeometry(controlSizeX, controlSizeY, 0);
            const material_1 = new MeshBasicMaterial({
              map: img1,
              transparent: true,
            });
            const material_2 = new MeshBasicMaterial({
              map: img2,
              transparent: true,
            });
            const material_3 = new MeshBasicMaterial({
              map: img3,
              transparent: true,
            });
            const material_4 = new MeshBasicMaterial({
              map: img4,
              transparent: true,
            });
            const cube = new Mesh(geometry, material_1);
            controlsInnerGroup.add(cube);

            controlsToIntersect.push(cube);
            uuidToControl[cube.uuid] = {
              type: control_type,
              material1: material_1,
              material2: material_2,
              material3: material_3,
              material4: material_4,
            };

            cube.position.x = coorX;
            cube.position.y = coorY;
            cube.position.z = coorZ;

            onComplete();
          });
        });
      });
    });
  }

  /**
   * Move an rotate controls only for georeferencing a Layout
   * @param coorZ zIndez for the controls
   */
  public static addRotateMoveControls(coorZ) {
    this.addControl(
      0,
      0,
      coorZ,
      EditorConstants.MOVE,
      '/assets/images/editor/move-0.png',
      '/assets/images/editor/move-1.png',
      '/assets/images/editor/move-2.png',
      '/assets/images/editor/move-3.png',
      () => {
        this.addControl(
          rotateCoordX,
          rotateCoordY,
          coorZ,
          EditorConstants.ROTATE,
          '/assets/images/editor/rotate-0.png',
          '/assets/images/editor/rotate-1.png',
          '/assets/images/editor/rotate-2.png',
          '/assets/images/editor/rotate-3.png',
          renderMethod
        );
      }
    );
  }

  public static addControls(coorZ) {
    controlsToIntersect = [];
    uuidToControl = {};

    if (showScale) {
      this.addControl(
        expandCoordX,
        expandCoordY,
        coorZ,
        EditorConstants.SIZE,
        '/assets/images/editor/expand-0.png',
        '/assets/images/editor/expand-1.png',
        '/assets/images/editor/expand-2.png',
        '/assets/images/editor/expand-3.png',
        this.addRotateMoveControls.bind(this, coorZ)
      );
    } else {
      this.addRotateMoveControls(coorZ);
    }
  }

  public static clearGroup(group) {
    if (group && group.children) {
      for (let i = group.children.length - 1; i >= 0; i -= 1) {
        group.remove(group.children[i]);
      }
    }
  }

  public static removeOldControls() {
    EditorControls.clearGroup(controlsGroup);
  }
}
