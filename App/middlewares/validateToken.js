const { verifyToken } = require('../services/tokenService');

const validateToken = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    
    if (!authorizationHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authorizationHeader.split(' ')[1];

    verifyToken(token, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        
        req.decoded = decoded;
        next();
    });
};

module.exports = validateToken;
