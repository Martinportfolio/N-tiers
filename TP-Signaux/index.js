// Fonction générique pour gérer les signaux
async function handleSignal(signal) {
    console.log(`Signal ${signal} reçu.`);
    console.log("Nettoyage en cours...");
    
    // Attendre 5 secondes avant d'arrêter le processus
    setTimeout(() => {
        console.log("Arrêt du processus.");
        process.exit(0);
    }, 5000);
}
  
  // Ecoute du signal SIGINT.
  process.on("SIGINT", () => handleSignal("SIGINT"));
  
  // Simulation d'une application qui reste active
  console.log("Application en cours d'exécution.");
  console.log(
    "Appuyez sur CTRL+C pour envoyer un signal."
  );
  
  // Execute la fonction toutes les 5 secondes.
  setInterval(() => {
    console.log("Le processus est toujours actif...");
  }, 5000);
  