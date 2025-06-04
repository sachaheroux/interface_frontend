// Configuration des URLs selon l'environnement
const config = {
  development: {
    API_URL: "http://127.0.0.1:8000"
  },
  production: {
    API_URL: "https://interface-backend-1jgi.onrender.com"
  }
};

const environment = import.meta.env.MODE || 'development';

export default config[environment]; 