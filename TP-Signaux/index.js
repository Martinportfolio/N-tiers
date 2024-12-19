// Variable pour suivre si l'arrêt est autorisé
let canStop = true;

// Fonction générique pour gérer les signaux
async function handleSignal(signal) {
    if (!canStop) {
        console.log("Impossible d'arrêter le processus pour le moment.");
        return;
    }

    console.log(`Signal ${signal} reçu.`);
    console.log("Nettoyage en cours...");
    
    setTimeout(() => {
        console.log("Arrêt du processus.");
        process.exit(0);
    }, 5000);
}
  
  // Ecoute du signal SIGINT et SIGTERM
  process.on("SIGINT", () => handleSignal("SIGINT"));
  process.on("SIGTERM", () => handleSignal("SIGTERM"));
  
  // Simulation d'une application qui reste active
  console.log("Application en cours d'exécution.");
  console.log(
    "Appuyez sur CTRL+C pour envoyer un signal."
  );
  
  // Execute la fonction toutes les 5 secondes.
  setInterval(() => {
    canStop = !canStop;
    console.log(`Le processus est ${canStop ? 'arrêtable' : 'non arrêtable'} maintenant...`);
  }, 5000);