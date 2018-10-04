import { MatCheckboxComponent } from '../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../_shared-components/procent-renderer/procent-renderer.component';
import { CellRender } from './cellRender';
import { BuildingSimulationRendererComponent } from '../_shared-components/building-simulation-renderer/building-simulation-renderer.component';
import { BuildingSimulationRendererDpoiComponent } from '../_shared-components/building-simulation-dpoi-renderer/building-simulation-dpoi-renderer.component';
import { LayoutSimulationRendererComponent } from '../_shared-components/layout-simulation-renderer/layout-simulation-renderer.component';
import { LinkRendererComponent } from '../_shared-components/link-renderer/link-renderer.component';
import { GeoreferenceRendererComponent } from '../_shared-components/georeference-renderer/georeference-renderer.component';

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
      simulationLayoutRenderer: LayoutSimulationRendererComponent,
      simulationBuildingRenderer: BuildingSimulationRendererComponent,
      simulationBuildingDpoiRenderer: BuildingSimulationRendererDpoiComponent,
      linkRenderer: LinkRendererComponent,
      georeferenceRenderer: GeoreferenceRendererComponent,
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
      headerTooltip: 'Control values',
      children: [
        {
          headerName: 'Updated',
          field: 'updated',
          headerTooltip: 'Time when the last value was changed',
          width: 90,
          cellRenderer: CellRender.viewDate,
          editable: false,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Created',
          columnGroupShow: 'open',
          headerTooltip: 'Time when the element was created',
          field: 'created',
          width: 90,
          cellRenderer: CellRender.viewDate,
          editable: false,
          cellClass: 'readOnly',
        },
        {
          headerName: 'User Id',
          columnGroupShow: 'open',
          headerTooltip: 'User that changed the last value',
          field: 'user_id',
          width: 280,
          editable: false,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Organization Id',
          columnGroupShow: 'open',
          headerTooltip: 'Organization from the user that changed the last value',
          field: 'org_id',
          width: 250,
          editable: false,
          cellClass: 'readOnly',
        },
      ],
    },
  ];

  public static progressProcents = [
    {
      headerName: 'Buildings',
      field: 'progress',
      headerTooltip: 'Procent of georeferenced buildings',
      cellRenderer: 'procentRenderer',
      filter: 'agNumberColumnFilter',
      cellRendererParams: { editable: false },
      cellStyle: { padding: '0px' },
      cellClass: 'readOnly',
    },
    {
      headerName: 'Layouts',
      field: 'progressLayout',
      headerTooltip: 'Procent of georeferenced layouts',
      cellRenderer: 'procentRenderer',
      filter: 'agNumberColumnFilter',
      cellRendererParams: { editable: false },
      cellStyle: { padding: '0px' },
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
      columnGroupShow: 'open',
      cellRenderer: 'checkboxRenderer',
      width: 110,
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'Digitized',
      field: 'digitized',
      columnGroupShow: 'open',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: true },
    },
  ];

  public static progressSimsBuilding = [
    {
      headerName: 'Potential view',
      field: 'simBuildings.potential_view',
      cellRenderer: 'checkboxRenderer',
      width: 140,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'Acoustics',
      field: 'simBuildings.acoustics',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'DPOI',
      field: 'simBuildings.dpoi',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
  ];

  public static progressSimsLayout = [
    {
      headerName: 'View',
      field: 'simLayouts.view',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'Wbs',
      field: 'simLayouts.wbs',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'Pathways',
      field: 'simLayouts.pathways',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'Basic features',
      field: 'simLayouts.basic_features',
      cellRenderer: 'checkboxRenderer',
      width: 130,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
    {
      headerName: 'Accoustics',
      field: 'simLayouts.accoustics',
      cellRenderer: 'checkboxRenderer',
      width: 110,
      cellRendererParams: { editable: false },
      cellClass: 'readOnly',
    },
  ];

  public static getBuildingsUnitsLayouts(
    viewBuildings,
    viewBuildingsParams,
    viewUnits,
    viewUnitsParams
  ) {
    return [
      {
        headerName: 'Buildings',
        field: 'buildings',
        headerTooltip: 'Total number of buildings assigned',
        filter: 'agNumberColumnFilter',
        width: 100,
        cellRenderer: viewBuildings,
        cellRendererParams: viewBuildingsParams,
        editable: false,
        cellClass: 'readOnly',
      },
      {
        headerName: 'Units',
        field: 'units',
        columnGroupShow: 'open',
        headerTooltip: 'Total number of units assigned',
        filter: 'agNumberColumnFilter',
        width: 100,
        cellRenderer: viewUnits,
        cellRendererParams: viewUnitsParams,
        editable: false,
        cellClass: 'readOnly',
      },
      {
        headerName: 'Layouts',
        field: 'layouts',
        columnGroupShow: 'open',
        headerTooltip: 'Total number of layouts assigned',
        filter: 'agNumberColumnFilter',
        width: 100,
        editable: false,
        cellClass: 'readOnly',
      },
    ];
  }
}
