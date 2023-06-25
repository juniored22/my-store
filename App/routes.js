const express = require("express");
const validateToken = require('./middlewares/validateToken');
const { generateTokenHandler } = require('./token/tokenController');
const { getProtectedData, getProtectedHomePage, page404 } = require('./protected/protectedController');
const { sendLoginPage, handleLogout } = require('./auth/authController');
const {getUsers}  = require('./user/userController');
const router = express.Router();
const {creatHash} = require('./hash/hashController');

// Routes for serving static files
router.get('/', sendLoginPage);
router.get('/login', sendLoginPage);
router.all('/404', page404);

// Route to generate a token
router.post('/generate-token', generateTokenHandler);

// Protected route that requires a valid token
router.get('/protected', validateToken, getProtectedData);
router.get('/home', validateToken, getProtectedHomePage);

// Route to handle logout, accepts any HTTP method
router.all('/logout', handleLogout);

router.get('/test', page404);

module.exports = router;
