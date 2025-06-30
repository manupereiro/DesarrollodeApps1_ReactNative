import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

// Crear instancia mejorada con validación de token y headers consistentes
const createProfileApiInstance = async () => {
  const config = getApiConfig();
  
  // Verificar información del token antes de hacer requests
  const tokenInfo = await TokenStorage.getTokenInfo();
  
  if (!tokenInfo || !tokenInfo.hasToken) {
    console.warn('⚠️ profileApi - No hay token válido disponible');
    throw new Error('No authentication token available');
  }
  
  if (tokenInfo.isExpired) {
    console.warn('⚠️ profileApi - Token expirado, limpiando datos...');
    await TokenStorage.clearAllAuthData();
    throw new Error('Token expired');
  }
  
  if (tokenInfo.expiresSoon) {
    console.warn(`⚠️ profileApi - Token expira pronto (${tokenInfo.expiresInMinutes} minutos)`);
  }
  
  const token = await TokenStorage.getToken();
  
  // Asegurar headers consistentes
  const headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`,
  };
  
  
  return axios.create({
    ...config,
    headers,
    timeout: 15000, // 15 segundos timeout
  });
};

// Pool de requests en progreso para evitar duplicados
const requestsInProgress = new Map();

// Función para hacer requests con retry inteligente y auto-recovery
const makeProfileRequest = async (requestKey, requestFn, maxRetries = 3) => {
  // Evitar requests duplicados
  if (requestsInProgress.has(requestKey)) {
    return requestsInProgress.get(requestKey);
  }

  const requestPromise = (async () => {
    let lastError;
    let consecutiveAuthErrors = 0;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        
        // Verificar token antes de cada intento
        const tokenInfo = await TokenStorage.getTokenInfo();
        if (!tokenInfo || !tokenInfo.hasToken || tokenInfo.isExpired) {
          console.warn('⚠️ profileApi - Token inválido, abortando request');
          throw new Error('Invalid token');
        }
        
        const api = await createProfileApiInstance();
        const result = await requestFn(api);
        
        return result;
        
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        
        console.log(`❌ profileApi - Error en intento ${attempt}:`, {
          message: error.message,
          status,
          isNetworkError: !status,
          isAuthError: status === 401 || status === 403,
          url: error.config?.url
        });
        
        // Manejar errores de autenticación con contador
        if (status === 401 || status === 403) {
          consecutiveAuthErrors++;
          console.log(`🔑 profileApi - Error de autenticación #${consecutiveAuthErrors}`);
          
          // Logging adicional para debug del error 403
          if (status === 403) {
            console.log('🔍 profileApi - Detalles del error 403:', {
              url: error.config?.url,
              method: error.config?.method,
              headers: {
                'Content-Type': error.config?.headers?.['Content-Type'],
                'Accept': error.config?.headers?.['Accept'],
                'Authorization': error.config?.headers?.['Authorization'] ? 
                  `Bearer ${error.config.headers.Authorization.substring(7, 27)}...` : 'No present'
              },
              responseData: error.response?.data
            });
          }
          
          // Solo limpiar tokens después de múltiples errores consecutivos
          if (consecutiveAuthErrors >= 2) {
            console.warn('🔑 profileApi - Múltiples errores de auth, limpiando tokens...');
            await TokenStorage.clearAllAuthData();
            throw new Error('Authentication failed - tokens cleared');
          }
          
          // Para el primer error 401/403, esperar un poco y reintentar
          if (attempt < maxRetries) {
            console.log('🔑 profileApi - Esperando antes de reintentar...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
        }
        
        // Manejar errores de red con backoff exponencial
        if (!status) {
          console.log('🌐 profileApi - Error de red, reintentando...');
          if (attempt < maxRetries) {
            const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`⏳ profileApi - Esperando ${delayMs}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
        }
        
        // No reintentar otros errores 4xx (excepto 401/403 ya manejados)
        if (status && status >= 400 && status < 500 && status !== 401 && status !== 403) {
          console.log('🚫 profileApi - Error no reintentable:', status);
          break;
        }
        
        // Si es el último intento, salir
        if (attempt === maxRetries) break;
        
        // Delay estándar para otros errores
        const delayMs = 1000 * attempt;
        console.log(`⏳ profileApi - Esperando ${delayMs}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    console.error('❌ profileApi - Todos los intentos fallaron para:', requestKey);
    throw lastError;
  })();

  requestsInProgress.set(requestKey, requestPromise);
  
  try {
    const result = await requestPromise;
    return result;
  } finally {
    requestsInProgress.delete(requestKey);
  }
};

export const profileApi = {
  // Verificar estado del token
  checkTokenStatus: async () => {
    try {
      const tokenInfo = await TokenStorage.getTokenInfo();
      console.log('🔍 profileApi - Estado del token:', tokenInfo);
      return tokenInfo;
    } catch (error) {
      console.error('❌ profileApi - Error verificando token:', error);
      return { hasToken: false, isExpired: true };
    }
  },

  // Obtener datos del perfil con auto-recovery
  getProfile: async () => {
    const requestKey = 'getProfile';
    
    return makeProfileRequest(requestKey, async (api) => {
      const response = await api.get('/users/me');
      return response.data;
    });
  },

  // Test de conectividad sin autenticación
  testConnection: async () => {
    try {
      const config = getApiConfig();
      const api = axios.create(config);
      await api.get('/routes/health');
      return true;
    } catch (error) {
      console.warn('⚠️ profileApi - Sin conectividad:', error.message);
      return false;
    }
  },

  // Auto-recovery del perfil con múltiples estrategias
  recoverProfile: async () => {
    try {
      
      // 1. Verificar conectividad básica
      const isConnected = await profileApi.testConnection();
      if (!isConnected) {
        throw new Error('No network connectivity');
      }
      
      // 2. Verificar estado del token
      const tokenInfo = await profileApi.checkTokenStatus();
      if (!tokenInfo.hasToken) {
        throw new Error('No token available');
      }
      
      if (tokenInfo.isExpired) {
        await TokenStorage.clearAllAuthData();
        throw new Error('Token expired and cleared');
      }
      
      // 3. Intentar obtener el perfil con estrategia conservadora
      const profile = await profileApi.getProfile();
      
      return { success: true, data: profile };
      
    } catch (error) {
      console.error('❌ profileApi - Auto-recovery falló:', error.message);
      return { 
        success: false, 
        error: error.message,
        needsReauth: error.message.includes('Token') || error.message.includes('authentication')
      };
    }
  }
};

export default profileApi; 