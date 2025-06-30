import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { routesService } from '../services/routesService';
import TokenStorage from '../services/tokenStorage';
import { useAuth } from './AuthContext';

// Acciones
export const ROUTES_ACTIONS = {
  SET_AVAILABLE_ROUTES: 'SET_AVAILABLE_ROUTES',
  SET_MY_ROUTES: 'SET_MY_ROUTES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_ROUTE_STATUS: 'UPDATE_ROUTE_STATUS',
  MARK_PACKAGE_SCANNED: 'MARK_PACKAGE_SCANNED'
};

// Estado inicial
const initialState = {
  availableRoutes: [],
  myRoutes: [],
  loading: false,
  error: null,
  scannedPackages: new Set() // IDs de paquetes que han sido escaneados
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
          route.id === action.payload.routeId
            ? { ...route, status: action.payload.status, ...action.payload.extraData }
            : route
        ),
      };
    case ROUTES_ACTIONS.MARK_PACKAGE_SCANNED:
      const newScannedPackages = new Set(state.scannedPackages);
      newScannedPackages.add(action.payload.packageId);
      
      const updatedRoutes = state.myRoutes.map(route => {
        if (route.id === action.payload.routeId) {
          const updatedPackages = route.packages?.map(pkg => {
            if (pkg.id === action.payload.packageId) {
              return { 
                ...pkg, 
                scanned: true, 
                scannedAt: new Date().toISOString(),
                ...action.payload.packageData
              };
            }
            return pkg;
          }) || [];
          
          return {
            ...route,
            packages: updatedPackages
          };
        }
        return route;
      });
      
      return {
        ...state,
        myRoutes: updatedRoutes,
        scannedPackages: newScannedPackages,
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
      debouncedLoadRoutes();
    }
  }, [isAuthenticated]);

  // Cargar rutas disponibles y asignadas
  const loadRoutes = async () => {
    const requestId = 'loadRoutes';
    
    // Evitar requests duplicados
    if (requestsInProgress.current.has(requestId)) {
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      // Verificar que tenemos un token válido antes de intentar cargar rutas
      const tokenInfo = await TokenStorage.getTokenInfo();
      if (!tokenInfo || !tokenInfo.hasToken) {
        dispatch({ type: ROUTES_ACTIONS.SET_AVAILABLE_ROUTES, payload: [] });
        dispatch({ type: ROUTES_ACTIONS.SET_MY_ROUTES, payload: [] });
        return;
      }
      
      if (tokenInfo.isExpired) {
        await TokenStorage.clearAllAuthData();
        dispatch({ type: ROUTES_ACTIONS.SET_AVAILABLE_ROUTES, payload: [] });
        dispatch({ type: ROUTES_ACTIONS.SET_MY_ROUTES, payload: [] });
        return;
      }
      
      // Intentar cargar rutas pero manejar errores graciosamente
      let availableRoutes = [];
      let myRoutes = [];
      let authErrorCount = 0;
      
      // Cargar rutas disponibles
      try {
        availableRoutes = await routesService.getAvailableRoutes();
      } catch (error) {
        const status = error.response?.status;
        if (status === 403 || status === 401) {
          authErrorCount++;
        }
      }
      
      // Cargar mis rutas
      try {
        myRoutes = await routesService.getMyRoutes();
      } catch (error) {
        const status = error.response?.status;
        if (status === 403 || status === 401) {
          authErrorCount++;
        }
      }
      
      // Si tenemos múltiples errores de autenticación, limpiar tokens
      if (authErrorCount >= 2) {
        await TokenStorage.clearAllAuthData();
        availableRoutes = [];
        myRoutes = [];
      }

      // Asegurar que las rutas tengan estructura de paquetes
      const processedMyRoutes = (myRoutes || []).map(route => ({
        ...route,
        packages: route.packages || [] // Asegurar que existe array de paquetes
      }));

      dispatch({ type: ROUTES_ACTIONS.SET_AVAILABLE_ROUTES, payload: availableRoutes || [] });
      dispatch({ type: ROUTES_ACTIONS.SET_MY_ROUTES, payload: processedMyRoutes });
      
    } catch (error) {
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: error.message });
      
      // Asegurar que tenemos arrays vacíos en lugar de null/undefined
      dispatch({ type: ROUTES_ACTIONS.SET_AVAILABLE_ROUTES, payload: [] });
      dispatch({ type: ROUTES_ACTIONS.SET_MY_ROUTES, payload: [] });
    } finally {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: false });
      requestsInProgress.current.delete(requestId);
    }
  };

  // Seleccionar una ruta
  const selectRoute = async (routeId) => {
    const requestId = `selectRoute-${routeId}`;
    
    if (requestsInProgress.current.has(requestId)) {
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
      // Si es error 403/401, no mostrarlo como error crítico
      if (error.response?.status === 403 || error.response?.status === 401) {
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
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      // Validar que tenemos el routeId
      if (!routeId) {
        throw new Error('ID de ruta no válido');
      }
      
      const cancelledRoute = await routesService.cancelRoute(routeId);
      
      // Recargar rutas después de un delay - pero ignorar errores
      setTimeout(() => {
        debouncedLoadRoutes().catch(() => {
          // Ignorar errores de recarga
        });
      }, 300);
      
      return cancelledRoute;
    } catch (error) {
      // Si es error 403/401, no mostrarlo como error crítico
      if (error.response?.status === 403 || error.response?.status === 401) {
        setTimeout(() => debouncedLoadRoutes(), 300);
        return null; // Retornar null en lugar de error
      }
      
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: false });
      requestsInProgress.current.delete(requestId);
    }
  };

  // Actualizar estado de ruta
  const updateRouteStatus = async (routeId, status, extraData = {}) => {
    const requestId = `updateRouteStatus-${routeId}-${status}`;
    
    if (requestsInProgress.current.has(requestId)) {
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
    try {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      // Actualizar estado local inmediatamente
      dispatch({ 
        type: ROUTES_ACTIONS.UPDATE_ROUTE_STATUS, 
        payload: { routeId, status, extraData }
      });
      
    } catch (error) {
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: 'Error al actualizar el estado de la ruta' });
      throw error;
    } finally {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: false });
      requestsInProgress.current.delete(requestId);
    }
  };

  // Obtener ruta por ID
  const getRouteById = (routeId) => {
    const allRoutes = [...state.availableRoutes, ...state.myRoutes];
    return allRoutes.find(route => route.id === routeId);
  };

  // Verificar si una ruta está asignada al usuario
  const isRouteAssigned = (routeId) => {
    return state.myRoutes.some(route => route.id === routeId);
  };

  // Marcar paquete como escaneado
  const markPackageScanned = (routeId, packageId, packageData = {}) => {
    const newScannedPackages = new Set(state.scannedPackages);
    newScannedPackages.add(packageId);
    
    const updatedRoutes = state.myRoutes.map(route => {
      if (route.id === routeId) {
        const updatedPackages = route.packages?.map(pkg => {
          if (pkg.id === packageId) {
            return { 
              ...pkg, 
              scanned: true, 
              scannedAt: new Date().toISOString(),
              // AGREGAR datos del paquete escaneado (incluye verificationCode)
              ...packageData
            };
          }
          return pkg;
        }) || [];
        
        return {
          ...route,
          packages: updatedPackages
        };
      }
      return route;
    });
    
    dispatch({ 
      type: ROUTES_ACTIONS.MARK_PACKAGE_SCANNED, 
      payload: { 
        routeId, 
        packageId, 
        packageData 
      } 
    });
  };

  // Verificar si un paquete ha sido escaneado
  const isPackageScanned = (packageId) => {
    return state.scannedPackages.has(packageId);
  };

  const value = {
    ...state,
    loadRoutes,
    selectRoute,
    cancelRoute,
    updateRouteStatus,
    getRouteById,
    isRouteAssigned,
    markPackageScanned,
    isPackageScanned
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