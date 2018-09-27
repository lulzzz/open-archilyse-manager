import { Component, OnDestroy, OnInit } from '@angular/core';
import { DiagramService, EditorService, OverlayService } from '../_services';
import { Subscription } from 'rxjs/Subscription';
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;
const urlPortfolio = environment.urlPortfolio;

export function getLayoutLink(layoutId, layout?) {
  if (layoutId && layoutId !== '' && layoutId !== 'None') {
    let layoutName = layoutId;
    if (layout && layout.name && layout.name !== '') {
      layoutName = layout.name;
    }
    return `<a href="${urlPortfolio}/layout#layout_id=${layoutId}">${layoutName}</a>`;
  }
  return `"undefined"`;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, OnDestroy {
  loading;
  error = null;

  layoutId;

  modelStructure;

  elementBar = true;
  newOfficeDialog = false;

  project = {};

  subscriptionSidebar: Subscription;
  subscriptionLayout: Subscription;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private infoDialog: OverlayService,
    private editorService: EditorService,
    private diagramService: DiagramService
  ) {}

  showElementBar(event) {
    console.log('showElementBar ', event);
    this.diagramService.displayElementSidebarDisplayed(event);
  }

  override() {
    swal({
      title: `Are you sure?`,
      text: `This will override the previous layout?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, override it',
      customClass: 'arch',
    }).then(result => {
      if (result.value) {
        console.log('OVERRIDE!!');
        // TODO: Complete the overryde method.
      }
    });
  }

  saveAsNew() {
    this.diagramService.displayElementSidebarDisplayed(false);
    this.newOfficeDialog = true;
  }

  saveAsNewClose() {
    this.newOfficeDialog = false;
  }

  ngOnInit() {
    this.loading = true;
    this.layoutId = this.route.snapshot.params['layoutId'];

    this.subscriptionLayout = this.http.get(apiUrl + 'layouts/' + this.layoutId).subscribe(
      layout => {
        this.modelStructure = layout['model_structure'];
        this.loading = false;
      },
      error => {
        this.loading = false;
        this.error = `Layout ${getLayoutLink(this.layoutId)} not found.`;
        console.log('error', error);
      }
    );

    this.subscriptionSidebar = this.diagramService.isElementSidebarDisplayed$.subscribe(
      isVisible => {
        this.elementBar = isVisible;
      }
    );
  }

  /**
   * Import / Export functions
   */
  showInfoEditor() {
    this.infoDialog.open({
      data: {
        title: 'Editor instructions',
        body:
          'Click the elements of the editor to review or change its properties. <br/>' +
          'You can change the sidebar values or use the controls in the floorplan. <br/><br/>' +
          'To add new elements drag and drop the elements in the sidebar over the floorplan. <br/><br/>' +
          'Zoom in and out with the mouse wheel, navigate dragging with the right button of the mouse.',
        image: null,
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscriptionSidebar) {
      this.subscriptionSidebar.unsubscribe();
    }
    if (this.subscriptionLayout) {
      this.subscriptionLayout.unsubscribe();
    }
  }
}
