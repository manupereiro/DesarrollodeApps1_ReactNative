import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
      console.log('authService: Iniciando interceptor de request...');
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        const tokenParts = token.split('.');
        console.log('authService: Token encontrado en request:', {
          header: tokenParts[0],
          payload: tokenParts[1],
          signature: tokenParts[2] ? 'Presente' : 'Ausente',
          length: token.length
        });
        
        config.headers.Authorization = `Bearer ${token}`;
        console.log('authService: Headers configurados:', {
          ...config.headers,
          Authorization: 'Bearer [TOKEN]'
        });
      } else {
        console.log('authService: ⚠️ No se encontró token para la petición');
      }
      
      console.log('authService: Detalles de la petición:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: Object.keys(config.headers)
      });
    } catch (error) {
      console.error('authService: Error en interceptor:', error);
    }
    return config;
  },
  (error) => {
    console.error('authService: Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('authService: Respuesta exitosa:', {
      url: response.config.url,
      status: response.status,
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('authService: Error en respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
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
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error en el inicio de sesión' };
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
      console.error('Error durante logout:', error);
      throw error;
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