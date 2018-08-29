import { Component } from '@angular/core';
import {
  urlConsole,
  urlEditor,
  urlEditorFloorplan,
  urlGeoreference,
  urlSimulationViewer,
} from './manager/url';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  urlEditor = urlEditor;
  urlEditorFloorplan = urlEditorFloorplan;
  urlGeoreference = urlGeoreference;
  urlSimViewer = urlSimulationViewer;
  urlConsole = urlConsole;
}
