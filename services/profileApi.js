import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

const api = axios.create(getApiConfig());

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