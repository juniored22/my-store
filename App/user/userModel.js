const { getDB } = require('../db/mongodb');

function getUsers() {
  const db = getDB();
  return db.collection('users').find().toArray();
}

function getUsersByKey({key,value}) {
    const db = getDB();
    return db.collection('users').findOne({ [key]: value });
}

module.exports = {
  getUsers,
  getUsersByKey
};
