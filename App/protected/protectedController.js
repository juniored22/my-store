
const path = require('path');
const fs   = require('fs');
const { log } = require('console');

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

const faceRecognition = (req, res) =>{
    res.sendFile(path.join(staticFilesDirectory, 'FaceRecognationFaceApi.html'));
}

const datasetImagesUser = (req, res) =>{
    const userFolder = 'EDGARD';
    const uploadDir = path.join(__dirname, '..', 'uploads', userFolder);

    // Check if the directory exists
    if (!fs.existsSync(uploadDir)) {
        console.error(`Directory does not exist: ${uploadDir}`);
        res.status(404).send('Directory does not exist');
        return;
    }

    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error(err, uploadDir);
            res.status(500).send('Erro ao listar arquivos');
            // res.status(200).send([]);
            return;
        }
        const fileUrls = files.map(file => `/uploads/${userFolder}/${file}`);
        res.json(fileUrls);
    });
}

const uploadsImagesFaceRecognition = async (req, res) =>{
    if (req.files) {
        console.log('Files received:', req.files);
        res.send('Faces uploaded successfully');
    } else {
        res.send('No files received');
    }
}

const uploadsImagesFaceRecognitionToTest = async (req, res) =>{
    if (req.files) {
        console.log('Files received:', req.files);
        res.send('Faces uploaded successfully');
    } else {
        res.send('No files received');
    }
}

module.exports = { 
    getProtectedData, 
    getProtectedHomePage, 
    page404, 
    faceRecognition, 
    datasetImagesUser, 
    uploadsImagesFaceRecognition, 
    uploadsImagesFaceRecognitionToTest 
};
