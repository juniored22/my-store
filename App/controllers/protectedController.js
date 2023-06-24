const getProtectedData = (req, res) => {
    res.json({ message: 'This is a protected route', data: req.decoded });
};

module.exports = { getProtectedData };
