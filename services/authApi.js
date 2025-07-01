import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

// Crear instancia mejorada
const createAuthApiInstance = async (includeAuth = false) => {
  const config = getApiConfig();
  const headers = { ...config.headers };
  
  if (includeAuth) {
    const token = await TokenStorage.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return axios.create({
    ...config,
    headers,
    timeout: 30000 // Aumentar timeout
  });
};

// Funciones de autenticación
export const authApi = {
  signup: async (userData) => {
    try {
      const api = await createAuthApiInstance(false);
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('❌ authApi.signup Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error.response?.data || { error: 'Error en el registro' };
    }
  },

  login: async (credentials) => {
    try {
      const api = await createAuthApiInstance(false);

      // Headers explícitos para login
      const requestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const response = await api.post('/auth/login', credentials, requestConfig);

      // Verificar que el token es válido
      if (response.data.token) {
        const tokenParts = response.data.token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Token con formato inválido');
        }
      } else {
        throw new Error('La respuesta del servidor no incluye un token');
      }

      return response.data;
    } catch (error) {
      console.error('❌ authApi.login Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Manejar diferentes tipos de errores con más detalle
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        throw { error: 'No se puede conectar al servidor. Verifica que el backend esté corriendo en ' + getApiConfig().baseURL };
      } else if (error.code === 'ENOTFOUND') {
        throw { error: 'No se puede encontrar el servidor. Verifica la configuración de IP: ' + getApiConfig().baseURL };
      } else if (error.code === 'ETIMEDOUT') {
        throw { error: 'Timeout de conexión. El servidor no responde en ' + getApiConfig().baseURL };
      } else if (error.response?.status === 500) {
        throw { error: 'Error interno del servidor. Por favor intenta nuevamente o contacta al administrador.' };
      }
      
      throw error.response?.data || { error: 'Error en el login' };
    }
  },

  verifyAccount: async (verificationData) => {
    try {
      const api = await createAuthApiInstance(false);
      const response = await api.post('/auth/verify', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error en la verificación' };
    }
  },

  resendCode: async (resendData) => {
    try {
      const api = await createAuthApiInstance(false);
      const response = await api.post('/auth/resend', resendData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al reenviar código' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const api = await createAuthApiInstance(false);
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al solicitar recuperación' };
    }
  },

  verifyResetCode: async (verificationData) => {
    try {
      const api = await createAuthApiInstance(false);
      const response = await api.post('/auth/verify-reset-code', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al verificar código' };
    }
  },

  resetPassword: async (resetData) => {
    try {
      const api = await createAuthApiInstance(false);
      const response = await api.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al restablecer contraseña' };
    }
  },

  getProfile: async () => {
    try {
      const api = await createAuthApiInstance(true);
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        await TokenStorage.clearAllAuthData();
      }
      throw error.response?.data || { error: 'Error al obtener perfil' };
    }
  },

  logout: async () => {
    try {
      // Intentamos hacer logout en el backend
      const api = await createAuthApiInstance(true);
      await api.post('/auth/logout').catch(error => {
        // Si el error es 401 o 403, es normal durante el logout
        if (error.response?.status === 401 || error.response?.status === 403) {
          return;
        }
      });
      return { success: true };
    } catch (error) {
      // No propagamos el error ya que el logout local es lo importante
      return { success: true };
    }
  },
};

export default authApi;
