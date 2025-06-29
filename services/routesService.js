import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

// Crear instancia con configuración mejorada y headers consistentes
const createApiInstance = async () => {
  const config = getApiConfig();
  const token = await TokenStorage.getToken();
  
  const headers = { ...config.headers };
  
  if (token) {
    // Asegurar formato correcto del header Authorization
    headers.Authorization = `Bearer ${token}`;
    console.log('🔐 routesService - Token agregado al header:', {
      tokenLength: token.length,
      tokenPreview: `${token.substring(0, 20)}...`
    });
  } else {
    console.warn('⚠️ routesService - No hay token disponible para la petición');
  }
  
  return axios.create({
    ...config,
    headers,
    timeout: 30000 // Aumentar timeout
  });
};

// Pool de requests en progreso para evitar duplicados
const requestsInProgress = new Map();

// Función para hacer requests con retry y deduplicación mejorada
const makeRequest = async (requestKey, requestFn, maxRetries = 3) => {
  // Evitar requests duplicados
  if (requestsInProgress.has(requestKey)) {
    console.log('🔄 routesService - Request ya en progreso, evitando duplicado:', requestKey);
    return requestsInProgress.get(requestKey);
  }

  const requestPromise = (async () => {
    let lastError;
    let consecutiveAuthErrors = 0;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 routesService - Intento ${attempt}/${maxRetries} para:`, requestKey);
        
        // Verificar token antes de cada intento
        const tokenInfo = await TokenStorage.getTokenInfo();
        if (!tokenInfo || !tokenInfo.hasToken) {
          console.warn('⚠️ routesService - No hay token válido disponible');
          throw new Error('No authentication token available');
        }
        
        if (tokenInfo.isExpired) {
          console.warn('⚠️ routesService - Token expirado, limpiando...');
          await TokenStorage.clearAllAuthData();
          throw new Error('Token expired');
        }
        
        const api = await createApiInstance();
        const result = await requestFn(api);
        
        console.log('✅ routesService - Request exitoso:', requestKey);
        return result;
        
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        
        console.log(`❌ routesService - Error en intento ${attempt}:`, {
          message: error.message,
          status,
          isNetworkError: !status,
          isAuthError: status === 401 || status === 403
        });
        
        // Manejar errores de autenticación con más inteligencia
        if (status === 401 || status === 403) {
          consecutiveAuthErrors++;
          console.log(`🔑 routesService - Error de autenticación #${consecutiveAuthErrors}`);
          
          // Solo limpiar tokens después de múltiples errores consecutivos
          if (consecutiveAuthErrors >= 2) {
            console.warn('🔑 routesService - Múltiples errores de auth consecutivos, limpiando tokens...');
            await TokenStorage.clearAllAuthData();
            throw new Error('Authentication failed - tokens cleared');
          }
          
          // Para el primer error 401/403, esperar y reintentar
          if (attempt < maxRetries) {
            console.log('🔑 routesService - Esperando antes de reintentar...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
        }
        
        // Manejar errores de red con backoff exponencial
        if (!status) {
          console.log('🌐 routesService - Error de red, reintentando...');
          if (attempt < maxRetries) {
            const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`⏳ routesService - Esperando ${delayMs}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
        }
        
        // No reintentar otros errores 4xx (excepto 401/403 ya manejados)
        if (status && status >= 400 && status < 500 && status !== 401 && status !== 403) {
          console.log('🚫 routesService - Error no reintentable:', status);
          break;
        }
        
        // Si es el último intento, salir
        if (attempt === maxRetries) break;
        
        // Delay exponencial para otros errores
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ routesService - Esperando ${delayMs}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    console.error('❌ routesService - Todos los intentos fallaron para:', requestKey);
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

// Función para verificar conectividad con el backend
const checkBackendHealth = async () => {
  try {
    // Usar health check que no requiere autenticación
    const config = getApiConfig();
    const api = axios.create(config);
    await api.get('/routes/health');
    console.log('✅ routesService - Backend saludable');
    return true;
  } catch (error) {
    console.warn('⚠️ routesService - Backend no disponible:', error.message);
    return false;
  }
};

export const routesService = {
  // Verificar conectividad
  checkHealth: checkBackendHealth,
  
  // Debug TokenStorage al inicio
  debugTokenStorage: () => {
    console.log('🔍 routesService - Verificando TokenStorage al inicio:');
    TokenStorage.debugMethods();
  },

  // Obtener todas las rutas disponibles
  getAvailableRoutes: async () => {
    const requestKey = 'getAvailableRoutes';
    
    return makeRequest(requestKey, async (api) => {
      console.log('🔄 routesService - Obteniendo rutas disponibles...');
      const response = await api.get('/routes/available');
      console.log('✅ routesService - Rutas disponibles obtenidas:', response.data?.length || 0, 'rutas');
      
      // Debug: mostrar la respuesta
      if (response.data && response.data.length > 0) {
        console.log(`🔍 routesService - Primera ruta:`, {
          id: response.data[0]?.id,
          origin: response.data[0]?.origin,
          destination: response.data[0]?.destination,
          status: response.data[0]?.status
        });
      } else {
        console.warn('⚠️ routesService - No se recibieron rutas disponibles');
      }
      
      return response.data || [];
    });
  },

  // Obtener las rutas asignadas al repartidor actual
  getMyRoutes: async () => {
    const requestKey = 'getMyRoutes';
    
    return makeRequest(requestKey, async (api) => {
      console.log('🔄 routesService - Obteniendo mis rutas...');
      const response = await api.get('/routes/my-routes');
      console.log('✅ routesService - Mis rutas obtenidas:', response.data?.length || 0, 'rutas');
      
      // Debug: mostrar información de las rutas
      if (response.data && response.data.length > 0) {
        console.log(`🔍 routesService - Primera ruta personal:`, {
          id: response.data[0]?.id,
          origin: response.data[0]?.origin,
          destination: response.data[0]?.destination,
          status: response.data[0]?.status
        });
      } else {
        console.warn('⚠️ routesService - No se encontraron rutas asignadas');
      }
      
      return response.data || [];
    });
  },

  // Elegir una ruta
  selectRoute: async (routeId) => {
    const requestKey = `selectRoute-${routeId}`;
    
    return makeRequest(requestKey, async (api) => {
      console.log(`🔄 routesService - Asignando ruta ${routeId}...`);
      const response = await api.post(`/routes/${routeId}/assign`);
      console.log('✅ routesService - Ruta asignada exitosamente:', response.data);
      return response.data;
    });
  },

  // Cancelar una ruta
  cancelRoute: async (routeId) => {
    const requestKey = `cancelRoute-${routeId}`;
    
    return makeRequest(requestKey, async (api) => {
      console.log(`🔄 routesService - Cancelando ruta ${routeId}...`);
      const response = await api.post(`/routes/${routeId}/cancel`);
      console.log('✅ routesService - Ruta cancelada exitosamente:', response.data);
      return response.data;
    });
  },

  // Actualizar estado de una ruta
  updateRouteStatus: async (routeId, status) => {
    const requestKey = `updateRouteStatus-${routeId}-${status}`;
    
    return makeRequest(requestKey, async (api) => {
      // Validación básica - solo verificar que existe un token
      const token = await TokenStorage.getToken();
      if (!token) {
        throw new Error('No hay token disponible');
      }
      
      console.log(`🔄 routesService - Actualizando estado de ruta ${routeId} a ${status}...`);
      
      let endpoint;
      let response;
      
      if (status === 'COMPLETED') {
        endpoint = `/routes/${routeId}/complete`;
        response = await api.post(endpoint);
      } else {
        endpoint = `/routes/${routeId}/status`;
        response = await api.put(endpoint, { status });
      }
      
      console.log('✅ routesService - Estado actualizado exitosamente:', response.data);
      return response.data;
    });
  },

  // Suscripción a cambios en tiempo real
  subscribeToRoutes: (onUpdate) => {
    // Aquí implementaremos la suscripción en tiempo real
    // Esto dependerá de cómo esté implementado en el backend
    // Por ejemplo, usando WebSocket o Server-Sent Events
    return () => {
      // Función de limpieza para cancelar la suscripción
    };
  }
};

export default routesService; 