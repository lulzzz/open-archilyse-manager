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
