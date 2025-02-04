const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Liste des tâches en mémoire
const tasks = [];

// Ajout de la clé API OpenWeather
const WEATHER_API_KEY = 'ee83d4690cb931471607b6d64d940226';

// Configuration MongoDB
const MONGO_URL = 'mongodb://localhost:27017';
const dbName = 'productDB';
let db;

// Connexion à MongoDB
async function connectToMongo() {
  try {
    const client = await MongoClient.connect(MONGO_URL);
    db = client.db(dbName);
    console.log('Connecté à MongoDB');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
  }
}

// Nouvelle méthode pour obtenir la météo
const getWeather = async (call, callback) => {
  try {
    const city = call.request.city;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    callback(null, {
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity
    });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: 'Erreur lors de la récupération de la météo'
    });
  }
};

// Implémentation des méthodes du service
const addTask = (call, callback) => {
  const task = call.request;
  tasks.push(task);
  callback(null, { message: 'Task added successfully!' });
};

const getTasks = (call, callback) => {
  callback(null, { tasks });
};

// Nouvelles méthodes pour la gestion des produits
const addProduct = async (call, callback) => {
  try {
    const product = call.request;
    const result = await db.collection('products').insertOne(product);
    callback(null, { 
      message: 'Produit ajouté avec succès',
      id: result.insertedId.toString()
    });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: `Erreur lors de l'ajout du produit: ${error.message}`
    });
  }
};

const getProducts = async (call, callback) => {
  try {
    const products = await db.collection('products').find({}).toArray();
    callback(null, { products });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: `Erreur lors de la récupération des produits: ${error.message}`
    });
  }
};

const updateProduct = async (call, callback) => {
  try {
    const { id, ...updateData } = call.request;
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    callback(null, { 
      message: result.modifiedCount > 0 ? 'Produit mis à jour' : 'Produit non trouvé'
    });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: `Erreur lors de la mise à jour du produit: ${error.message}`
    });
  }
};

const deleteProduct = async (call, callback) => {
  try {
    const { id } = call.request;
    const result = await db.collection('products').deleteOne(
      { _id: new ObjectId(id) }
    );
    callback(null, { 
      message: result.deletedCount > 0 ? 'Produit supprimé' : 'Produit non trouvé'
    });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: `Erreur lors de la suppression du produit: ${error.message}`
    });
  }
};

// Modification du démarrage du serveur
const server = new grpc.Server();
server.addService(todoProto.TodoService.service, { 
  addTask, 
  getTasks,
  getWeather,
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct
});

// Connexion à MongoDB avant de démarrer le serveur
connectToMongo().then(() => {
  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Erreur de liaison:', error);
        return;
      }
      console.log(`Serveur démarré sur http://0.0.0.0:${port}`);
      server.start();
    }
  );
});