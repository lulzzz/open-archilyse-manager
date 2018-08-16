// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: `https://api.workplace.archilyse.com:444/api/v1`,
  // apiUrl: `http://localhost:444/api/v1`,
  firebase: {
    apiKey: '***REMOVED***',
    authDomain: 'archilyse-usermanagement.firebaseapp.com',
    databaseURL: 'https://archilyse-usermanagement.firebaseio.com',
    projectId: 'archilyse-usermanagement',
    storageBucket: 'archilyse-usermanagement.appspot.com',
    messagingSenderId: '***REMOVED***',
  },
};
