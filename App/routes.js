const express                   = require("express");
const validateToken             = require('./middlewares/validateToken');
const router                    = express.Router();
const { generateTokenHandler }  = require('./token/tokenController');
const { getProtectedData }      = require('./protected/protectedController');
const { getProtectedHomePage }  = require('./protected/protectedController');
const { page404 }               = require('./protected/protectedController');
const { faceRecognition }       = require('./protected/protectedController');
const { datasetImagesUser }     = require('./protected/protectedController');
const { uploadsImagesFaceRecognition } = require('./protected/protectedController');
const { uploadsImagesFaceRecognitionToTest } = require('./protected/protectedController');
const { sendLoginPage }         = require('./auth/authController');
const { handleLogout }          = require('./auth/authController');
const { getUsers }              = require('./user/userController');
const { creatHash }             = require('./hash/hashController');

const path                      = require('path');
const fs                        = require('fs');
const multer                    = require('multer');

// Configuração do multer para salvar arquivos no diretório 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const userName = file.originalname.split('.')[0]; // Supondo que o nome do usuário está no corpo da requisição
        const userDir = path.join(__dirname, 'uploads', userName);

        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname.split('.')[0]}.${Date.now()}.png`);
    }
});

const storageFaceTest = multer.diskStorage({
    destination: (req, file, cb) => {

        const userName = file.originalname.split('.')[0]; // Supondo que o nome do usuário está no corpo da requisição
        const userDir = path.join(__dirname, 'uploads', 'face-test', userName);

        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname.split('.')[0]}.${Date.now()}.png`);
    }
});

const upload = multer({ storage });
const uploadFaceTest = multer({ storage: storageFaceTest });

// Routes for serving static files
router.get('/', sendLoginPage);
router.get('/login', sendLoginPage);
router.all('/404', page404);

router.get('/face-recognition',validateToken,  faceRecognition);
router.get('/list-uploads', datasetImagesUser);
router.post('/upload', upload.array('faces', 31), uploadsImagesFaceRecognition);
router.post('/upload-test', uploadFaceTest.array('faces', 31), uploadsImagesFaceRecognitionToTest);

// Route to generate a token
router.post('/generate-token', generateTokenHandler);

// Protected route that requires a valid token
router.get('/protected', validateToken, getProtectedData);
router.get('/aplication', validateToken, getProtectedHomePage);
router.get('/middlepage', getProtectedHomePage);

// Route to handle logout, accepts any HTTP method
router.all('/logout', handleLogout);

router.get('/test', (req, res)=>{
    res.json({ success:true, error:false, message: 'This is a protected route' });
});

module.exports = router;
