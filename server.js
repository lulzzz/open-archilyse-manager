const express = require('express');
const uaRedirect = require('express-ua-redirect');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS
const app = express();

app.use(express.static(__dirname + '/dist'));

app.use(uaRedirect({
  browsers: {
    authorized: {
      safari: '7+',
      IE: '9+'
    },
    evergreen: true
  },
  redirectTo: '/upgrade'
}));

if (process.env.NODE_ENV === 'production') {
  app.use(redirectToHTTPS());
}

app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html')
});

const port = process.env.PORT || 8000;
app.listen(port, function () {
  console.log("App is running on port " + port);
});
