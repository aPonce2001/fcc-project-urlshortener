require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require('node:dns');

const urls = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));



app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post(
  '/api/shorturl',
  (req, res, next) => {
    const fullUrl = req.body.url;
    if (!fullUrl || !fullUrl.startsWith("http")){
      return res.json({ error: 'invalid url' });
    }
    try {
      const _objectUrl = new URL('', fullUrl);
      next();
    } catch (e) {
      return res.json({ error: 'invalid url' });
    }
  },
  (req, res) => {
    const fullUrl = req.body.url;
    urls.push(fullUrl);
    res.json({
      original_url: fullUrl,
      short_url: urls.length
    });
  }
);

app.get('/api/shorturl/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;

  if (!shortUrl || shortUrl < 1 || !Number(shortUrl)) {
    res.json({
      error: 'Wrong format'
    });
    return;
  }

  const shortUrlPublic = shortUrl - 1;

  const fullUrl = urls[shortUrlPublic];

  if (!fullUrl) {
    res.json({
      error: 'No short URL found for the given input'
    });
    return;
  }

  res.redirect(fullUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
