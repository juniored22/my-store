require('dotenv').config();
const { MongoClient } = require('mongodb');


console.log(process.env);
const uri = process.env.DATABASE_URL;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let db = null;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(uri, options);
    await client.connect();

    db = client.db('my-master-aplication');
    console.log('Conectado ao MongoDB Atlas');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB Atlas:', error);
  }
}

function getDB() {
  return db;
}

module.exports = {
  connectToMongoDB,
  getDB,
};
