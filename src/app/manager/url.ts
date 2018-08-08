export function parseParms(str) {
  const data = {};
  if (str) {
    const pieces = str.split('&');
    let i;
    let parts;

    // process each query pair
    for (i = 0; i < pieces.length; i += 1) {
      parts = pieces[i].split('=');
      if (parts.length < 2) {
        parts.push('');
      }
      data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
  }
  return data;
}

/** Development */
export const urlEditor = 'http://localhost:4201/editor';
export const urlGeoreference = 'http://localhost:4202/georeference';
export const urlPortfolio = 'http://localhost:4200/manager';

/** Production */
/**
 export const urlEditor = 'http://localhost:4201/editor';
 export const urlGeoreference = 'http://localhost:4202/georeference';
 export const urlPortfolio = 'http://localhost:4201/manager';
 */
