const userModel = require('./userModel');

async function getAllUsers() {
  try {
    const users = await userModel.getUsers();
    return users;
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    throw error;
  }
}

async function getUserByEmail(email) {
    try {
      const user = await userModel.getUsersByKey({key:'email',value:email});
      return user;
    } catch (error) {
      console.error('Erro ao obter o usuários:', error);
      throw error;
    }
}

module.exports = {
    getAllUsers,
    getUserByEmail
};
