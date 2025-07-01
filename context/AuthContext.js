import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authApi } from '../services/authApi';
import TokenStorage from '../services/tokenStorage';
import longPollingService from '../services/longPollingService';

// Estados iniciales
const initialState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  pendingVerification: null,
};

// Tipos de acciones
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_PENDING_VERIFICATION: 'SET_PENDING_VERIFICATION',
  CLEAR_PENDING_VERIFICATION: 'CLEAR_PENDING_VERIFICATION',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_PENDING_VERIFICATION:
      return {
        ...state,
        pendingVerification: action.payload,
      };
    case AUTH_ACTIONS.CLEAR_PENDING_VERIFICATION:
      return {
        ...state,
        pendingVerification: null,
      };
    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token al iniciar la app
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Delay inicial para evitar race conditions al inicio de la app
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { token, userData } = await TokenStorage.getAuthData();
      
      if (token) {
        // Delay adicional para asegurar que otros servicios estén listos
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Configurar y iniciar Long Polling Service
        const longPollingService = (await import('../services/longPollingService')).default;
        longPollingService.setAuthToken(token);
        longPollingService.setPollingInterval(30000); // 30 segundos
        await longPollingService.start();
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { token, user: userData },
        });
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('AuthContext: Error al verificar estado de autenticación:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const login = async (credentials) => {
    try {
      if (!credentials.username || !credentials.password) {
        throw new Error('Usuario y contraseña son requeridos');
      }
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      // Llamar a authApi.login con el objeto credentials
      const response = await authApi.login(credentials);

      console.log('AuthContext: Guardando token y datos de usuario...');
      await TokenStorage.setAuthData(response.token, response.user || null);
      
      // Verificar que el token se guardó correctamente
      const { token: savedToken, userData: savedUserData } = await TokenStorage.getAuthData();
      
      // Configurar y iniciar Long Polling Service
      longPollingService.setAuthToken(response.token);
      await longPollingService.start();
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token: response.token,
          user: response.user || null,
        },
      });
      
      return response;
    } catch (error) {
      console.error('AuthContext: Error en login:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Detener Long Polling Service
      const longPollingService = (await import('../services/longPollingService')).default;
      longPollingService.stop();
      
      // Primero limpiamos el almacenamiento local
      await TokenStorage.clearAll();  
      // Finalmente actualizamos el estado
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      // Si algo falla, aún así limpiamos el estado local
      longPollingService.stop(); // Asegurar que se detenga el servicio
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authApi.signup(userData);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      dispatch({ type: AUTH_ACTIONS.SET_PENDING_VERIFICATION, payload: userData.email });
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const verifyAccount = async (verificationData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authApi.verifyAccount(verificationData);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authApi.forgotPassword(email);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const verifyResetCode = async (verificationData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authApi.verifyResetCode(verificationData);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const resetPassword = async (resetData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authApi.resetPassword(resetData);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const resendCode = async (resendData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authApi.resendCode(resendData);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const value = {
    state,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    pendingVerification: state.pendingVerification,
    login,
    logout,
    signup,
    verifyAccount,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    resendCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 