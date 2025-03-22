const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const huggingFaceService = require('../services/huggingFaceService');

/**
 * @route   POST /api/messages
 * @desc    Envoyer un message et obtenir une réponse
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { conversationId, message } = req.body;
  
  if (!conversationId || !message) {
    return res.status(400).json({ message: 'conversationId et message sont requis' });
  }
  
  try {
    // Récupérer la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Ajouter le message de l'utilisateur
    conversation.messages.push({
      content: message,
      role: 'user'
    });
    
    // Construire le contexte pour le modèle Hugging Face
    const conversationHistory = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Obtenir une réponse du modèle
    const modelResponse = await huggingFaceService.getModelResponse(conversationHistory);
    
    // Ajouter la réponse du modèle à la conversation
    conversation.messages.push({
      content: modelResponse,
      role: 'assistant'
    });
    
    // Mettre à jour le titre de la conversation s'il s'agit du premier message
    if (conversation.messages.length === 2) {
      // Utiliser les premiers mots du message comme titre
      conversation.title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
    }
    
    // Sauvegarder la conversation mise à jour
    await conversation.save();
    
    // Renvoyer la réponse
    res.json({ reply: modelResponse });
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    res.status(500).json({ message: 'Erreur lors du traitement du message' });
  }
});

module.exports = router;