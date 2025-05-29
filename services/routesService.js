import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error en interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('routesService: Error en respuesta:', error);
    return Promise.reject(error);
  }
);

export const routesService = {
  // Obtener todas las rutas disponibles
  getAvailableRoutes: async () => {
    try {
      const response = await api.get('/routes/available');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener rutas disponibles' };
    }
  },

  // Obtener las rutas asignadas al repartidor actual
  getMyRoutes: async () => {
    try {
      const response = await api.get('/routes/my-routes');
      return response.data;
    } catch (error) {
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
      const response = await api.put(`/routes/${routeId}/status`, { status });
      return response.data;
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