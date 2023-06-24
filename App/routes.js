const express = require("express");
const path = require('path');
const validateToken = require('./middlewares/validateToken');
const { generateTokenHandler } = require('./controllers/tokenController');
const { getProtectedData } = require('./controllers/protectedController');

const router = express.Router();

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'login.html'));
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'login.html'));
});

// Rota para gerar um token
router.post('/generate-token', generateTokenHandler);

// Rota protegida que requer um token válido
router.get('/protected', validateToken, getProtectedData);
  
// router.get(["/", "/:name"], (req, res) => {
//     const greeting = "<h1>Hello From Node on Fly test!</h1>";
//     const name = req.params["name"];
//     if (name) {
//       res.send(greeting + "</br>and hello to " + name);
//     } else {
//       res.send(greeting);
//     }
// });
  
module.exports = router;