const net = require("net");

// Port de la socket pour le serveur
const PORT = 5001;

// Création du serveur, la socket ouverte par le client est en paramètre.
const server = net.createServer((socket) => {
  console.log("--- Client connecté.");
  // Écouter les requêtes RPC du client
  socket.on("data", (data) => {

    // recois la requete
    const request = JSON.parse(data.toString());
    console.log("Requête reçue:", request);
      // si dans la requete il y a echo et renvoi le text sinon il envoi erreur
    if (request.request === "echo") {
      const response = {
        status: "success",
        result: request.params.text
      };
      socket.write(JSON.stringify(response));
    } else {
      const response = {
        status: "error",
        message: "Requête non reconnue"
      };
      socket.write(JSON.stringify(response));
    }

  });
  socket.on("end", () => {
    console.log("--- Client déconnecté.");
  });
});

// Démarre le serveur sur le port 5001
server.listen(PORT, () => {
  console.log(`Serveur RPC en écoute sur le port ${PORT}`);
});
