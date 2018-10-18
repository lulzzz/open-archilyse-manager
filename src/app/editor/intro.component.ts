import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../environments/environment';
import { parseParms } from '../_shared-libraries/Url';

/**
 * Start page for the editor.
 * Here the user can provide a Layout Id to edit
 */
@Component({
  selector: 'app-intro-editor',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroEditorComponent implements OnInit, OnDestroy {
  fragment_sub: Subscription;

  constructor(private _router: Router, private route: ActivatedRoute) {}

  editorForm = new FormGroup({
    layout: new FormControl('', Validators.required),
  });

  ngOnInit() {
    this.fragment_sub = this.route.fragment.subscribe(fragment => {
      const urlParams = parseParms(fragment);
      if (urlParams.hasOwnProperty('layout')) {
        this.layout.setValue(urlParams['layout']);
      }
    });
  }

  /** form layout getter */
  get layout() {
    return this.editorForm.get('layout');
  }

  /** Link to the specified layout */
  start() {
    const layout = this.editorForm.get('layout').value;
    this._router.navigate(['editor', layout]);
  }

  /** Link to the portfolio */
  portfolio() {
    location.assign(environment.urlPortfolio);
  }

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
