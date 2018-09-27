import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromStore from '../../_store';
import { filter, take, tap } from 'rxjs/operators';
import { Layout } from '../../_models';
import { slideInOut } from '../../_animations/slideInOut.animation';

@Component({
  selector: 'edit-layout',
  templateUrl: './edit-layout.component.html',
  styleUrls: ['./edit-layout.component.scss'],
  animations: [slideInOut],
})
export class EditLayoutComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() layout: Layout;

  editLayoutForm: FormGroup;

  constructor(private store: Store<fromStore.AppState>, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.editLayoutForm = this.formBuilder.group({
      title: [this.layout.name, [Validators.required, Validators.maxLength(150)]],
      description: [this.layout.description, [Validators.maxLength(2000)]],
    });
  }

  submit() {
    const updatedLayout: Partial<Layout> = {
      name: this.editLayoutForm.value.name,
      description: this.editLayoutForm.value.description,
    };

    console.log('ADD LAYOUT', updatedLayout);
  }
}
