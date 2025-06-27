import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { routesService } from '../services/routesService';
import { useAuth } from './AuthContext';

// Acciones
export const ROUTES_ACTIONS = {
  SET_AVAILABLE_ROUTES: 'SET_AVAILABLE_ROUTES',
  SET_MY_ROUTES: 'SET_MY_ROUTES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_ROUTE_STATUS: 'UPDATE_ROUTE_STATUS'
};

// Estado inicial
const initialState = {
  availableRoutes: [],
  myRoutes: [],
  loading: false,
  error: null
};

// Reducer
const routesReducer = (state, action) => {
  switch (action.type) {
    case ROUTES_ACTIONS.SET_AVAILABLE_ROUTES:
      return {
        ...state,
        availableRoutes: action.payload,
        error: null
      };
    case ROUTES_ACTIONS.SET_MY_ROUTES:
      return {
        ...state,
        myRoutes: action.payload,
        error: null
      };
    case ROUTES_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case ROUTES_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case ROUTES_ACTIONS.UPDATE_ROUTE_STATUS:
      return {
        ...state,
        myRoutes: state.myRoutes.map(route =>
          route.id === action.payload.id
            ? { ...route, status: action.payload.status }
            : route
        ),
        availableRoutes: state.availableRoutes.map(route =>
          route.id === action.payload.id
            ? { ...route, status: action.payload.status }
            : route
        )
      };
    default:
      return state;
  }
};

// Contexto
const RoutesContext = createContext();

// Provider
export const RoutesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(routesReducer, initialState);
  const { isAuthenticated } = useAuth();
  const loadRoutesTimeoutRef = useRef(null);
  const requestsInProgress = useRef(new Set());

  // Función para debounced loading
  const debouncedLoadRoutes = () => {
    if (loadRoutesTimeoutRef.current) {
      clearTimeout(loadRoutesTimeoutRef.current);
    }
    
    loadRoutesTimeoutRef.current = setTimeout(() => {
      loadRoutes();
    }, 300); // 300ms de debounce
  };

  // Cargar rutas cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      // Debug TokenStorage methods al inicio
      routesService.debugTokenStorage();
      debouncedLoadRoutes();
    }
  }, [isAuthenticated]);

  // Cargar rutas disponibles y asignadas
  const loadRoutes = async () => {
    const requestId = 'loadRoutes';
    
    // Evitar requests duplicados
    if (requestsInProgress.current.has(requestId)) {
      console.log('🔄 LoadRoutes ya en progreso, evitando duplicado');
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      // Intentar cargar rutas pero ignorar errores 403/401
      let availableRoutes = [];
      let myRoutes = [];
      
      try {
        availableRoutes = await routesService.getAvailableRoutes();
      } catch (error) {
        console.warn('⚠️ Error cargando rutas disponibles (ignorando):', error.message);
        if (error.response?.status === 403 || error.response?.status === 401) {
          console.log('🔄 Ignorando error 403/401 en availableRoutes');
        }
      }
      
      try {
        myRoutes = await routesService.getMyRoutes();
      } catch (error) {
        console.warn('⚠️ Error cargando mis rutas (ignorando):', error.message);
        if (error.response?.status === 403 || error.response?.status === 401) {
          console.log('🔄 Ignorando error 403/401 en myRoutes');
        }
      }

      dispatch({ type: ROUTES_ACTIONS.SET_AVAILABLE_ROUTES, payload: availableRoutes });
      dispatch({ type: ROUTES_ACTIONS.SET_MY_ROUTES, payload: myRoutes });
    } catch (error) {
      console.error('❌ Error en loadRoutes:', error);
      // Solo mostrar error si no es 403/401
      if (error.response?.status !== 403 && error.response?.status !== 401) {
        dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: error.message });
      }
    } finally {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: false });
      requestsInProgress.current.delete(requestId);
    }
  };

  // Seleccionar una ruta
  const selectRoute = async (routeId) => {
    const requestId = `selectRoute-${routeId}`;
    
    if (requestsInProgress.current.has(requestId)) {
      console.log('🔄 SelectRoute ya en progreso para:', routeId);
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      await routesService.selectRoute(routeId);
      
      // Esperar un poco antes de recargar para evitar race conditions
      setTimeout(() => {
        debouncedLoadRoutes();
      }, 500);
    } catch (error) {
      console.error('❌ RoutesContext - Error en selectRoute:', error);
      
      // Si es error 403/401, no mostrarlo como error crítico
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('🔄 RoutesContext - Error 403/401 en selectRoute, pero la operación puede haber funcionado');
        // Recargar de todas formas
        setTimeout(() => debouncedLoadRoutes(), 500);
        return; // No lanzar error
      }
      
      // Para otros errores reales
      const errorMessage = error.error || error.message || 'Error al seleccionar la ruta';
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      requestsInProgress.current.delete(requestId);
    }
  };

  // Cancelar una ruta
  const cancelRoute = async (routeId) => {
    const requestId = `cancelRoute-${routeId}`;
    
    if (requestsInProgress.current.has(requestId)) {
      console.log('🔄 CancelRoute ya en progreso para:', routeId);
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
    try {
      console.log('🔄 RoutesContext - Cancelando ruta:', routeId);
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      // Validar que tenemos el routeId
      if (!routeId) {
        throw new Error('ID de ruta no válido');
      }
      
      const cancelledRoute = await routesService.cancelRoute(routeId);
      console.log('✅ RoutesContext - Ruta cancelada exitosamente');
      
      // Recargar rutas después de un delay - pero ignorar errores
      setTimeout(() => {
        debouncedLoadRoutes();
      }, 300);
      
      return cancelledRoute;
    } catch (error) {
      console.error('❌ RoutesContext - Error en cancelRoute:', error);
      
      // Si es error 403/401, no mostrarlo como error crítico
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('🔄 RoutesContext - Error 403/401 en cancelRoute, pero la operación puede haber funcionado');
        // Recargar de todas formas
        setTimeout(() => debouncedLoadRoutes(), 300);
        return null; // Retornar null en lugar de error
      }
      
      // Para otros errores reales, propagar
      const errorMessage = error.response?.data?.message || error.message || 'Error al cancelar la ruta';
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: false });
      requestsInProgress.current.delete(requestId);
    }
  };

  // Actualizar estado de una ruta
  const updateRouteStatus = async (routeId, status) => {
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      await routesService.updateRouteStatus(routeId, status);
      dispatch({
        type: ROUTES_ACTIONS.UPDATE_ROUTE_STATUS,
        payload: { id: routeId, status }
      });
      await loadRoutes(); // Recargar las rutas para asegurar sincronización
    } catch (error) {
      const errorMessage = error.error || error.message || 'Error al actualizar el estado de la ruta';
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const value = {
    ...state,
    loadRoutes,
    selectRoute,
    cancelRoute,
    updateRouteStatus
  };

  return (
    <RoutesContext.Provider value={value}>
      {children}
    </RoutesContext.Provider>
  );
};

// Hook personalizado
export const useRoutes = () => {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error('useRoutes debe ser usado dentro de un RoutesProvider');
  }
  return context;
};

export default RoutesContext; 