const jwt = require('jsonwebtoken');

const secretKey = 'juniored';

const generateToken = (payload) => {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

const verifyToken = (token, callback) => {
    return jwt.verify(token, secretKey, callback);
};

module.exports = { generateToken, verifyToken };
