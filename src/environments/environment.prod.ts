export const environment = {
  production: true,

  apiUrl: 'https://api.archilyse.com/v0.1/',

  /** Development */
  urlConsole: 'https://console.archilyse.com/',
  urlEditor: 'https://editor.archilyse.com/',
  urlGeoreference: 'https://georeference.archilyse.com/',
  urlSimulationViewer: 'https://simulation.archilyse.com/',
  urlEditorFloorplan: 'https://floorplan.archilyse.com/',
  urlPortfolio: 'https://portfolio.archilyse.com/',

  defaultUser: '',
  defaultPass: '',

  firebase: {
    apiKey: '***REMOVED***',
    authDomain: 'archilyse-usermanagement.firebaseapp.com',
    databaseURL: 'https://archilyse-usermanagement.firebaseio.com',
    projectId: 'archilyse-usermanagement',
    storageBucket: 'archilyse-usermanagement.appspot.com',
    messagingSenderId: '***REMOVED***',
  },
};
