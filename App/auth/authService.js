const {getUserByEmail} = require('../user/userService');
const {compareHash} = require('../hash/hashController');

const authenticate = async (username, password) => {
    const user = await getUserByEmail(username);
    const checkHash = compareHash(password, user?.password);
    return checkHash.same;
};

module.exports = { authenticate };
