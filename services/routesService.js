import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

// Crear instancia con configuración mejorada
const createApiInstance = async () => {
  const config = getApiConfig();
  const token = await TokenStorage.getToken();
  
  return axios.create({
    ...config,
    headers: {
      ...config.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

// Pool de requests en progreso para evitar duplicados
const requestsInProgress = new Map();

// Función para hacer requests con retry y deduplicación
const makeRequest = async (requestKey, requestFn, maxRetries = 3) => {
  // Evitar requests duplicados
  if (requestsInProgress.has(requestKey)) {
    console.log('🔄 routesService - Request ya en progreso, evitando duplicado:', requestKey);
    return requestsInProgress.get(requestKey);
  }

  const requestPromise = (async () => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 routesService - Intento ${attempt}/${maxRetries} para:`, requestKey);
        
        const api = await createApiInstance();
        const result = await requestFn(api);
        
        console.log('✅ routesService - Request exitoso:', requestKey);
        return result;
        
      } catch (error) {
        lastError = error;
        console.log(`❌ routesService - Error en intento ${attempt}:`, error.message);
        
        // Manejar errores de autenticación de forma MUY permisiva
        const status = error.response?.status;
        if (status === 401) {
          console.log('🔑 routesService - Error 401, pero continuando...');
          // NO limpiar tokens automáticamente - solo loguear
        } else if (status === 403) {
          console.log('🔑 routesService - Error 403, pero continuando...');
          // NO limpiar tokens automáticamente - solo loguear
        }
        
        // No reintentar otros errores 4xx
        if (status && status >= 400 && status < 500) {
          console.log('🚫 routesService - Error no reintentable:', status);
          break;
        }
        
        // Si es el último intento, salir
        if (attempt === maxRetries) break;
        
        // Delay exponencial
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
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

// Función para validar token con margen de gracia
const validateToken = async () => {
  try {
    const token = await TokenStorage.getToken();
    if (!token) {
      console.warn('⚠️ routesService - No hay token disponible');
      return false;
    }
    
    // Verificar que el token no esté expirado
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('⚠️ routesService - Token malformado');
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp) {
        // Agregar margen de 5 minutos (300 segundos) para evitar problemas de sincronización
        const expirationWithBuffer = payload.exp - 300;
        
        if (expirationWithBuffer < now) {
          const timeUntilExpiry = payload.exp - now;
          console.warn(`⚠️ routesService - Token expirado o próximo a expirar (${timeUntilExpiry}s)`);
          
          if (typeof TokenStorage.clearAllAuthData === 'function') {
            await TokenStorage.clearAllAuthData();
          } else {
            console.error('❌ routesService - clearAllAuthData no es una función en validateToken, usando clearAll como fallback');
            await TokenStorage.clearAll();
          }
          
          return false;
        } else {
          const timeUntilExpiry = payload.exp - now;
          console.log(`✅ routesService - Token válido (expira en ${Math.floor(timeUntilExpiry/60)} minutos)`);
        }
      }
    } catch (parseError) {
      console.warn('⚠️ routesService - Error al parsear token:', parseError);
      return false;
    }
    
    console.log('✅ routesService - Token válido');
    return true;
  } catch (error) {
    console.error('❌ routesService - Error validando token:', error);
    return false;
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
      
      // Debug: mostrar la respuesta completa
      console.log('🔍 routesService - Respuesta completa del servidor:', JSON.stringify(response.data, null, 2));
      
      // Debug: mostrar detalles de las primeras rutas
      if (response.data && response.data.length > 0) {
        for (let i = 0; i < Math.min(3, response.data.length); i++) {
          const route = response.data[i];
          console.log(`🔍 routesService - Ruta ${i+1}:`, {
            id: route?.id,
            origin: route?.origin,
            destination: route?.destination,
            distance: route?.distance,
            status: route?.status,
            estimatedDuration: route?.estimatedDuration,
            packageInfo: route?.packageInfo
          });
        }
      } else {
        console.warn('⚠️ routesService - No se recibieron rutas o el array está vacío');
      }
      
      return response.data;
    });
  },

  // Obtener las rutas asignadas al repartidor actual
  getMyRoutes: async () => {
    const requestKey = 'getMyRoutes';
    
    return makeRequest(requestKey, async (api) => {
      console.log('🔄 routesService - Obteniendo mis rutas...');
      const response = await api.get('/routes/my-routes');
      console.log('✅ routesService - Mis rutas obtenidas:', response.data);
      return response.data;
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