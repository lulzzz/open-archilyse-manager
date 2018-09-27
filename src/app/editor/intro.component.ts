import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { parseParms } from './url';
import { environment } from '../../environments/environment';

const urlPortfolio = environment.urlPortfolio;

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

  get layout() {
    return this.editorForm.get('layout');
  }

  start() {
    const layout = this.editorForm.get('layout').value;
    this._router.navigate(['editor', layout]);
  }

  portfolio() {
    location.assign(urlPortfolio);
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
