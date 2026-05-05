// Centralized API base URL.
// In development: defaults to http://localhost:8000/api
// In production:  set VITE_API_URL in .env.production (e.g. https://logisticatag.com.ar/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default API_BASE_URL;
