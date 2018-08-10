import { MatCheckboxComponent } from '../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../_shared-components/procent-renderer/procent-renderer.component';
import { CellRender } from './cellRender';

export class ColumnDefinitions {
  /**
   * Parameters
   */

  public static pagination = {
    pagination: true,
    paginationAutoPageSize: true,
  };

  public static columnOptions = {
    frameworkComponents: {
      checkboxRenderer: MatCheckboxComponent,
      procentRenderer: ProcentRendererComponent,
    },

    // rowHeight: 48, recommended row height for material design data grids,
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    rowSelection: 'multiple',
  };

  public static metaUserAndData = [
    {
      headerName: 'Log',
      children: [
        {
          headerName: 'User_id',
          field: 'user_id',
          width: 100,
          editable: false,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Created',
          field: 'created',
          width: 100,
          cellRenderer: CellRender.viewDate,
          editable: false,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Updated',
          field: 'updated',
          width: 100,
          cellRenderer: CellRender.viewDate,
          editable: false,
          cellClass: 'readOnly',
        },
      ],
    },
  ];

  public static progressProcents = [
    {
      headerName: 'Progress',
      field: 'progress',
      cellRenderer: 'procentRenderer',
      filter: 'agNumberColumnFilter',
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'Progress Layouts',
      field: 'progressLayout',
      cellRenderer: 'procentRenderer',
      filter: 'agNumberColumnFilter',
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
  ];

  public static progress = [
    {
      headerName: 'Delivered',
      field: 'delivered',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'Structured',
      field: 'structured',
      cellRenderer: 'checkboxRenderer',
      width: 110,
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'Digitized',
      field: 'digitized',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'Georeferenced',
      field: 'georeferenced',
      cellRenderer: 'checkboxRenderer',
      width: 140,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'Data Complete',
      field: 'data',
      cellRenderer: 'checkboxRenderer',
      width: 140,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'DPOI',
      field: 'DPOI',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'View & Sun',
      field: 'view',
      cellRenderer: 'checkboxRenderer',
      width: 120,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'Acoustics',
      field: 'acoustics',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'WBS',
      field: 'WBS',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'BasicFeatures',
      field: 'basicFeatures',
      cellRenderer: 'checkboxRenderer',
      width: 140,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
  ];

  public static getBuildingsUnitsLayouts(viewBuildings, viewUnits) {
    return [
      {
        headerName: 'Buildings',
        field: 'buildings',
        filter: 'agNumberColumnFilter',
        width: 100,
        cellRenderer: viewBuildings,
        editable: false,
        cellClass: 'readOnly',
      },
      {
        headerName: 'Units',
        field: 'units',
        filter: 'agNumberColumnFilter',
        width: 100,
        cellRenderer: viewUnits,
        editable: false,
        cellClass: 'readOnly',
      },
      {
        headerName: 'Layouts',
        field: 'layouts',
        filter: 'agNumberColumnFilter',
        width: 100,
        editable: false,
        cellClass: 'readOnly',
      },
    ];
  }
}
