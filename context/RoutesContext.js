import React, { createContext, useContext, useEffect, useReducer } from 'react';
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

  // Cargar rutas cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadRoutes();
    }
  }, [isAuthenticated]);

  // Cargar rutas disponibles y asignadas
  const loadRoutes = async () => {
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      const [availableRoutes, myRoutes] = await Promise.all([
        routesService.getAvailableRoutes(),
        routesService.getMyRoutes()
      ]);

      dispatch({ type: ROUTES_ACTIONS.SET_AVAILABLE_ROUTES, payload: availableRoutes });
      dispatch({ type: ROUTES_ACTIONS.SET_MY_ROUTES, payload: myRoutes });
    } catch (error) {
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Seleccionar una ruta
  const selectRoute = async (routeId) => {
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      await routesService.selectRoute(routeId);
      await loadRoutes();
    } catch (error) {
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Cancelar una ruta
  const cancelRoute = async (routeId) => {
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      await routesService.cancelRoute(routeId);
      await loadRoutes();
    } catch (error) {
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
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
    } catch (error) {
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
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