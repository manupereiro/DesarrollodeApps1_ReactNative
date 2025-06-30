import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

// Crear instancia con configuración mejorada y headers consistentes
const createApiInstance = async () => {
  const config = getApiConfig();
  const token = await TokenStorage.getToken();

  const headers = { ...config.headers };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
  if (requestsInProgress.has(requestKey)) {
    return requestsInProgress.get(requestKey);
  }

  const requestPromise = (async () => {
    let lastError;
    let consecutiveAuthErrors = 0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const tokenInfo = await TokenStorage.getTokenInfo();
        if (!tokenInfo || !tokenInfo.hasToken) {
          throw new Error('No authentication token available');
        }

        if (tokenInfo.isExpired) {
          await TokenStorage.clearAllAuthData();
          throw new Error('Token expired');
        }

        const api = await createApiInstance();
        const result = await requestFn(api);
        return result;

      } catch (error) {
        lastError = error;
        const status = error.response?.status;

        // Manejar errores de autenticación con más inteligencia
        if (status === 401 || status === 403) {
          consecutiveAuthErrors++;
          console.log(`🔑 routesService - Error de autenticación #${consecutiveAuthErrors}`);
          
          // 401 = Token inválido/expirado (más crítico)
          // 403 = Sin permisos para esta acción específica (menos crítico)
          
          // Solo limpiar tokens después de MÚLTIPLES errores - MODO TOLERANTE
          if (status === 401 && consecutiveAuthErrors >= 3) { // Cambiado de 1 a 3
            console.warn('🔑 routesService - MÚLTIPLES errores 401, token probablemente inválido/expirado');
            await TokenStorage.clearAllAuthData();
            throw new Error('Authentication failed - invalid token');
          } else if (status === 403 && consecutiveAuthErrors >= 5) { // Cambiado de 3 a 5
            console.warn('🔑 routesService - MÚLTIPLES errores 403 consecutivos, limpiando tokens...');
            await TokenStorage.clearAllAuthData();
            throw new Error('Authentication failed - multiple permission errors');
          }
          
          // Para errores 403 esporádicos, no limpiar tokens inmediatamente
          if (status === 403) {
            console.log('🔑 routesService - Error 403 (permisos), puede ser temporal. No limpiando tokens aún.');
          }
          
          // Para el primer error o errores 403, esperar y reintentar
          if (attempt < maxRetries) {
            const authDelayMs = 1000; // Solo 1s fijo
            console.log(`🔑 routesService - Esperando ${authDelayMs}ms antes de reintentar...`);
            await new Promise(resolve => setTimeout(resolve, authDelayMs));
            continue;
          }
        }
        
        // Manejar errores de red con backoff exponencial mejorado
        if (!status) {
          if (attempt < maxRetries) {
            const delayMs = 1500; // Solo 1.5s fijo
            console.log(`⏳ routesService - Esperando ${delayMs}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
        }

        // No reintentar otros errores 4xx (excepto 401/403 ya manejados)
        if (status && status >= 400 && status < 500 && status !== 401 && status !== 403) {
          break;
        }

        if (attempt === maxRetries) break;
        
        // Delay exponencial mejorado para otros errores
        const delayMs = 1000; // Solo 1s fijo
        console.log(`⏳ routesService - Esperando ${delayMs}ms antes del siguiente intento...`);
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
    const config = getApiConfig();
    const api = axios.create(config);
    await api.get('/routes/health');
    return true;
  } catch (error) {
    return false;
  }
};

export const routesService = {
  checkHealth: checkBackendHealth,

  debugTokenStorage: () => {
    TokenStorage.debugMethods();
  },

  getAvailableRoutes: async () => {
    const requestKey = 'getAvailableRoutes';

    return makeRequest(requestKey, async (api) => {
      const response = await api.get('/routes/available');
      return response.data || [];
    });
  },

  getMyRoutes: async () => {
    const requestKey = 'getMyRoutes';

    return makeRequest(requestKey, async (api) => {
      const response = await api.get('/routes/my-routes');
      return response.data || [];
    });
  },

  selectRoute: async (routeId) => {
    const requestKey = `selectRoute-${routeId}`;

    return makeRequest(requestKey, async (api) => {
      const response = await api.post(`/routes/${routeId}/assign`);
      return response.data;
    });
  },

  cancelRoute: async (routeId) => {
    const requestKey = `cancelRoute-${routeId}`;

    return makeRequest(requestKey, async (api) => {
      const response = await api.post(`/routes/${routeId}/cancel`);
      return response.data;
    });
  },

  updateRouteStatus: async (routeId, status) => {
    const requestKey = `updateRouteStatus-${routeId}-${status}`;

    return makeRequest(requestKey, async (api) => {
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

  subscribeToRoutes: (onUpdate) => {
    return () => {
      // Función de limpieza para cancelar la suscripción
    };
  }
};

export default routesService;