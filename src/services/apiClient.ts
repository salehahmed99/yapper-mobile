import axios from 'axios';
import { getToken } from '../utils/secureStorage';
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// api.interceptors.response.use((response) => {
//   response.data = humps.camelizeKeys(response.data);
//   return response;
// });

api.interceptors.request.use(
  async (config) => {
    // config.data = humps.decamelizeKeys(config.data);
    // config.params = humps.decamelizeKeys(config.params);
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
