const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const HUGGING_FACE_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
const MODEL_ID = "mistralai/Mistral-NemoInstruct-2407";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

// Configuration des en-têtes pour les requêtes API
const headers = {
  'Authorization': `Bearer ${HUGGING_FACE_API_TOKEN}`,
  'Content-Type': 'application/json'
};

/**
 * Service pour interagir avec l'API Hugging Face
 */
const huggingFaceService = {
  /**
   * Obtient une réponse du modèle en fonction de l'historique de la conversation
   * @param {Array} conversationHistory - L'historique de la conversation
   * @returns {Promise<string>} - La réponse du modèle
   */
  getModelResponse: async (conversationHistory) => {
    try {
      // Préparer l'historique de la conversation pour le modèle
      // Ne gardons que les 10 derniers messages pour éviter de dépasser les limites du modèle
      const recentHistory = conversationHistory.slice(-10);
      
      // Formater l'historique de conversation pour le modèle
      const formattedHistory = recentHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      // Construire le prompt pour le modèle
      const prompt = `${formattedHistory}
Assistant: `;
      
      // Effectuer la requête à l'API Hugging Face
      const response = await axios.post(
        API_URL,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true
          }
        },
        { headers }
      );
      
      // Extraire et retourner la réponse
      if (response.data && response.data[0] && response.data[0].generated_text) {
        // Extraire uniquement la partie de la réponse générée par le modèle
        const fullText = response.data[0].generated_text;
        const assistantResponseRegex = new RegExp(`${prompt}(.*?)(?:User:|$)`, 's');
        const match = fullText.match(assistantResponseRegex);
        
        if (match && match[1]) {
          return match[1].trim();
        }
        
        // Fallback: retourner tout ce qui vient après le prompt
        return fullText.substring(prompt.length).trim();
      }
      
      return "Je n'ai pas pu générer de réponse. Veuillez réessayer.";
    } catch (error) {
      console.error('Erreur lors de la communication avec Hugging Face:', error.response?.data || error.message);
      
      // Vérifier si l'erreur est due au modèle qui se charge
      if (error.response && error.response.status === 503) {
        console.log('Le modèle est en cours de chargement, attente...');
        // Le modèle est en cours de chargement, attendre et réessayer
        await new Promise(resolve => setTimeout(resolve, 5000));
        return huggingFaceService.getModelResponse(conversationHistory);
      }
      
      return "Une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer.";
    }
  }
};

module.exports = huggingFaceService;