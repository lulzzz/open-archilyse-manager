import { read } from 'xlsx';
import { ManagerFunctions } from './managerFunctions';

export const exportOptions = {
  allColumns: true,
  columnGroups: true,
  columnSeparator: ';',
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
