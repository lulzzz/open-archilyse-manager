/**
 * Environment dependent variables
 */
export const environment = {
  production: true,

  apiUrl: 'https://api.archilyse.com/v0.1/',
  apiPath: 'http://graphhopper.fission.prod.archilyse.com/route',

  /** Development */
  urlConsole: 'https://console.archilyse.com',
  urlEditor: 'https://portfolio.archilyse.com',
  urlGeoreference: 'https://portfolio.archilyse.com',
  urlPortfolio: 'https://portfolio.archilyse.com',

  urlSimulationViewer: 'https://simulation-viewer.archilyse.com',
  urlEditorFloorplan: 'https://floorplan.archilyse.com',

  defaultUser: '',
  defaultPass: '',

  firebase: {
    apiKey: '***SECRET***',
    authDomain: 'archilyse-usermanagement.firebaseapp.com',
    databaseURL: 'https://archilyse-usermanagement.firebaseio.com',
    projectId: 'archilyse-usermanagement',
    storageBucket: 'archilyse-usermanagement.appspot.com',
    messagingSenderId: '***SECRET***',
  },

  mapboxToken:
    '***SECRET***',
};
