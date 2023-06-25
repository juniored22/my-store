const hashModel = require('./hashModel');

class HashService {
    getHash(data) {
        return hashModel.createHash(data);
    }
    
    compare(data, hashValue) {
        return hashModel.compareHash(data, hashValue);
    }
}

module.exports = new HashService();
