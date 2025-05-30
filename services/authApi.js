import axios from 'axios';
import TokenStorage from './tokenStorage';

// Configuración base de la API
const API_BASE_URL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await TokenStorage.getToken();
      if (token) {
        const tokenParts = token.split('.');
        console.log('🔐 Token encontrado:', {
          header: tokenParts[0],
          payload: tokenParts[1],
          signature: tokenParts[2] ? 'Presente' : 'Ausente',
          length: token.length,
        });

        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('⚠️ No se encontró token para la petición');
      }
    } catch (error) {
      console.error('❌ Error en interceptor de request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta recibida:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    console.error('❌ Error en respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.log('🔒 Token expirado, limpiando almacenamiento...');
      await TokenStorage.clearAll();
      // Aquí podrías redirigir al login si es necesario
    }

    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const authApi = {
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error en el registro' };
    }
  },

  login: async (credentials) => {
    try {
      console.log('🔐 authApi.login:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('🔐 Login exitoso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ authApi.login Error:', error.response?.data || error.message);
      throw error.response?.data || { error: 'Error en el login' };
    }
  },

  verifyAccount: async (verificationData) => {
    try {
      const response = await api.post('/auth/verify', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error en la verificación' };
    }
  },

  resendCode: async (resendData) => {
    try {
      const response = await api.post('/auth/resend', resendData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al reenviar código' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al solicitar recuperación' };
    }
  },

  verifyResetCode: async (verificationData) => {
    try {
      const response = await api.post('/auth/verify-reset-code', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al verificar código' };
    }
  },

  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al restablecer contraseña' };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener perfil' };
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.warn('⚠️ Error en logout:', error.message);
    }
  },
};

export default authApi;
