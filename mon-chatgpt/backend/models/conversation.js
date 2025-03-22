const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Nouvelle conversation'
  },
  messages: [messageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);