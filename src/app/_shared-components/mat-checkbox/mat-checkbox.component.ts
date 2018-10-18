import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular/main';

/**
 * Allows to display checkboxes in ag-grid
 * We can use the parameter "editable" = true/false for read only cells.
 */
@Component({
  selector: 'checkbox-cell',
  template: `<mat-checkbox [checked]="checked" [disabled]="!editable" (change)="onChange($event)"></mat-checkbox>`,
  styleUrls: ['./mat-checkbox.component.scss'],
})
export class MatCheckboxComponent implements ICellRendererAngularComp {
  private params: any;

  checked = false;
  editable = true;

  agInit(params: any): void {
    this.params = params;

    if (this.params.editable === true || this.params.editable === false) {
      this.editable = this.params.editable;
    }

    this.checked = this.params.value;
  }

  // demonstrates how you can do "inline" editing of a cell
  onChange(event) {
    if (this.editable) {
      this.checked = event.checked;
      this.params.node.setDataValue(this.params.colDef, event.checked);
    }
  }

  refresh(params: any): boolean {
    return false;
  }
}
