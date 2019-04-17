const express = require('express');
const fetch = require('node-fetch');
const VIEW_BASE = 'https://en.m.wikipedia.org/wiki/';

const app = express();

// index route
app.get('/', function(request, response) {
  response.sendFile(__dirname + `/public/index.html`);
});

// route for service worker
app.get(/sw\.js/, function(request, response) {
  response.sendFile(__dirname + `/src/sw.js`);
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

const listener = app.listen(process.env.PORT, function() {
  console.log('Your server is running on port ' + listener.address().port);
});