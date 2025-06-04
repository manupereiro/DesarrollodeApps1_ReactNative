import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

const api = axios.create(getApiConfig());

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
      console.log('🔐 authApi.login - Credenciales recibidas:', JSON.stringify(credentials, null, 2));
      console.log('🔐 authApi.login - Headers de la petición:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      
      const response = await api.post('/auth/login', credentials);
      
      // Log detallado de la respuesta
      console.log('🔐 Login exitoso - Respuesta raw:', JSON.stringify(response.data, null, 2));
      console.log('🔐 Login exitoso - Estructura de la respuesta:', {
        status: response.status,
        headers: response.headers,
        dataKeys: Object.keys(response.data),
        dataTypes: Object.entries(response.data).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: typeof value
        }), {})
      });

      // Verificar que el token es válido
      if (response.data.token) {
        const tokenParts = response.data.token.split('.');
        console.log('🔐 Token recibido:', {
          header: tokenParts[0],
          payload: tokenParts[1],
          signature: tokenParts[2] ? 'Presente' : 'Ausente',
          length: response.data.token.length,
          rawToken: response.data.token // Temporal para debug
        });
      } else {
        console.warn('⚠️ No se recibió token en la respuesta. Respuesta completa:', response.data);
      }

      // Verificar que la respuesta tiene la estructura esperada
      if (!response.data.token) {
        throw new Error('La respuesta del servidor no incluye un token');
      }

      return response.data;
    } catch (error) {
      console.error('❌ authApi.login Error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        request: error.config ? {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers,
          data: error.config.data
        } : 'No config'
      });
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
      // Intentamos hacer logout en el backend, pero no es crítico si falla
      await api.post('/auth/logout').catch(error => {
        // Si el error es 401 o 403, probablemente el token ya expiró o es inválido
        // Lo cual es esperado durante el logout, así que lo manejamos silenciosamente
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🔒 Token ya expirado o inválido durante logout - esto es normal');
          return;
        }
        // Para otros errores, los registramos pero no los propagamos
        console.warn('⚠️ Error no crítico durante logout:', error.message);
      });
      return { success: true };
    } catch (error) {
      // No propagamos el error ya que el logout local es lo importante
      console.log('ℹ️ Logout completado (backend opcional)');
      return { success: true };
    }
  },
};

export default authApi;
