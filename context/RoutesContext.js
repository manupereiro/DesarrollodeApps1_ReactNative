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
  MARK_PACKAGE_SCANNED: 'MARK_PACKAGE_SCANNED',
  SCAN_QR_SUCCESS: 'SCAN_QR_SUCCESS',
  CONFIRM_DELIVERY_SUCCESS: 'CONFIRM_DELIVERY_SUCCESS'
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
      console.log('🔄 REDUCER: Actualizando estado de ruta:', action.payload);
      return {
        ...state,
        myRoutes: state.myRoutes.map(route =>
          route.id === action.payload.id
            ? { 
                ...route, 
                status: action.payload.status,
                // PRESERVAR packages y propiedades scanned
                packages: route.packages || [],
                // AGREGAR código de verificación si se proporciona
                ...(action.payload.verificationCode && { 
                  confirmationCode: action.payload.verificationCode,
                  verificationCode: action.payload.verificationCode 
                }),
                // AGREGAR timestamps
                ...(action.payload.startedAt && { 
                  startedAt: action.payload.startedAt,
                  startedDate: action.payload.startedDate,
                  startedTime: action.payload.startedTime
                }),
                ...(action.payload.completedAt && { 
                  completedAt: action.payload.completedAt,
                  completedDate: action.payload.completedDate,
                  completedTime: action.payload.completedTime
                })
              }
            : route
        ),
        availableRoutes: state.availableRoutes.map(route =>
          route.id === action.payload.id
            ? { 
                ...route, 
                status: action.payload.status,
                ...(action.payload.verificationCode && { 
                  confirmationCode: action.payload.verificationCode,
                  verificationCode: action.payload.verificationCode 
                }),
                // AGREGAR timestamps
                ...(action.payload.startedAt && { 
                  startedAt: action.payload.startedAt,
                  startedDate: action.payload.startedDate,
                  startedTime: action.payload.startedTime
                }),
                ...(action.payload.completedAt && { 
                  completedAt: action.payload.completedAt,
                  completedDate: action.payload.completedDate,
                  completedTime: action.payload.completedTime
                })
              }
            : route
        )
      };
    case ROUTES_ACTIONS.MARK_PACKAGE_SCANNED:
      console.log('🔄 REDUCER: Procesando MARK_PACKAGE_SCANNED:', action.payload);
      console.log('🔄 REDUCER: Estado actual myRoutes:', state.myRoutes.length);
      
      const newScannedPackages = new Set(state.scannedPackages);
      newScannedPackages.add(action.payload.packageId);
      
      const updatedRoutes = state.myRoutes.map(route => {
        if (route.id === action.payload.routeId) {
          console.log(`🔄 REDUCER: Actualizando ruta ${route.id} con ${route.packages?.length || 0} paquetes`);
          
          const updatedPackages = route.packages?.map(pkg => {
            if (pkg.id === action.payload.packageId) {
              console.log(`✅ REDUCER: Marcando paquete ${pkg.id} como escaneado`);
              return { 
                ...pkg, 
                scanned: true, 
                scannedAt: new Date().toISOString(),
                // AGREGAR datos del paquete escaneado (incluye verificationCode)
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
      
      console.log('✅ REDUCER: Estado actualizado con paquete escaneado');
      
      return {
        ...state,
        scannedPackages: newScannedPackages,
        myRoutes: updatedRoutes
      };
    case ROUTES_ACTIONS.SCAN_QR_SUCCESS:
      console.log('🔄 REDUCER: Procesando SCAN_QR_SUCCESS:', action.payload);
      return {
        ...state,
        myRoutes: state.myRoutes.map(route =>
          route.id === action.payload.routeId
            ? { 
                ...route, 
                status: 'IN_PROGRESS',
                confirmationCode: action.payload.confirmationCode,
                verificationCode: action.payload.confirmationCode,
                // Marcar paquete como escaneado
                packages: route.packages?.map(pkg =>
                  pkg.id === action.payload.packageId
                    ? { 
                        ...pkg, 
                        scanned: true, 
                        scannedAt: new Date().toISOString(),
                        confirmationCode: action.payload.confirmationCode,
                        verificationCode: action.payload.confirmationCode
                      }
                    : pkg
                ) || []
              }
            : route
        ),
        availableRoutes: state.availableRoutes.map(route =>
          route.id === action.payload.routeId
            ? { 
                ...route, 
                status: 'IN_PROGRESS',
                confirmationCode: action.payload.confirmationCode,
                verificationCode: action.payload.confirmationCode
              }
            : route
        )
      };
    case ROUTES_ACTIONS.CONFIRM_DELIVERY_SUCCESS:
      console.log('🔄 REDUCER: Procesando CONFIRM_DELIVERY_SUCCESS:', action.payload);
      return {
        ...state,
        myRoutes: state.myRoutes.map(route =>
          route.id === action.payload.routeId
            ? { 
                ...route, 
                status: 'COMPLETED',
                completedAt: new Date().toISOString(),
                completedDate: new Date().toLocaleDateString(),
                completedTime: new Date().toLocaleTimeString()
              }
            : route
        ),
        availableRoutes: state.availableRoutes.map(route =>
          route.id === action.payload.routeId
            ? { 
                ...route, 
                status: 'COMPLETED',
                completedAt: new Date().toISOString(),
                completedDate: new Date().toLocaleDateString(),
                completedTime: new Date().toLocaleTimeString()
              }
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
      
      // Verificar que tenemos un token válido antes de intentar cargar rutas
      const tokenInfo = await TokenStorage.getTokenInfo();
      if (!tokenInfo || !tokenInfo.hasToken) {
        console.warn('⚠️ RoutesContext: No hay token válido, omitiendo carga de rutas');
        dispatch({ type: ROUTES_ACTIONS.SET_AVAILABLE_ROUTES, payload: [] });
        dispatch({ type: ROUTES_ACTIONS.SET_MY_ROUTES, payload: [] });
        return;
      }
      
      if (tokenInfo.isExpired) {
        console.warn('⚠️ RoutesContext: Token expirado, limpiando datos...');
        await TokenStorage.clearAllAuthData();
        dispatch({ type: ROUTES_ACTIONS.SET_AVAILABLE_ROUTES, payload: [] });
        dispatch({ type: ROUTES_ACTIONS.SET_MY_ROUTES, payload: [] });
        return;
      }
      
      console.log('🔍 RoutesContext: Token válido, cargando rutas...');
      
      // Intentar cargar rutas pero manejar errores graciosamente
      let availableRoutes = [];
      let myRoutes = [];
      let authErrorCount = 0;
      
      // Cargar rutas disponibles
      try {
        availableRoutes = await routesService.getAvailableRoutes();
        console.log('🔍 RoutesContext - Rutas disponibles recibidas:', availableRoutes?.length || 0);
        if (availableRoutes && availableRoutes.length > 0) {
          console.log('🔍 RoutesContext - Primera ruta:', {
            id: availableRoutes[0]?.id,
            origin: availableRoutes[0]?.origin,
            destination: availableRoutes[0]?.destination,
            distance: availableRoutes[0]?.distance
          });
        }
      } catch (error) {
        const status = error.response?.status;
        console.warn('⚠️ RoutesContext: Error cargando rutas disponibles:', {
          message: error.message,
          status,
          isAuthError: status === 401 || status === 403
        });
        
        if (status === 403 || status === 401) {
          authErrorCount++;
          console.log('🔄 RoutesContext: Ignorando error de autenticación en availableRoutes');
        }
      }
      
      // Cargar mis rutas
      try {
        myRoutes = await routesService.getMyRoutes();
        console.log('🔍 RoutesContext - Mis rutas recibidas:', myRoutes?.length || 0);
      } catch (error) {
        const status = error.response?.status;
        console.warn('⚠️ RoutesContext: Error cargando mis rutas:', {
          message: error.message,
          status,
          isAuthError: status === 401 || status === 403
        });
        
        if (status === 403 || status === 401) {
          authErrorCount++;
          console.log('🔄 RoutesContext: Ignorando error de autenticación en myRoutes');
        }
      }
      
      // Si tenemos múltiples errores de autenticación, limpiar tokens
      if (authErrorCount >= 2) {
        console.warn('🔑 RoutesContext: Múltiples errores de autenticación, limpiando tokens...');
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
      
      console.log('✅ RoutesContext: Rutas cargadas exitosamente:', {
        availableCount: availableRoutes?.length || 0,
        myRoutesCount: myRoutes?.length || 0,
        authErrors: authErrorCount
      });
      
    } catch (error) {
      console.error('❌ RoutesContext: Error general cargando rutas:', error);
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

  // Actualizar estado de ruta
  const updateRouteStatus = async (routeId, status, extraData = {}) => {
    const requestId = `updateRouteStatus-${routeId}-${status}`;
    
    if (requestsInProgress.current.has(requestId)) {
      console.log('🔄 UpdateRouteStatus ya en progreso para:', routeId, status);
      return;
    }
    
    requestsInProgress.current.add(requestId);
    
    try {
      console.log('🔄 RoutesContext - Actualizando estado de ruta:', { routeId, status, extraData });
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      // NUEVA LÓGICA: IN_PROGRESS solo local, COMPLETED directo de ASSIGNED
      if (status === 'IN_PROGRESS') {
        console.log('🔄 RoutesContext - IN_PROGRESS es solo local, NO enviando al backend');
        dispatch({ 
          type: ROUTES_ACTIONS.UPDATE_ROUTE_STATUS, 
          payload: { 
            id: routeId, 
            status: 'IN_PROGRESS',
            ...extraData,
            // Marcar como cambio solo local
            localOnly: true,
            updatedAt: new Date().toISOString()
          } 
        });
        console.log('✅ RoutesContext - Estado IN_PROGRESS actualizado SOLO localmente');
        return;
      }
      
      // Para COMPLETED y otros estados, intentar actualizar en el backend
      try {
        console.log('🔄 RoutesContext - Enviando actualización al backend...');
        const backendResponse = await routesService.updateRouteStatus(routeId, status);
        console.log('✅ RoutesContext - Backend actualizado exitosamente:', backendResponse);
        
        // Actualizar estado local con los datos del backend + extraData local
        dispatch({ 
          type: ROUTES_ACTIONS.UPDATE_ROUTE_STATUS, 
          payload: { 
            id: routeId, 
            status, 
            ...extraData,
            // Incluir datos del backend si están disponibles
            ...(backendResponse && backendResponse.updatedAt && {
              updatedAt: backendResponse.updatedAt
            })
          } 
        });
        
        console.log('✅ RoutesContext - Estado de ruta actualizado exitosamente en backend y localmente');
        
      } catch (backendError) {
        console.warn('⚠️ RoutesContext - Error del backend, continuando con actualización local:', backendError.message);
        
        // Para COMPLETED, SIEMPRE actualizar localmente sin importar el error
        if (status === 'COMPLETED') {
          console.log('🔄 RoutesContext - Completando entrega localmente a pesar del error del backend');
          dispatch({ 
            type: ROUTES_ACTIONS.UPDATE_ROUTE_STATUS, 
            payload: { 
              id: routeId, 
              status: 'COMPLETED',
              ...extraData,
              // Marcar como completado localmente
              completedLocally: true,
              completedAt: extraData.completedAt || new Date().toISOString()
            } 
          });
          
          console.log('✅ RoutesContext - Entrega marcada como completada localmente');
          return; // Salir exitosamente SIN propagar error
        } else {
          // Para otros estados, también actualizar localmente pero logueando la diferencia
          console.log(`🔄 RoutesContext - Actualizando estado ${status} localmente a pesar del error del backend`);
          dispatch({ 
            type: ROUTES_ACTIONS.UPDATE_ROUTE_STATUS, 
            payload: { 
              id: routeId, 
              status,
              ...extraData,
              // Marcar como actualizado localmente
              updatedLocally: true,
              updatedAt: new Date().toISOString()
            } 
          });
          
          console.log('✅ RoutesContext - Estado actualizado localmente');
          return; // Salir exitosamente SIN propagar error
        }
      }
      
    } catch (error) {
      // Este catch solo debería activarse para errores muy críticos que no se pudieron manejar arriba
      console.error('❌ RoutesContext - Error crítico inesperado:', error);
      
      // Incluso en caso de error crítico, intentar actualizar localmente
      console.log('🔄 RoutesContext - Intentando actualización local como último recurso...');
      try {
        dispatch({ 
          type: ROUTES_ACTIONS.UPDATE_ROUTE_STATUS, 
          payload: { 
            id: routeId, 
            status,
            ...extraData,
            // Marcar como actualizado localmente por error crítico
            updatedLocally: true,
            criticalError: true,
            updatedAt: new Date().toISOString()
          } 
        });
        console.log('✅ RoutesContext - Actualización local de emergencia exitosa');
      } catch (localError) {
        console.error('❌ RoutesContext - Error incluso en actualización local:', localError);
        const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el estado de la ruta';
        dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: errorMessage });
      }
      
      // NO propagar el error para evitar romper la UI
      console.log('🛡️ RoutesContext - Error manejado, no propagando para preservar UX');
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
    console.log('🔥 CRÍTICO - markPackageScanned EJECUTÁNDOSE:', { routeId, packageId });
    console.log('🔥 CRÍTICO - Estado ANTES de marcar:', {
      myRoutesCount: state.myRoutes.length,
      scannedPackagesCount: state.scannedPackages.size,
      scannedPackagesList: Array.from(state.scannedPackages)
    });
    
    // Buscar la ruta actual para debug DETALLADO
    const currentRoute = state.myRoutes.find(r => r.id === routeId);
    if (currentRoute) {
      console.log('🔥 CRÍTICO - Ruta encontrada ANTES:', {
        id: currentRoute.id,
        status: currentRoute.status,
        packagesCount: currentRoute.packages?.length || 0,
        packages: currentRoute.packages?.map(pkg => ({
          id: pkg.id,
          scanned: pkg.scanned,
          description: pkg.description
        })) || []
      });
    } else {
      console.log('❌ CRÍTICO - Ruta NO encontrada:', routeId);
      console.log('❌ CRÍTICO - Rutas disponibles:', state.myRoutes.map(r => ({ id: r.id, status: r.status })));
      return; // No hacer nada si no se encuentra la ruta
    }
    
    // Ejecutar dispatch
    dispatch({ 
      type: ROUTES_ACTIONS.MARK_PACKAGE_SCANNED, 
      payload: { 
        routeId, 
        packageId,
        packageData 
      } 
    });
    
    // Debug INMEDIATO después del dispatch
    setTimeout(() => {
      const updatedRoute = state.myRoutes.find(r => r.id === routeId);
      console.log('🔥 CRÍTICO - Estado DESPUÉS de marcar:', {
        rutaEncontrada: !!updatedRoute,
        paquetesCount: updatedRoute?.packages?.length || 0,
        paquetesEscaneados: updatedRoute?.packages?.filter(pkg => pkg.scanned).length || 0,
        scannedPackagesSize: state.scannedPackages.size
      });
    }, 100);
    
    console.log('✅ RoutesContext - Dispatch ejecutado exitosamente');
  };

  // Verificar si un paquete ha sido escaneado
  const isPackageScanned = (packageId) => {
    return state.scannedPackages.has(packageId);
  };

  // Escanear QR - NUEVO MÉTODO CON BACKEND REAL
  const scanQR = async (qrImageBase64) => {
    try {
      console.log('🔄 RoutesContext - Escaneando QR con backend real (Base64):', qrImageBase64.substring(0, 100) + '...');
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      const result = await routesService.scanQR(qrImageBase64);
      
      console.log('✅ RoutesContext - QR escaneado exitosamente:', result);
      
      // Actualizar estado con los datos del backend
      dispatch({ 
        type: ROUTES_ACTIONS.SCAN_QR_SUCCESS, 
        payload: {
          routeId: result.routeId,
          packageId: result.packageId,
          confirmationCode: result.confirmationCode,
          message: result.message
        } 
      });
      
      return result;
    } catch (error) {
      console.error('❌ RoutesContext - Error escaneando QR:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al escanear el QR';
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Confirmar entrega - NUEVO MÉTODO CON BACKEND REAL
  const confirmDelivery = async (routeId, confirmationCode) => {
    try {
      console.log('🔄 RoutesContext - Confirmando entrega con backend real:', { routeId, confirmationCode });
      dispatch({ type: ROUTES_ACTIONS.SET_LOADING, payload: true });
      
      const result = await routesService.confirmDelivery(routeId, confirmationCode);
      
      console.log('✅ RoutesContext - Entrega confirmada exitosamente:', result);
      
      // Actualizar estado a COMPLETED
      dispatch({ 
        type: ROUTES_ACTIONS.CONFIRM_DELIVERY_SUCCESS, 
        payload: {
          routeId: routeId,
          message: 'Entrega confirmada exitosamente'
        } 
      });
      
      return result;
    } catch (error) {
      console.error('❌ RoutesContext - Error confirmando entrega:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al confirmar la entrega';
      dispatch({ type: ROUTES_ACTIONS.SET_ERROR, payload: errorMessage });
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
    updateRouteStatus,
    getRouteById,
    isRouteAssigned,
    markPackageScanned,
    isPackageScanned,
    scanQR,
    confirmDelivery
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