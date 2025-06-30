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
  } else {
    // No hay token disponible
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
    return requestsInProgress.get(requestKey);
  }

  const requestPromise = (async () => {
    let lastError;
    let consecutiveAuthErrors = 0;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Verificar token antes de cada intento
        const tokenInfo = await TokenStorage.getTokenInfo();
        if (!tokenInfo || !tokenInfo.hasToken) {
          throw new Error('No authentication token available');
        }
        if (tokenInfo.isExpired) {
          await TokenStorage.clearAllAuthData();
          throw new Error('Token expired');
        }
        if (tokenInfo.expiresSoon) {
          // Token expira pronto, pero aún es válido
        }
        const config = getApiConfig();
        const api = await createApiInstance();
        const result = await requestFn(api);
        return result;
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          consecutiveAuthErrors++;
          if (consecutiveAuthErrors >= 2) {
            await TokenStorage.clearAllAuthData();
            throw new Error('Authentication failed - tokens cleared');
          }
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
        }
        if (!status) {
          if (attempt < maxRetries) {
            const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
        }
        if (status && status >= 400 && status < 500 && status !== 401 && status !== 403) {
          break;
        }
        if (attempt === maxRetries) break;
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
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
    return true;
  } catch (error) {
    return false;
  }
};

export const routesService = {
  // Verificar conectividad
  checkHealth: checkBackendHealth,
  
  // Debug TokenStorage al inicio
  debugTokenStorage: () => {
    TokenStorage.debugMethods();
  },

  // Obtener todas las rutas disponibles
  getAvailableRoutes: async () => {
    const requestKey = 'getAvailableRoutes';
    
    return makeRequest(requestKey, async (api) => {
      const response = await api.get('/routes/available');
      
      return response.data || [];
    });
  },

  // Obtener las rutas asignadas al repartidor actual
  getMyRoutes: async () => {
    const requestKey = 'getMyRoutes';
    
    return makeRequest(requestKey, async (api) => {
      const response = await api.get('/routes/my-routes');
      
      return response.data || [];
    });
  },

  // Elegir una ruta
  selectRoute: async (routeId) => {
    const requestKey = `selectRoute-${routeId}`;
    
    return makeRequest(requestKey, async (api) => {
      const response = await api.post(`/routes/${routeId}/assign`);
      return response.data;
    });
  },

  // Cancelar una ruta
  cancelRoute: async (routeId) => {
    const requestKey = `cancelRoute-${routeId}`;
    
    return makeRequest(requestKey, async (api) => {
      const response = await api.post(`/routes/${routeId}/cancel`);
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
      
      let endpoint;
      let response;
      
      if (status === 'COMPLETED') {
        endpoint = `/routes/${routeId}/complete`;
        response = await api.post(endpoint);
      } else {
        endpoint = `/routes/${routeId}/status`;
        response = await api.put(endpoint, { status });
      }
      
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