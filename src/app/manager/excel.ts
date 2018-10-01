import { read } from 'xlsx';
import { ManagerFunctions } from './managerFunctions';

export const showInfoExcel = {
  data: {
    title: 'Excel instructions',
    body:
      'The proper structure for an excel to be imported should mirror the structure of the .csv exported. That means: <br/><ul>' +
      '<li>All the content is in the first Excel page.</li>' +
      '<li>First row is skipped, reserved for the group names.</li>' +
      '<li>Second row contains the name of the columns that we use to map the values into the API</li>' +
      '<li>Same elements that are read only in the Portfolio Manager would be skipped in the Excel.</li>' +
      '<li>Next rows contains the values of each element, if the ID of the site, building, ' +
      'unit or layout is set that would update the indicated element, when empty or column not set would add an element.</li>' +
      '</ul>',
    image: null,
  },
};

export const exportOptions = {
  allColumns: true,
  columnGroups: true,
  columnSeparator: ';',
  processCellCallback: params => {
    if (params.column && params.column.colId) {
      if (params.column.colId === 'floors') {
        if (params.value && params.value.length > 0) {
          return params.value.map(floor => floor.floor_nr + ' ' + floor.source).join(', ');
        } else {
          return '';
        }
      } else if (params.column.colId === 'model_structure') {
        if (params.value) {
          return 'DIGITALIZED';
        } else {
          return '';
        }
      } else if (
        params.column.colId === 'total_area' ||
        params.column.colId === 'room' ||
        params.column.colId === 'corridor' ||
        params.column.colId === 'bathroom' ||
        params.column.colId === 'kitchen' ||
        params.column.colId === 'balcony' ||
        params.column.colId === 'storeroom' ||
        params.column.colId === 'notDefined'
      ) {
        if (params.value && params.value.length > 0) {
          return params.value.map(val => val.toFixed(2)).join(', ');
        } else {
          return '';
        }
      } else if (params.column.colId === 'movements') {
        if (params.value && params.value.length > 0) {
          return params.value.map(movement => movement.source).join(', ');
        } else {
          return '';
        }
      } else {
        console.log(params.column.colId);
      }
    }
    return params.value;
  },
};

export const exportSelectedOptions = {
  ...exportOptions,
  onlySelected: true,
};

// read the raw data and convert it to a XLSX workbook
export function convertFileToWorkbook(file, onComplete) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = e.target['result'];

    /* if binary string, read with type 'binary' */
    const workbook = read(data, { type: 'binary' });

    onComplete(workbook);
  };
  reader.readAsBinaryString(file);
}

// pull out the values we're after, converting it into an array of rowData

export function getRows(workbook, dictionary) {
  // our data is in the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // we expect the following columns to be present
  const columns = {};

  let charCode = 65; // "A"
  const charCodeEnd = 90; // "Z"

  let cell = worksheet[String.fromCharCode(charCode) + 2];
  while (cell && cell.w && charCode <= charCodeEnd) {
    // Only if it's in the dictionary
    if (dictionary[cell.w]) {
      columns[String.fromCharCode(charCode)] = cell.w;
    }
    charCode += 1;
    cell = worksheet[String.fromCharCode(charCode) + 2];
  }

  const rowData = [];

  // start at the 3rd row - the first row are the Group headers, 2nd the headers
  let rowIndex = 3;

  // iterate over the worksheet pulling out the columns we're expecting
  while (worksheet['A' + rowIndex] || worksheet['B' + rowIndex] || worksheet['C' + rowIndex]) {
    const row = {};
    Object.keys(columns).forEach(column => {
      const varName = dictionary[columns[column]];

      const cell = worksheet[column + rowIndex];
      ManagerFunctions.changeValueByColumnStr(row, varName, cell && cell.w ? cell.w : '');
    });

    rowData.push(row);

    rowIndex += 1;
  }

  return rowData;
}
