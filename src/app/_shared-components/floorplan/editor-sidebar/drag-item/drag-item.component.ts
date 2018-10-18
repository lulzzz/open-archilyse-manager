import { Component, Input, OnInit } from '@angular/core';
import { DiagramService, ElementEvent } from '../../../../_services';

/** Drag and drop item for the editor */
@Component({
  selector: 'app-drag-item',
  templateUrl: './drag-item.component.html',
  styleUrls: ['./drag-item.component.scss'],
})
export class DragItemComponent {
  /** Image source, the image will be dragged */
  @Input() src;

  /** Element text */
  @Input() text;

  constructor(private diagramService: DiagramService) {}

  /** Event when starting the drag */
  onDragStart(evt) {
    // console.log('onDragStart', evt);
    // evt.preventDefault();
    // evt.stopPropagation();
  }

  /** Event while the dragging */
  onDrag(evt) {
    // console.log('onDrag', evt);
    // evt.preventDefault();
    // evt.stopPropagation();
  }

  /** Event when ending the drag */
  onDragEnd(evt) {
    console.log('onDragEnd', evt);
    this.diagramService.newElementDropped(
      new ElementEvent(evt.clientX, evt.clientY, this.text)
    );
    // evt.preventDefault();
    // evt.stopPropagation();
  }
}
