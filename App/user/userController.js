const {getAllUsers} = require('./userService');

exports.getUsers = async (req, res)=>{
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao obter usuários' });
  }
}



