const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Création du client
const client = new todoProto.TodoService('localhost:50051', grpc.credentials.createInsecure());

// Ajouter une tâche
client.AddTask({ id: '1', description: 'Learn gRPC' }, (err, response) => {
  if (err) console.error(err);
  else console.log(response.message);

  // Récupérer les tâches
  client.GetTasks({}, (err, response) => {
    if (err) console.error(err);
    else console.log('Tasks:', response.tasks);
  });
});
