<<<<<<< Updated upstream
import React, { createContext, useContext, useEffect, useReducer } from 'react';
=======
import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
>>>>>>> Stashed changes
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
        availableRoutes: Array.isArray(action.payload) ? action.payload : [],
        error: null
      };
    case ROUTES_ACTIONS.SET_MY_ROUTES:
      return {
        ...state,
        myRoutes: Array.isArray(action.payload) ? action.payload : [],
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
<<<<<<< Updated upstream

  // Cargar rutas cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadRoutes();
    }
  }, [isAuthenticated]);

  // Cargar rutas disponibles y asignadas
  const loadRoutes = async () => {
=======
  const loadRoutesTimeoutRef = useRef(null);
  const requestsInProgress = useRef(new Set());

  // Cargar rutas disponibles y asignadas
  const loadRoutes = useCallback(async () => {
    const requestId = 'loadRoutes';
    
    // Evitar requests duplicados
    if (requestsInProgress.current.has(requestId)) {
      console.log('🔄 LoadRoutes ya en progreso, evitando duplicado');
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
>>>>>>> Stashed changes
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      const [availableRoutes, myRoutes] = await Promise.all([
        routesService.getAvailableRoutes(),
        routesService.getMyRoutes()
      ]);

      // Filtrar rutas que tengan id válido
      const validAvailableRoutes = Array.isArray(availableRoutes) 
        ? availableRoutes.filter(route => route && route.id != null)
        : [];
      
      const validMyRoutes = Array.isArray(myRoutes) 
        ? myRoutes.filter(route => route && route.id != null)
        : [];

      dispatch({ type: ROUTES_ACTIONS.SET_AVAILABLE_ROUTES, payload: validAvailableRoutes });
      dispatch({ type: ROUTES_ACTIONS.SET_MY_ROUTES, payload: validMyRoutes });
    } catch (error) {
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Función para debounced loading
  const debouncedLoadRoutes = useCallback(() => {
    if (loadRoutesTimeoutRef.current) {
      clearTimeout(loadRoutesTimeoutRef.current);
    }
    
    loadRoutesTimeoutRef.current = setTimeout(() => {
      loadRoutes();
    }, 300); // 300ms de debounce
  }, [loadRoutes]);

  // Cargar rutas cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      // Debug TokenStorage methods al inicio
      routesService.debugTokenStorage();
      debouncedLoadRoutes();
    }
  }, [isAuthenticated, debouncedLoadRoutes]);

  // Seleccionar una ruta
<<<<<<< Updated upstream
  const selectRoute = async (routeId) => {
=======
  const selectRoute = useCallback(async (routeId) => {
    const requestId = `selectRoute-${routeId}`;
    
    if (requestsInProgress.current.has(requestId)) {
      console.log('🔄 SelectRoute ya en progreso para:', routeId);
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
>>>>>>> Stashed changes
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      await routesService.selectRoute(routeId);
      await loadRoutes();
    } catch (error) {
      const errorMessage = error.error || error.message || 'Error al seleccionar la ruta';
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, [dispatch, debouncedLoadRoutes]);

  // Cancelar una ruta
<<<<<<< Updated upstream
  const cancelRoute = async (routeId) => {
=======
  const cancelRoute = useCallback(async (routeId) => {
    const requestId = `cancelRoute-${routeId}`;
    
    if (requestsInProgress.current.has(requestId)) {
      console.log('🔄 CancelRoute ya en progreso para:', routeId);
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
>>>>>>> Stashed changes
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      await routesService.cancelRoute(routeId);
      await loadRoutes();
    } catch (error) {
      const errorMessage = error.error || error.message || 'Error al cancelar la ruta';
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, [dispatch, debouncedLoadRoutes]);

  // Actualizar estado de una ruta
  const updateRouteStatus = useCallback(async (routeId, status) => {
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      await routesService.updateRouteStatus(routeId, status);
      dispatch({
        type: ROUTES_ACTIONS.UPDATE_ROUTE_STATUS,
        payload: { id: routeId, status }
      });
      // Usar debouncedLoadRoutes en lugar de loadRoutes directo
      setTimeout(() => {
        debouncedLoadRoutes();
      }, 300);
    } catch (error) {
      const errorMessage = error.error || error.message || 'Error al actualizar el estado de la ruta';
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, [dispatch, debouncedLoadRoutes]);

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