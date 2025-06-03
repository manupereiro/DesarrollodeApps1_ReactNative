import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

const api = axios.create(getApiConfig());

// Interceptor para agregar el token a las requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await TokenStorage.getToken();
      console.log('🔑 routesService - Token disponible:', token ? 'Sí' : 'No');
      if (token) {
        // Log detallado del token
        const tokenParts = token.split('.');
        console.log('🔑 routesService - Token details:', {
          header: tokenParts[0],
          payload: tokenParts[1],
          signature: tokenParts[2] ? 'Presente' : 'Ausente',
          length: token.length,
          fullToken: token
        });

        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 routesService - Headers de la petición:', {
          url: config.url,
          method: config.method,
          headers: {
            ...config.headers,
            Authorization: 'Bearer [TOKEN]' // Ocultamos el token real en los logs
          }
        });
      } else {
        console.warn('⚠️ routesService - No se encontró token para la petición');
      }
    } catch (error) {
      console.error('❌ routesService - Error en interceptor:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ routesService - Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('✅ routesService - Respuesta exitosa:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ routesService - Error en respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.config?.headers
    });
    return Promise.reject(error);
  }
);

export const routesService = {
  // Obtener todas las rutas disponibles
  getAvailableRoutes: async () => {
    try {
      console.log('🔄 routesService - Obteniendo rutas disponibles...');
      const response = await api.get('/routes/available');
      console.log('✅ routesService - Rutas disponibles obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ routesService - Error al obtener rutas disponibles:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || { error: 'Error al obtener rutas disponibles' };
    }
  },

  // Obtener las rutas asignadas al repartidor actual
  getMyRoutes: async () => {
    try {
      console.log('🔄 routesService - Obteniendo mis rutas...');
      const response = await api.get('/routes/my-routes');
      console.log('✅ routesService - Mis rutas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ routesService - Error al obtener mis rutas:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || { error: 'Error al obtener mis rutas' };
    }
  },

  // Elegir una ruta
  selectRoute: async (routeId) => {
    try {
      const response = await api.post(`/routes/${routeId}/assign`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al seleccionar la ruta' };
    }
  },

  // Cancelar una ruta
  cancelRoute: async (routeId) => {
    try {
      const response = await api.post(`/routes/${routeId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al cancelar la ruta' };
    }
  },

  // Actualizar estado de una ruta
  updateRouteStatus: async (routeId, status) => {
    try {
      let endpoint;
      if (status === 'COMPLETED') {
        endpoint = `/routes/${routeId}/complete`;
        const response = await api.post(endpoint);
        return response.data;
      } else {
        endpoint = `/routes/${routeId}/status`;
        const response = await api.put(endpoint, { status });
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { error: 'Error al actualizar el estado de la ruta' };
    }
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