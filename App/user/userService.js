const userModel = require('./userModel');

exports.getAllUsers = async()=>{
  try {
    const users = await userModel.getUsers();
    return users;
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    throw error;
  }
}

exports.getUserByEmail = async(email) => {
    try {
      const user = await userModel.getUsersByKey({key:'email',value:email});
      return user;
    } catch (error) {
      console.error('Erro ao obter o usuários:', error);
      throw error;
    }
}


