const express                   = require("express");
const validateToken             = require('./middlewares/validateToken');
const router                    = express.Router();
const { generateTokenHandler }  = require('./token/tokenController');
const { getProtectedData }      = require('./protected/protectedController');
const { getProtectedHomePage }  = require('./protected/protectedController');
const { page404 }               = require('./protected/protectedController');
const { sendLoginPage }         = require('./auth/authController');
const { handleLogout }          = require('./auth/authController');
const { getUsers }              = require('./user/userController');
const { creatHash }             = require('./hash/hashController');

// Routes for serving static files
router.get('/', sendLoginPage);
router.get('/login', sendLoginPage);
router.all('/404', page404);

// Route to generate a token
router.post('/generate-token', generateTokenHandler);

// Protected route that requires a valid token
router.get('/protected', validateToken, getProtectedData);
router.get('/aplication', validateToken, getProtectedHomePage);

// Route to handle logout, accepts any HTTP method
router.all('/logout', handleLogout);

router.get('/test', (req, res)=>{
    res.json({ success:true, error:false, message: 'This is a protected route' });
});

module.exports = router;
