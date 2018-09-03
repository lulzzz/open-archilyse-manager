import { Component } from '@angular/core';
import { environment } from '../environments/environment';
const urlEditor = environment.urlEditor;
const urlEditorFloorplan = environment.urlEditorFloorplan;
const urlGeoreference = environment.urlGeoreference;
const urlSimulationViewer = environment.urlSimulationViewer;
const urlConsole = environment.urlConsole;

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
