const selfsigned = require('selfsigned');
const fs = require('fs');

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

fs.writeFileSync('localhost.pem', pems.cert);
fs.writeFileSync('localhost-key.pem', pems.private);
console.log('Certificates generated!');