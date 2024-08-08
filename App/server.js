const express               = require("express");
const path                  = require('path');
const bodyParser            = require('body-parser');

const fs                    = require('fs');
const { exit }              = require('process');
const routes                = require('./routes');
const cookieParser          = require('cookie-parser');
const { connectToMongoDB }  = require('./db/mongodb');
const cors                  = require('cors');
const app                   = express();
const port                  = process.env.PORT || 3000;

connectToMongoDB()

app.use(cors());
app.use(cookieParser('your-secret-key'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Importar as rotas do arquivo separado
app.use('/', routes);


// Rota padrão para lidar com todas as outras rotas
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public','pages', '404.html'));
});

app.listen(port, () => console.log(`App listening on port ${port}!`));