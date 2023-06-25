const path = require('path');

// Definir o caminho do diretório de arquivos estáticos
const staticFilesDirectory = path.resolve(__dirname, '..', '..', 'public', 'pages');

exports.sendLoginPage = (req, res) => {
    res.sendFile(path.join(staticFilesDirectory, 'login.html'));
};

// Function to handle user logout
exports.handleLogout = (req, res) => {
    // Clear the signed cookie
    res.clearCookie('name', { signed: true });

    // Optionally, clear the token cookie if using one
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });

    // Redirect to home page
    res.redirect('/');
};
