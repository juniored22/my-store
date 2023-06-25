const crypto = require('crypto');

class HashModel {
    createHash(data) {
        const hash = crypto.createHash('sha256');
        hash.update(data);
        return hash.digest('hex');
    }
    
    compareHash(data, hashValue) {
        const hash = this.createHash(data);
        return hash === hashValue;
    }
}

module.exports = new HashModel();
