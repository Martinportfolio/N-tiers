const net = require('net');

class IRCServer {
    constructor(port = 6667) {
        this.port = port;
        this.clients = new Map(); // Map pour stocker {socket: pseudo}
    }

    start() {
        const server = net.createServer((socket) => {
            console.log('Nouveau client connecté');
            
            // Demander le pseudo
            socket.write('Entrez votre pseudo: ');
            
            // État initial du client
            socket.pseudoSet = false;
            socket.buffer = ''; // Buffer pour accumuler les données

            socket.on('data', (data) => {
                // Ajouter les nouvelles données au buffer
                socket.buffer += data.toString();

                // Vérifier si nous avons une ligne complète (terminée par \n ou \r\n)
                let lines = socket.buffer.split(/\r?\n/);
                
                // S'il n'y a pas de ligne complète, on attend plus de données
                if (lines.length === 1) return;

                // Traiter toutes les lignes complètes
                socket.buffer = lines.pop(); // Garder la dernière ligne incomplète dans le buffer
                
                lines.forEach(line => {
                    if (line.trim() === '') return; // Ignorer les lignes vides

                    if (!socket.pseudoSet) {
                        const pseudo = line.trim();
                        if (pseudo) {
                            this.clients.set(socket, pseudo);
                            socket.pseudoSet = true;
                            
                            // Message de bienvenue
                            this.sendToClient(socket, `Bienvenue ${pseudo}!\n`);
                            
                            // Informer les autres utilisateurs
                            this.broadcast(`${pseudo} a rejoint le chat\n`, socket);
                        }
                    } else {
                        // Traitement des commandes
                        if (line.trim() === '/list') {
                            this.sendList(socket);
                        } else if (line.trim().startsWith('/whisper ')) {
                            const parts = line.trim().substring(9).split(' ');
                            const targetPseudo = parts[0];
                            const message = parts.slice(1).join(' ');
                            
                            if (!targetPseudo || !message) {
                                this.sendToClient(socket, 'Usage: /whisper <pseudo> <message>\n');
                                return;
                            }
                            
                            // Trouver le socket du destinataire
                            let targetSocket = null;
                            for (const [clientSocket, pseudo] of this.clients) {
                                if (pseudo === targetPseudo) {
                                    targetSocket = clientSocket;
                                    break;
                                }
                            }
                            
                            if (targetSocket) {
                                const senderPseudo = this.clients.get(socket);
                                this.sendToClient(targetSocket, `[Whisper][${senderPseudo}] ${message}\n`);
                            } else {
                                this.sendToClient(socket, `Utilisateur ${targetPseudo} non trouvé.\n`);
                            }
                        } else {
                            // Diffuser le message aux autres clients
                            const pseudo = this.clients.get(socket);
                            if (line.trim()) {
                                this.broadcast(`${pseudo}: ${line.trim()}\n`, socket);
                            }
                        }
                    }
                });
            });

            // Gérer la déconnexion
            socket.on('end', () => {
                this.handleDisconnect(socket);
            });

            socket.on('error', () => {
                this.handleDisconnect(socket);
            });
        });

        // Démarrer le serveur
        server.listen(this.port, () => {
            console.log(`Serveur démarré sur le port ${this.port}\n`);
        });

        server.on('error', (err) => {
            console.error('Erreur serveur:\n', err);
        });
    }

    broadcast(message, senderSocket) {
        for (const [clientSocket, _] of this.clients) {
            if (clientSocket !== senderSocket) {
                try {
                    clientSocket.write(message);
                } catch (err) {
                    console.error('Erreur d\'envoi:\n', err);
                    this.handleDisconnect(clientSocket);
                }
            }
        }
    }

    sendToClient(socket, message) {
        try {
            socket.write(message);
        } catch (err) {
            console.error('Erreur d\'envoi au client:\n', err);
            this.handleDisconnect(socket);
        }
    }

    sendList(socket) {
        const pseudoList = Array.from(this.clients.values()).join(', ');
        const message = pseudoList ? `Utilisateurs connectés: ${pseudoList}\n` : 'Aucun utilisateur connecté.\n';
        this.sendToClient(socket, message);
    }

    handleDisconnect(socket) {
        const pseudo = this.clients.get(socket);
        if (pseudo) {
            this.broadcast(`${pseudo} a quitté le chat\n`, socket);
            this.clients.delete(socket);
        }
        socket.destroy();
    }
}

// Créer et démarrer le serveur
const server = new IRCServer();
server.start();
