import axios from 'axios';
import TokenStorage from './tokenStorage';

// Configuración base de la API
const API_BASE_URL = 'http://10.0.2.2:8080/'; // Cambia esta URL por la de tu backend

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
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globalmente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.log('🔒 Token expirado, limpiando almacenamiento...');
      await TokenStorage.clearAll();
      // Aquí podrías navegar al login si tienes acceso al navigator
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // Registro de usuario
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error en el registro' };
    }
  },

  // Login
  login: async (credentials) => {
    try {
      console.log('🌐 authApi.login: Enviando request con credenciales:', credentials);
      console.log('🌐 authApi.login: URL completa:', `${API_BASE_URL}auth/login`);
      const response = await api.post('/auth/login', credentials);
      console.log('🌐 authApi.login: Response status:', response.status);
      console.log('🌐 authApi.login: Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 authApi.login: Error completo:', error);
      console.error('🌐 authApi.login: Error response:', error.response);
      console.error('🌐 authApi.login: Error response data:', error.response?.data);
      console.error('🌐 authApi.login: Error response status:', error.response?.status);
      throw error.response?.data || { error: 'Error en el login' };
    }
  },

  // Verificación de cuenta
  verifyAccount: async (verificationData) => {
    try {
      const response = await api.post('/auth/verify', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error en la verificación' };
    }
  },

  // Reenvío de código
  resendCode: async (resendData) => {
    try {
      const response = await api.post('/auth/resend', resendData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al reenviar código' };
    }
  },

  // Solicitar código de recuperación de contraseña
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al solicitar recuperación' };
    }
  },

  // Verificar código de recuperación
  verifyResetCode: async (verificationData) => {
    try {
      const response = await api.post('/auth/verify-reset-code', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al verificar código' };
    }
  },

  // Restablecer contraseña
  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al restablecer contraseña' };
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener perfil' };
    }
  },

  // Logout (opcional, para invalidar token en el servidor)
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      // No es crítico si falla
      console.warn('Error en logout del servidor:', error);
    }
  },
};

export default authApi; 