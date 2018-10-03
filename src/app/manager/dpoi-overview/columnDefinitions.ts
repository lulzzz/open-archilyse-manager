import { CellRender } from '../cellRender';

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
