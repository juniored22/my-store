
const path = require('path');

// Definir o caminho do diretório de arquivos estáticos
const staticFilesDirectory = path.resolve(__dirname, '..', '..', 'public', 'pages');


const getProtectedData = (req, res) => {
    res.json({ message: 'This is a protected route', data: req.decoded });
};

const getProtectedHomePage = (req, res) =>{
    res.sendFile(path.join(staticFilesDirectory, 'index.html'));
}

const page404 = (req, res) =>{
    res.sendFile(path.join(staticFilesDirectory, '404.html'));
}

module.exports = { getProtectedData, getProtectedHomePage, page404 };
