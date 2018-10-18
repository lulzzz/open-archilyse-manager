import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Layout } from '../../_models';
import { Store } from '@ngrx/store';
import * as fromStore from '../../_store';
import { slideInOut } from '../../_animations/slideInOut.animation';

/**
 * Sidebar to create a new Layout
 */
@Component({
  selector: 'create-layout',
  templateUrl: './create-layout.component.html',
  styleUrls: ['./create-layout.component.scss'],
  animations: [slideInOut],
})
export class CreateLayoutComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() layout: Layout;

  newLayoutForm: FormGroup;
  balance = null;

  constructor(
    private store: Store<fromStore.AppState>,
    private formBuilder: FormBuilder
  ) {
    this.newLayoutForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(2000)]],
    });
  }

  ngOnInit() {}

  private prepareSubmit(): any {
    const formData = new FormData();
    formData.append('title', this.newLayoutForm.get('title').value);
    formData.append('description', this.newLayoutForm.get('description').value);
    return formData;
  }

  submit() {
    const formData = this.prepareSubmit();
    const unit_id = this.layout.unit_id;

    console.log('CREATE LAYOUT', { unit_id, formData });
  }
}
