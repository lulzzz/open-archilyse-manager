import { Component, Output, EventEmitter, Input } from '@angular/core';
import { UniqueIdService } from '../../_services';

@Component({
  selector: 'toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
})
export class ToggleButtonComponent {
  id: string;

  @Input() value = false;
  @Output() toggled = new EventEmitter<boolean>();

  constructor(private uniqueIdService: UniqueIdService) {
    this.id = `toggle-${uniqueIdService.getNewId()}`;
  }

  onToggle() {
    this.value = !this.value;
    this.toggled.emit(this.value);
  }

  onChange($event) {
    //   this.toggled.emit($event.target.checked);
  }
}
