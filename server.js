const express = require('express');
const fetch = require('node-fetch');
const API_BASE = "https://en.wikipedia.org/api/rest_v1/page/mobile-sections";

const app = express();

// route for service worker
app.get(/service-worker\.js/, function(request, response) {
  response.sendFile(__dirname + `/src/service-worker.js`);
});

// route for wiki API requests
app.get('/api/wiki/:pageTitle', async(req, res, next) => {
  const pageTitle = req.params.pageTitle;

  const requestURL = new URL(`${API_BASE}/${pageTitle}`);

  let response = await fetch(requestURL, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    console.error('Issue with data being returned: ', response);
    res.send(`<h1>Search not valid!</h1>`);
    return;
  }

  let responseText = await response.json();
  let responseArticle = responseText.lead.sections[0].text;

  // parse response to HTML
  responseArticle += responseText.remaining.sections.map(section => `<h${section.toclevel}>${section.line}</h${section.toclevel}>` + section.text).reduce((a, b) => a + b);

  // open image links in new tab
  responseArticle = responseArticle.replace(/((?:href|src))="\/wiki\/(\S*(?:jpg|svg|png|jpeg|webp))"/ig, 'target="_blank" $1="https://en.wikipedia.org/wiki/$2"');

  // follow /article/ scheme
  responseArticle = responseArticle.replace(/href="\/wiki\//g, 'href="/article/');

  // add crossorigin attribute so SW can handle requests
  responseArticle = responseArticle.replace(/<img /g, '<img crossorigin="anonymous" ');

  res.send(responseArticle);
});

app.use(express.static('public'));

// return index file to all other navigation requests
app.get(/cached|settings|article/, function(request, response) {
  response.sendFile(__dirname + `/public/index.html`);
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your server is running on port ' + listener.address().port);
});