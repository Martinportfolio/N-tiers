const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Création du client
const client = new todoProto.TodoService('localhost:50051', grpc.credentials.createInsecure());

// Récupérer la météo pour Béthune
client.GetWeather({ city: 'Bethune' }, (err, response) => {
  if (err) {
    console.error('Erreur:', err);
  } else {
    console.log('Météo à Béthune:');
    console.log(`Température: ${response.temperature}°C`);
    console.log(`Description: ${response.description}`);
    console.log(`Humidité: ${response.humidity}%`);
  }
});
