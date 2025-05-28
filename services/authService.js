import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración base de la API
const API_BASE_URL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
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

export const authService = {
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
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
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

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Obtener token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
};

export default authService; 