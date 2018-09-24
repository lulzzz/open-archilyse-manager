const express = require('express');
const app = express();

app.use(express.static(__dirname + '/dist/arch-site'));

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.get('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/dist/arch-site/index.html');
});

const port = process.env.PORT || 8000;
app.listen(port, function() {
  console.log('App is running on port ' + port);
});
