const express = require("express");
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());
// Importar as rotas do arquivo separado
app.use('/', routes);

app.listen(port, () => console.log(`HelloNode app listening on port ${port}!`));