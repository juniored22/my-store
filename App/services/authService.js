const users = [
    {
        username: 'admin',
        password: 'password123' // Em um ambiente real, nunca armazene senhas em texto simples
    }
];

const authenticate = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
};

module.exports = { authenticate };
