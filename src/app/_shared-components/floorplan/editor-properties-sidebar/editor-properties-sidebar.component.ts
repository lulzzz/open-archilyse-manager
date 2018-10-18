import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  SimpleChanges,
  OnDestroy,
  OnChanges,
} from '@angular/core';

import { Vector2, ShapeUtils } from 'three-full/builds/Three.es.js';
import { EditorService } from '../../../_services';
import { Subscription } from 'rxjs/Subscription';
import {
  EditorConstants,
  groupToHuman,
} from '../../../_shared-libraries/EditorConstants';
import { COOR_X, COOR_Y } from '../../../_shared-libraries/SimData';

@Component({
  selector: 'app-editor-properties-sidebar',
  templateUrl: './editor-properties-sidebar.component.html',
  styleUrls: ['./editor-properties-sidebar.component.scss'],
})
export class EditorPropertiesSidebarComponent
  implements OnInit, OnChanges, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Input() sidebarProperties;
  @Input() sidebarPropertiesData;

  /** Sidebar content */
  title;
  content;
  footer;

  controls = null;
  attributeGroups = [];

  uniqueId;

  subscriptionEditor: Subscription;

  constructor(private editorService: EditorService) {}

  ngOnInit() {
    this.evaluateContent();

    this.uniqueId = this.editorService.getUniqueId();
    this.subscriptionEditor = this.editorService.eventData$.subscribe(
      eventData => {
        console.log('EDITOR - SIDEBAR - eventData', this.uniqueId, eventData);
      }
    );
  }

  evaluateContent() {
    // console.log('evaluateContent', this.sidebarProperties, this.sidebarPropertiesData);
    // console.log('this.sidebarPropertiesData.group ', this.sidebarPropertiesData.group);

    this.controls = null;
    this.title =
      groupToHuman(this.sidebarPropertiesData.group, false, true) +
      ' properties.';

    const group = this.sidebarPropertiesData.group;

    if (group === EditorConstants.AREA) {
      const currentArray = this.sidebarPropertiesData.data.areaData;
      const currentArrayVector = currentArray.map(
        coor => new Vector2(coor[COOR_X], coor[COOR_Y])
      );
      const calculatedM2 = Math.abs(
        ShapeUtils.area(currentArrayVector)
      ).toFixed(2);

      this.content = `
        <div class="valueRow">
          <span class="valueTitle">Area:</span>
          <span class="valueColumn">${calculatedM2} m<sup>2</sup></span>
        </div>`;

      this.attributeGroups = [];
    } else if (
      group === EditorConstants.DOOR ||
      group === EditorConstants.WALL ||
      group === EditorConstants.WINDOW_ENVELOPE ||
      group === EditorConstants.WINDOW_INTERIOR
    ) {
      /** Not implemented yet */
      this.controls = [];
      this.attributeGroups = [];
      this.content = ``;
    } else if (
      group === EditorConstants.TOILET ||
      group === EditorConstants.KITCHEN ||
      group === EditorConstants.STAIRS ||
      group === EditorConstants.SINK ||
      group === EditorConstants.OFFICE_MISC
    ) {
      const reference = this.sidebarPropertiesData.data.object;

      const x = reference.pos[0];
      const y = reference.pos[1];
      const angle = reference.direction;

      const h = reference.height;
      const l = reference.length;
      const w = reference.width;

      this.controls = [
        {
          key: 'copy',
          name: 'Copy',
          popper: 'Copy element',
          icon: 'fa-copy',
          onClick: event => {
            console.log('Copy element', event);
          },
        },
        {
          key: 'delete',
          name: 'Delete',
          popper: 'Delete element',
          icon: 'fa-trash',
          onClick: event => {
            console.log('Delete element', event);
          },
        },
      ];

      this.attributeGroups = [
        {
          key: 'size',
          title: 'SIZE',
          attributes: [
            {
              key: 'length',
              name: 'Length',
              type: 'number',
              value: l,
              min: 0,
              step: 0.2,
              unit: ' m.',
            },
            {
              key: 'width',
              name: 'Width',
              type: 'number',
              value: w,
              min: 0,
              step: 0.2,
              unit: ' m.',
            },
            {
              key: 'height',
              name: 'Height',
              type: 'number',
              value: h,
              min: 0,
              step: 0.2,
              unit: ' m.',
            },
          ],
        },

        {
          key: 'position',
          title: 'POSITION',
          attributes: [
            {
              key: 'posx',
              name: 'Position x',
              type: 'number',
              value: x,
              step: 0.2,
              unit: ' m.',
            },
            {
              key: 'posy',
              name: 'Position y',
              type: 'number',
              value: y,
              step: 0.2,
              unit: ' m.',
            },
            {
              key: 'angle',
              name: 'Angle',
              type: 'number',
              value: angle,
              min: 0,
              max: 360,
              step: 1,
              unit: ' °',
            },
          ],
        },
      ];

      this.content = ``;
    } else if (
      group === EditorConstants.DESK ||
      group === EditorConstants.CHAIR
    ) {
      const reference = this.sidebarPropertiesData.data.object;

      const x = reference.pos[0];
      const y = reference.pos[1];
      const angle = reference.direction;

      const h = reference.height;
      const l = reference.length;
      const w = reference.width;

      this.controls = [
        {
          key: 'copy',
          name: 'Copy',
          popper: 'Copy element',
          icon: 'fa-copy',
          onClick: event => {
            console.log('Copy element', event, this.sidebarPropertiesData);
            this.editorService.eventFired(this.uniqueId, {
              type: 'COPY',
              id: this.sidebarPropertiesData.data.object.id,
            });
          },
        },
        {
          key: 'delete',
          name: 'Delete',
          popper: 'Delete element',
          icon: 'fa-trash',
          onClick: event => {
            console.log('Delete element', event, this.sidebarPropertiesData);
            this.editorService.eventFired(this.uniqueId, {
              type: 'DELETE',
              id: this.sidebarPropertiesData.data.object.id,
            });
          },
        },
      ];

      this.attributeGroups = [
        {
          key: 'size',
          title: 'SIZE',
          attributes: [
            {
              key: 'length',
              name: 'Length',
              type: 'number',
              value: l,
              min: 0,
              step: 0.2,
              unit: ' m.',
            },
            {
              key: 'width',
              name: 'Width',
              type: 'number',
              value: w,
              min: 0,
              step: 0.2,
              unit: ' m.',
            },
            {
              key: 'height',
              name: 'Height',
              type: 'number',
              value: h,
              min: 0,
              step: 0.2,
              unit: ' m.',
            },
          ],
        },

        {
          key: 'position',
          title: 'POSITION',
          attributes: [
            {
              key: 'posx',
              name: 'Position x',
              type: 'number',
              value: x,
              min: -100,
              max: 100,
              step: 0.2,
              unit: ' m.',
            },
            {
              key: 'posy',
              name: 'Position y',
              type: 'number',
              value: y,
              min: -100,
              max: 100,
              step: 0.2,
              unit: ' m.',
            },
            {
              key: 'angle',
              name: 'Angle',
              type: 'number',
              value: angle,
              min: 0,
              max: 360,
              step: 1,
              unit: ' °',
            },
          ],
        },
      ];

      this.content = ``;
    } else if (EditorConstants.MISC) {
      /** Not implemented yet */
      this.controls = [];
      this.attributeGroups = [];
      this.content = `Miscellaneous element`;
    } else {
      console.error(`Unknown element`, group);

      /** Not implemented yet */
      this.controls = [];
      this.attributeGroups = [];
      this.content = `Unknown element`;
    }
    this.footer = '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.evaluateContent();
  }

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.subscriptionEditor) {
      this.subscriptionEditor.unsubscribe();
    }
  }

  onInputRange($event, key) {
    const newValue = parseFloat($event.target.value);
    this.onAttributeChangeVal($event.target.value, key);
  }
  onChangeRange($event, key) {
    const newValue = parseFloat($event.target.value);
    this.onAttributeChangeVal($event.target.value, key);
  }

  onAttributeChangeVal(value, key) {
    if (key === 'angle') {
      this.sidebarPropertiesData.data.object.direction = value;
    } else if (key === 'posx') {
      this.sidebarPropertiesData.data.object.pos[0] = value;
    } else if (key === 'posy') {
      this.sidebarPropertiesData.data.object.pos[1] = value;
    } else if (key === 'width') {
      this.sidebarPropertiesData.data.object.width = value;
    } else if (key === 'length') {
      this.sidebarPropertiesData.data.object.length = value;
    } else if (key === 'height') {
      this.sidebarPropertiesData.data.object.height = value;
    } else {
      console.error('Unknown property ', key);
    }

    console.log('UPDATED', this.sidebarPropertiesData.data.object);
  }

  onAttributeChange($event, key) {
    const newValue = parseFloat($event.target.value);
    this.onAttributeChangeVal(newValue, key);
  }

  mousemoveListener(event: any) {
    // event.preventDefault();
    // event.stopPropagation();
  }

  mouseoutListener(event: any) {
    // event.preventDefault();
    event.stopPropagation();
  }

  mousedownListener(event: any) {
    // console.log('mousedownListener', event, event.target);
    // event.target.focus();
    // const selection = window.getSelection();
    // console.log('selection', selection);
    // event.preventDefault();
    event.stopPropagation();
  }

  onClick(event: any) {
    // console.log('onClick');
    // event.preventDefault();
    event.stopPropagation();
  }
}
