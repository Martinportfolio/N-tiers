const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Liste des tâches en mémoire
const tasks = [];

// Ajout de la clé API OpenWeather (à remplacer par votre clé)
const WEATHER_API_KEY = 'ee83d4690cb931471607b6d64d940226';

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

// Démarrage du serveur
const server = new grpc.Server();
server.addService(todoProto.TodoService.service, { 
  addTask, 
  getTasks,
  getWeather 
});
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running on http://0.0.0.0:50051');
  server.start();
});
