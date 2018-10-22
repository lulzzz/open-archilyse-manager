/**
 * Environment dependent variables, PRODUCTION
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

  /**
   * CHANGE THE VALUES BELOW
   */
  defaultUser: '',
  defaultPass: '',

  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    databaseURL: 'YOUR_DATABASE_URL',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  },

  mapboxToken: 'YOUR_MAPBOX_TOKEN',
};
