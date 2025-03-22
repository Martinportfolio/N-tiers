import axios from 'axios';

// Configuration de base pour axios
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Récupérer toutes les conversations
 * @returns {Promise<Array>} Liste des conversations
 */
export const getConversations = async () => {
  try {
    const response = await api.get('/conversations');
    return response.data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Récupérer une conversation par ID
 * @param {string} id - ID de la conversation
 * @returns {Promise<Object>} Détails de la conversation
 */
export const getConversation = async (id) => {
  try {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Créer une nouvelle conversation
 * @param {string} title - Titre de la conversation (optionnel)
 * @returns {Promise<Object>} Nouvelle conversation créée
 */
export const createConversation = async (title = 'Nouvelle conversation') => {
  try {
    const response = await api.post('/conversations', { title });
    return response.data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Mettre à jour le titre d'une conversation
 * @param {string} id - ID de la conversation
 * @param {string} title - Nouveau titre
 * @returns {Promise<Object>} Conversation mise à jour
 */
export const updateConversationTitle = async (id, title) => {
  try {
    const response = await api.put(`/conversations/${id}`, { title });
    return response.data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Supprimer une conversation
 * @param {string} id - ID de la conversation
 * @returns {Promise<Object>} Message de confirmation
 */
export const deleteConversation = async (id) => {
  try {
    const response = await api.delete(`/conversations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Envoyer un message et obtenir une réponse
 * @param {string} conversationId - ID de la conversation
 * @param {string} message - Contenu du message
 * @returns {Promise<Object>} Réponse du modèle
 */
export const sendMessage = async (conversationId, message) => {
  try {
    const response = await api.post('/messages', { conversationId, message });
    return response.data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};