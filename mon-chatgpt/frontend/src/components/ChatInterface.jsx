import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import { getConversations, getConversation, createConversation, sendMessage } from '../services/api';

/**
 * Composant principal de l'interface de chat
 */
const ChatInterface = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Charger les conversations au démarrage
  useEffect(() => {
    fetchConversations();
  }, []);

  // Effet pour faire défiler jusqu'au dernier message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Récupérer la liste des conversations
  const fetchConversations = async () => {
    try {
      setError(null);
      const data = await getConversations();
      setConversations(data);
      
      // Sélectionner la première conversation s'il y en a une et si aucune n'est sélectionnée
      if (data.length > 0 && !currentConversation) {
        await loadConversation(data[0]._id);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError('Impossible de charger les conversations. Veuillez réessayer.');
    }
  };

  // Charger une conversation par ID
  const loadConversation = async (conversationId) => {
    try {
      setError(null);
      setLoading(true);
      const data = await getConversation(conversationId);
      setCurrentConversation(data);
      setMessages(data.messages);
    } catch (err) {
      console.error('Erreur lors du chargement de la conversation:', err);
      setError('Impossible de charger la conversation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle conversation
  const createNewConversation = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await createConversation();
      setCurrentConversation(data);
      setMessages([]);
      await fetchConversations();
      
      // Focus sur le champ de saisie
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error('Erreur lors de la création de la conversation:', err);
      setError('Impossible de créer une nouvelle conversation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentConversation) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    
    const userMessage = {
      content: messageText,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Mettre à jour l'état localement d'abord pour un feedback instantané
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      const response = await sendMessage(currentConversation._id, messageText);
      
      // Ajouter la réponse du modèle
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          content: response.reply,
          role: 'assistant',
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Rafraîchir la liste des conversations pour mettre à jour les titres
      fetchConversations();
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError('Erreur lors de l\'envoi du message. Veuillez réessayer.');
      
      // Supprimer le message utilisateur si l'envoi a échoué
      setMessages(prevMessages => prevMessages.filter(msg => msg !== userMessage));
    } finally {
      setLoading(false);
    }
  };

  // Faire défiler jusqu'au dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Liste des conversations */}
      <div className="w-1/4 bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        <button 
          onClick={createNewConversation}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded mb-4 disabled:opacity-50"
        >
          Nouvelle conversation
        </button>
        
        <div className="overflow-y-auto flex-grow">
          {conversations.length === 0 ? (
            <div className="text-gray-400 text-center mt-4">
              Aucune conversation
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv._id}
                onClick={() => !loading && loadConversation(conv._id)}
                className={`p-3 mb-2 rounded cursor-pointer ${
                  loading ? 'opacity-50' : ''
                } ${
                  currentConversation?._id === conv._id 
                    ? 'bg-primary' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <p className="truncate font-medium">{conv.title}</p>
                <p className="text-xs text-gray-300">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Zone principale de chat */}
      <div className="flex flex-col w-3/4 h-full">
        {currentConversation ? (
          <>
            {/* En-tête de la conversation */}
            <div className="bg-white shadow p-4">
              <h3 className="text-lg font-semibold truncate">{currentConversation.title}</h3>
            </div>
            
            {/* Zone des messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Commencez la conversation...
                </div>
              ) : (
                messages.map((message, index) => (
                  <Message key={index} message={message} />
                ))
              )}
              {/* Affichage de l'erreur */}
              {error && (
                <div className="p-3 my-2 bg-red-100 text-red-800 rounded-lg">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Formulaire d'envoi de message */}
            <form 
              onSubmit={handleSendMessage}
              className="border-t p-4 bg-white"
            >
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={loading}
                  placeholder="Tapez votre message..."
                  ref={messageInputRef}
                  className="flex-1 p-3 border rounded-l focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="bg-primary hover:bg-primary-dark text-white p-3 rounded-r disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Envoyer"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
            <p className="mb-4 text-center">
              Sélectionnez une conversation ou créez-en une nouvelle
            </p>
            <button
              onClick={createNewConversation}
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded disabled:opacity-50"
            >
              Créer une conversation
            </button>
            
            {/* Affichage de l'erreur */}
            {error && (
              <div className="p-3 mt-4 bg-red-100 text-red-800 rounded-lg max-w-md">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;