const { generateToken } = require('./tokenService');
const { authenticate } = require('../auth/authService');

// Função para gerar e retornar um token JWT como um cookie HttpOnly
const generateTokenHandler = async (req, res) => {
    const { username, password } = req.body;

    if (!await authenticate(username, password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(req.body);

    // Definir cookie HttpOnly com o token, enviando apenas por HTTPS
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    });

    // Definir um cookie assinado (este é apenas um exemplo; você deve definir um valor significativo)
    res.cookie('name', 'value', { signed: true });

    res.json({ token });
};

// Exportar a função para uso em rotas do Express
module.exports = { generateTokenHandler };
