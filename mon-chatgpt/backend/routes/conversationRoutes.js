const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');

/**
 * @route   GET /api/conversations
 * @desc    Récupérer toutes les conversations
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/conversations/:id
 * @desc    Récupérer une conversation par ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/conversations
 * @desc    Créer une nouvelle conversation
 * @access  Public
 */
router.post('/', async (req, res) => {
  const conversation = new Conversation({
    title: req.body.title || 'Nouvelle conversation',
    messages: []
  });

  try {
    const newConversation = await conversation.save();
    res.status(201).json(newConversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/conversations/:id
 * @desc    Mettre à jour le titre d'une conversation
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    if (req.body.title) {
      conversation.title = req.body.title;
    }
    
    const updatedConversation = await conversation.save();
    res.json(updatedConversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/conversations/:id
 * @desc    Supprimer une conversation
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;