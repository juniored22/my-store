const hashService = require('./hashService');

exports.creatHash = (password) => {
    const data = password;
    const hash = hashService.getHash(data);
    return { hash: hash };
};

exports.compareHash =  (password, hashValue) => {
    const data = password;
    const isSame = hashService.compare(data, hashValue);
    return { same: isSame };
};

