const { verifyToken } = require('../token/tokenService');

const validateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
        res.redirect('/404');
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    verifyToken(token, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        delete decoded.password; // Remove the password field from the decoded token
        req.decoded = decoded; // Store the decoded token in the request object
        next(); // Proceed to the next middleware
    });
};

module.exports = validateToken;

