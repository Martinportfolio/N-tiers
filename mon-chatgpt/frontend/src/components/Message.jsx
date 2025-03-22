import React from 'react';

/**
 * Composant pour afficher un message individuel
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.message - Les données du message
 * @param {string} props.message.role - Le rôle (user/assistant)
 * @param {string} props.message.content - Le contenu du message
 * @param {Date} props.message.timestamp - L'horodatage du message
 */
const Message = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isUser ? 'order-2 ml-2' : 'order-1 mr-2'}`} 
           style={{ backgroundColor: isUser ? '#0078ff' : '#6b7280' }}>
        <span className="text-white text-sm font-bold">
          {isUser ? 'U' : 'AI'}
        </span>
      </div>
      
      {/* Bulle de message */}
      <div className={`max-w-[70%] p-3 rounded-lg ${
        isUser 
          ? 'bg-primary text-white rounded-tr-none order-1' 
          : 'bg-gray-200 text-gray-800 rounded-tl-none order-2'
      }`}>
        {/* Contenu du message avec formatage des sauts de ligne */}
        <div className="whitespace-pre-wrap">
          {message.content}
        </div>
        
        {/* Horodatage */}
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default Message;