const path = require('path');
const fs = require('fs');

module.exports = {
mode: 'development', // Adicione esta linha
  entry: './src/main.js',
  output: {
    filename: 'js/main-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: './dist',
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync('certs/localhost-key.pem'),
        cert: fs.readFileSync('certs/localhost.pem'),
      },
    },
    port: 1987,
  },
};
