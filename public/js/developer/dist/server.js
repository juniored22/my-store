const express = require('express');
const https = require('https');
const fs = require('fs');
const selfsigned = require('selfsigned');

const app = express();
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

fs.writeFileSync('localhost.pem', pems.cert);
fs.writeFileSync('localhost-key.pem', pems.private);

const options = {
  key: fs.readFileSync('localhost-key.pem'),
  cert: fs.readFileSync('localhost.pem')
};

app.use(express.static('public'));

https.createServer(options, app).listen(8080, () => {
  console.log('HTTPS Server running on https://localhost:8080');
});