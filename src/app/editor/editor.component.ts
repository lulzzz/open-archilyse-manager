import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  DiagramService,
  EditorService,
  NavigationService,
  OverlayService,
} from '../_services';
import { Subscription } from 'rxjs/Subscription';
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { getLayoutLink } from '../_shared-libraries/PortfolioLinks';
import { ApiFunctions } from '../_shared-libraries/ApiFunctions';
import { ToastrService } from 'ngx-toastr';

/**
 *  Main component for the Editor tool
 */
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, OnDestroy {
  /** True to start and false once all the data is loaded */
  loading;

  /** String container of any error */
  error = null;

  /** Identifier of the current layout */
  layoutId;
  /** Current layout data */
  layout;

  /** Model structure for the current layout */
  modelStructure;

  /** Control to display the elements sidebar */
  elementBar = true;
  /** Control to display the new layout dialog */
  newOfficeDialog = false;

  project = {};

  subscriptionSidebar: Subscription;
  subscriptionLayout: Subscription;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private infoDialog: OverlayService,
    private editorService: EditorService,
    private diagramService: DiagramService,
    private toastr: ToastrService
  ) {}

  showElementBar(event) {
    console.log('showElementBar ', event);
    this.diagramService.displayElementSidebarDisplayed(event);
  }

  /**
   * Override the current layout model structure warning, and after confirmation saves
   */
  override() {
    swal({
      title: `Are you sure?`,
      text: `This will override the previous layout?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, override it',
      customClass: 'arch',
    }).then(result => {
      if (result.value) {
        console.log('OVERRIDE!!', this.layout);
        ApiFunctions.patch(
          this.http,
          'layouts/' + this.layout.layout_id,
          {
            model_structure: this.layout.model_structure,
          },
          element => {
            console.log('Element ', element);
            this.toastr.success('Layout updated successfully');
          },
          error => {
            this.error = `Error saving the layout.`;
            console.error(error);
          }
        );
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

    this.subscriptionLayout = ApiFunctions.get(
      this.http,
      'layouts/' + this.layoutId,
      layout => {
        this.layout = layout;
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

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.subscriptionSidebar) {
      this.subscriptionSidebar.unsubscribe();
    }
    if (this.subscriptionLayout) {
      this.subscriptionLayout.unsubscribe();
    }
  }
}
