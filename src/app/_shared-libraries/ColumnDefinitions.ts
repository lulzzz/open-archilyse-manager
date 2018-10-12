import { MatCheckboxComponent } from '../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../_shared-components/procent-renderer/procent-renderer.component';
import { CellRender } from './CellRender';
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

function getColumnDefsCommon(distance, duration, score, nameColumns) {
  return [
    {
      headerName: 'Simulation',
      children: [
        {
          headerName: 'Category',
          field: 'category',
          width: 190,
          cellRenderer: CellRender.dpoiCategory,
          editable: false,
          cellClass: 'readOnly',

          // By default sorted by descending
          sort: 'desc',
        },
        {
          headerName: 'Name',
          field: 'name',
          width: 190,
          cellRenderer: CellRender.dpoiName,
          editable: false,
          cellClass: 'readOnly',
        },
        ...nameColumns,
      ],
    },
    {
      headerName: 'Foot',
      children: [
        {
          headerName: 'Score',
          field: 'foot.score',
          filter: 'agNumberColumnFilter',
          width: 100,
          cellRenderer: score,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Distance',
          field: 'foot.distance',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          width: 110,
          cellRenderer: distance,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Duration',
          field: 'foot.duration',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          width: 110,
          cellRenderer: duration,
          editable: false,
          cellClass: 'right readOnly',
        },
      ],
    },
    {
      headerName: 'Bike',
      children: [
        {
          headerName: 'Score',
          field: 'bike.score',
          filter: 'agNumberColumnFilter',
          width: 100,
          cellRenderer: score,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Distance',
          field: 'bike.distance',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          width: 110,
          cellRenderer: distance,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Duration',
          field: 'bike.duration',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          width: 110,
          cellRenderer: duration,
          editable: false,
          cellClass: 'right readOnly',
        },
      ],
    },
    {
      headerName: 'Car',
      children: [
        {
          headerName: 'Score',
          field: 'car.score',
          filter: 'agNumberColumnFilter',
          width: 100,
          cellRenderer: score,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Distance',
          field: 'car.distance',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          width: 110,
          cellRenderer: distance,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Duration',
          field: 'car.duration',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          width: 110,
          cellRenderer: duration,
          editable: false,
          cellClass: 'right readOnly',
        },
      ],
    },
    {
      headerName: 'Straight',
      children: [
        {
          headerName: 'Distance',
          field: 'flight.distance',
          filter: 'agNumberColumnFilter',
          width: 90,
          cellRenderer: distance,
          editable: false,
          cellClass: 'right readOnly',
        },
      ],
    },
  ];
}

export const columnDefsCompare = [
  ...getColumnDefsCommon(
    CellRender.distanceCompare,
    CellRender.durationCompare,
    CellRender.scoreCompare,
    [
      {
        headerName: 'Place name',
        field: 'place_name',
        columnGroupShow: 'open',
        width: 190,
        editable: false,
        cellClass: 'readOnly',
      },
      {
        headerName: 'Place name compare',
        field: 'place_name_compare',
        columnGroupShow: 'open',
        width: 190,
        editable: false,
        cellClass: 'readOnly',
      },
    ]
  ),
];

export const columnDefs = [
  ...getColumnDefsCommon(CellRender.distance, CellRender.duration, CellRender.score, [
    {
      headerName: 'Place name',
      field: 'place_name',
      width: 190,
      editable: false,
      cellClass: 'readOnly',
    },
  ]),
  {
    headerName: 'Coordinates',
    children: [
      {
        headerName: 'Latitude',
        field: 'latitude',
        columnGroupShow: 'open',
        width: 150,
        cellRenderer: CellRender.latLan,
        editable: false,
        cellClass: 'right readOnly',
      },
      {
        headerName: 'Longitude',
        field: 'longitude',
        columnGroupShow: 'open',
        width: 150,
        cellRenderer: CellRender.latLan,
        editable: false,
        cellClass: 'right readOnly',
      },
      /**
       {
        headerName: 'Link',
        width: 150,
        cellRenderer: CellRender.viewLatLan,
        editable: false,
        cellClass: 'right readOnly',
      },
       */
    ],
  },
];
