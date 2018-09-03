// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  apiUrl: 'https://api.archilyse.com/v0.1/',

  /** Development */
  urlConsole: 'http://console.archilyse.com/',
  urlEditor: 'http://localhost:4201/editor',
  urlGeoreference: 'http://localhost:4202/georeference',
  urlSimulationViewer: 'http://localhost:4203/simulations',
  urlEditorFloorplan: 'http://localhost:4204/editor',
  urlPortfolio: 'http://localhost:4200/manager',

  firebase: {
    apiKey: '***REMOVED***',
    authDomain: 'archilyse-usermanagement.firebaseapp.com',
    databaseURL: 'https://archilyse-usermanagement.firebaseio.com',
    projectId: 'archilyse-usermanagement',
    storageBucket: 'archilyse-usermanagement.appspot.com',
    messagingSenderId: '***REMOVED***',
  },
};
