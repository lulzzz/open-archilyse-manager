import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular/main";

@Component({
  selector: "checkbox-cell",
  template: `<mat-checkbox [checked]="checked" [disabled]="!editable" (change)="onChange($event)"></mat-checkbox>`,
  styles: [
    `
      ::ng-deep
      .mat-checkbox-layout {
        /* horizontally align the checkbox */
        width: 100%;
        display: inline-block !important;
        text-align: center;
        margin-top: -4px; /* to offset the cells internal padding - could be done in cells CSS instead*/
      }
    `
  ]
})
export class MatCheckboxComponent implements ICellRendererAngularComp {
  private params: any;

  checked: boolean = false;
  editable: boolean = true;

  agInit(params: any): void {
    this.params = params;

    if (this.params.editable === true ||
        this.params.editable === false ){
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
