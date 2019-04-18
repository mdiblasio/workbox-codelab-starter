const express = require('express');
const fetch = require('node-fetch');
const VIEW_BASE = 'https://en.m.wikipedia.org/wiki/';

const app = express();

// route for service worker
app.get(/service-worker\.js/, function(request, response) {
  response.sendFile(__dirname + `/dist/service-worker.js`);
});

// route for wiki API requests
app.get('/api/wiki/:pageTitle', async (req, res, next) => {
  const pageTitle = req.params.pageTitle;

  const requestURL = new URL(VIEW_BASE + pageTitle);
  requestURL.searchParams.set('action', 'render');

  let response = await fetch(requestURL);
  let responseText = await response.text();

  // rewrite src links 
  responseText = responseText.replace(/src="\/\//g, 'src="https://');
  // add crossorigin attribute so SW can handle requests
  responseText = responseText.replace(/<img /g, '<img crossorigin="anonymous" ');

  res.send(responseText);
});

app.use(express.static('public'));

// return index file to all other navigation requests
app.get(/.*/, function(request, response) {
  if (request.get('Referrer') === undefined)
    response.sendFile(__dirname + `/public/index.html`);
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your server is running on port ' + listener.address().port);
});