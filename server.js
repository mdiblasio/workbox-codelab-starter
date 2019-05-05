const express = require('express');
const fetch = require('node-fetch');
const API_BASE = "https://en.wikipedia.org/w/api.php";

const app = express();

// route for service worker
app.get(/service-worker\.js/, function(request, response) {
  response.sendFile(__dirname + `/dist/service-worker.js`);
});

// route for wiki API requests
app.get('/api/wiki/:pageTitle', async(req, res, next) => {
  const pageTitle = req.params.pageTitle;

  const requestURL = new URL(API_BASE);
  requestURL.searchParams.set('action', 'parse');
  requestURL.searchParams.set('format', 'json');
  requestURL.searchParams.set('page', pageTitle);
  requestURL.searchParams.set('origin', '*');

  let response = await fetch(requestURL);
  let responseText = await response.json();
  let responseArticle = responseText.parse.text['*'];

  // rewrite relative links
  responseArticle = responseArticle.replace(/src="\/\//g, 'src="https://');
  // add crossorigin attribute so SW can handle requests
  responseArticle = responseArticle.replace(/<img /g, '<img crossorigin="anonymous" ');

  res.send(responseArticle);
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