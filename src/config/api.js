// Configuration centralisée pour l'API
const getApiUrl = () => {
  // En production (Vercel), utiliser la variable d'environnement
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://interface-backend-1jgi.onrender.com';
  }
  
  // En développement, utiliser localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

export const API_URL = getApiUrl();

// Configuration pour les requêtes fetch avec gestion CORS
export const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors', // Explicitly set CORS mode
};

export default API_URL; 