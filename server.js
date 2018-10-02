const express = require('express');
const uaRedirect = require('express-ua-redirect');
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


console.log("Environment");
console.log(process.env.NODE_ENV);
console.log("Environment END");

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.get('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html')
});

const port = process.env.PORT || 8000;
app.listen(port, function () {
  console.log("App is running on port " + port);
});
