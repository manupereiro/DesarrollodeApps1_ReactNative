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
      // Asegurar formato correcto del header Authorization
      headers.Authorization = `Bearer ${token}`;
      console.log('🔐 authApi - Token agregado al header:', {
        tokenLength: token.length,
        headerFormat: `Bearer ${token.substring(0, 20)}...`
      });
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
      console.log('🔄 authApi.signup - Datos recibidos:', {
        username: userData.username,
        email: userData.email,
        passwordLength: userData.password?.length
      });

      const api = await createAuthApiInstance(false);
      const response = await api.post('/auth/signup', userData);
      
      console.log('✅ authApi.signup - Registro exitoso:', {
        status: response.status,
        hasData: !!response.data
      });

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
      console.log('🔐 authApi.login - Credenciales recibidas:', {
        username: credentials.username,
        password: credentials.password
      });
      // Log del body real enviado
      console.log('🔐 authApi.login - Body enviado:', JSON.stringify(credentials));
      
      // Verificar configuración de API antes de hacer la petición
      const config = getApiConfig();
      console.log('🌐 authApi.login - Configuración API:', config);
      
      const api = await createAuthApiInstance(false);
      
      // Headers explícitos para login
      const requestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      console.log('🔐 authApi.login - Headers de la petición:', requestConfig.headers);
      
      const response = await api.post('/auth/login', credentials, requestConfig);
      
      // Log detallado de la respuesta
      console.log('🔐 Login exitoso - Respuesta:', {
        status: response.status,
        dataKeys: Object.keys(response.data),
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
      });

      // Verificar que el token es válido
      if (response.data.token) {
        const tokenParts = response.data.token.split('.');
        console.log('🔐 Token recibido:', {
          header: tokenParts[0]?.substring(0, 10) + '...',
          payload: tokenParts[1]?.substring(0, 10) + '...',
          signature: tokenParts[2] ? 'Presente' : 'Ausente',
          length: response.data.token.length
        });
        
        // Validar estructura JWT
        if (tokenParts.length !== 3) {
          throw new Error('Token con formato inválido');
        }
      } else {
        console.warn('⚠️ No se recibió token en la respuesta');
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
        console.log('🔒 Error de autenticación en getProfile, limpiando tokens...');
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
          console.log('🔒 Sesión cerrada exitosamente (token ya inválido)');
          return;
        }
        console.warn('⚠️ Error no crítico durante logout:', error.message);
      });
      
      console.log('✅ Sesión cerrada exitosamente');
      return { success: true };
    } catch (error) {
      // No propagamos el error ya que el logout local es lo importante
      console.log('✅ Sesión cerrada exitosamente (local)');
      return { success: true };
    }
  },
};

export default authApi;
