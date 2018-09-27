import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewChildren,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Unit } from '../../_models';
import { Store } from '@ngrx/store';
import * as fromStore from '../../_store';
import { filter, take, first } from 'rxjs/operators';
import { slideInOut } from '../../_animations/slideInOut.animation';
import { OverlayService } from '../../_services/overlay.service';

@Component({
  selector: 'create-layout',
  templateUrl: './create-layout.component.html',
  styleUrls: ['./create-layout.component.scss'],
  animations: [slideInOut],
})
export class CreateLayoutComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  @Input() unit: Unit;
  @Input() fromEditor: Boolean;

  @ViewChildren('upload') upload;
  @ViewChildren('uploadplaceholder') uploadplaceholder;
  @ViewChild('toggle') toggle;

  newLayoutForm: FormGroup;
  status$;
  useArchilogicId = false;
  balance = null;

  submitSubscription;

  regex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

  constructor(
    private store: Store<fromStore.AppState>,
    private formBuilder: FormBuilder,
    private infoDialog: OverlayService
  ) {
    this.newLayoutForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(2000)]],
      archilogic_id: [''],
      floorplan_url: ['', [Validators.required]],
      floorplan: null,
    });
  }

  ngOnInit() {}

  toggleFileUpload(event) {
    if (this.balance === 0) {
      // this.infoDialog.open({
      //   data: {
      //     title: 'Insufficient Credits',
      //     body: `You have no credits left to digitise a floorplan - please contact us to add more credits.

      //     Analysis from an Archilogic ID is free.`,
      //   },
      // });

      this.useArchilogicId = true;
      this.toggle.toggle();

      return;
    }
    this.useArchilogicId = event.checked;

    if (this.useArchilogicId) {
      this.newLayoutForm.get('floorplan').setValue(null);
      this.newLayoutForm.get('floorplan_url').setValue('');
      this.newLayoutForm.get('floorplan_url').setValidators([]);
      this.newLayoutForm.get('floorplan_url').updateValueAndValidity();

      this.newLayoutForm
        .get('archilogic_id')
        .setValidators([Validators.required, Validators.pattern(this.regex)]);
      this.newLayoutForm.get('archilogic_id').updateValueAndValidity();
    } else {
      this.newLayoutForm.get('floorplan_url').setValidators([Validators.required]);
      this.newLayoutForm.get('floorplan_url').updateValueAndValidity();

      this.newLayoutForm.get('archilogic_id').setValue('');
      this.newLayoutForm.get('archilogic_id').setValidators([]);
      this.newLayoutForm.get('archilogic_id').updateValueAndValidity();
    }
  }

  triggerFileMenu() {
    this.uploadplaceholder.first.nativeElement.blur();
    this.upload.first.nativeElement.click();
  }

  onIdChange(event) {
    let value = event.target.value;
    if (value.length < 36) {
      return;
    }
    const regexResult = this.regex.exec(event.target.value);
    value = regexResult ? regexResult[0] : value;

    this.newLayoutForm.get('archilogic_id').setValue(value);
    this.newLayoutForm.get('archilogic_id').updateValueAndValidity();
  }

  onFileChange($event): void {
    if ($event.target.files.length > 0) {
      const file = $event.target.files[0];
      // const reader = new FileReader();
      // Encode to Base64
      // reader.readAsDataURL(file);
      // reader.onload = () => {
      //   console.log(reader.result);
      //   this.newLayoutForm.get('floorplan').setValue({
      //     filename: file.name,
      //     filetype: file.type,
      //     value: reader.result.split(',')[1],
      //   });
      // };

      this.newLayoutForm.get('floorplan').setValue(file);
      this.newLayoutForm.get('floorplan_url').setValue(file.name);
    }
    this.uploadplaceholder.first.nativeElement.blur();
  }

  private prepareSubmit(): any {
    const formData = new FormData();
    formData.append('title', this.newLayoutForm.get('title').value);
    formData.append('description', this.newLayoutForm.get('description').value);
    if (this.useArchilogicId) {
      formData.append('archilogic_id', this.newLayoutForm.get('archilogic_id').value);
    } else {
      formData.append('floorplan', this.newLayoutForm.get('floorplan').value);
    }
    formData.append('status', 'Submitted');
    return formData;
  }

  submit() {
    const formData = this.prepareSubmit();
    const fileUpload = !this.useArchilogicId;
    const unit_id = this.unit.unit_id;

    console.log('CREATE LAYOUT', { unit_id, formData, fileUpload });
  }
}
