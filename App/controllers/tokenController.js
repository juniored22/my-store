const { generateToken } = require('../services/tokenService');
const { authenticate } = require('../services/authService');

const generateTokenHandler = (req, res) => {
    
    const { username, password } = req.body;

    if (!authenticate(username, password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = req.body;
    const token = generateToken(payload);
    res.json({ token });
};

module.exports = { generateTokenHandler };
