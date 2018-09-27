import { Component, Input, OnInit } from '@angular/core';
import { DiagramService, ElementEvent } from '../../../../_services';

@Component({
  selector: 'app-drag-item',
  templateUrl: './drag-item.component.html',
  styleUrls: ['./drag-item.component.scss'],
})
export class DragItemComponent implements OnInit {
  @Input() src;
  @Input() text;

  constructor(private diagramService: DiagramService) {}

  ngOnInit() {}

  onDragStart(evt) {
    // console.log('onDragStart', evt);
    // evt.preventDefault();
    // evt.stopPropagation();
  }

  onDrag(evt) {
    // console.log('onDrag', evt);
    // evt.preventDefault();
    // evt.stopPropagation();
  }

  onDragEnd(evt) {
    console.log('onDragEnd', evt);
    this.diagramService.newElementDropped(new ElementEvent(evt.clientX, evt.clientY, this.text));
    // evt.preventDefault();
    // evt.stopPropagation();
  }
}
