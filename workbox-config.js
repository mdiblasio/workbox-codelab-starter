const path = require('path');
module.exports = {
  swSrc: path.join('src', 'service-worker.js'),
  swDest: path.join('dist', 'service-worker.js'),
  globDirectory: './public/',
  globPatterns: [
    '*.{html,js,css}'
  ]
};
