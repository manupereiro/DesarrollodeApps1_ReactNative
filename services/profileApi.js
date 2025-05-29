import axios from 'axios';
import { Platform } from 'react-native';
import TokenStorage from './tokenStorage';

// Configuración base de la API
const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080/',
  ios: 'http://localhost:8080/',
  default: 'http://localhost:8080/'
});

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar el token a las requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await TokenStorage.getToken();
      console.log('🔑 Token disponible:', token ? 'Sí' : 'No');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('🌐 Request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const profileApi = {
  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      console.log('🔄 Obteniendo perfil...');
      const response = await api.get('/users/me');
      console.log('✅ Perfil obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getProfile:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data || { error: 'Error al obtener perfil' };
    }
  },

  // Actualizar perfil del usuario
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/me', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al actualizar perfil' };
    }
  }
};

export default profileApi; 