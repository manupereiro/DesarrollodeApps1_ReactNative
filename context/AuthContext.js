import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import authService from '../services/authService';

// Estados iniciales
const initialState = {
  user: null,
  token: null,
  isLoading: true,
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
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
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
        pendingVerification: action.payload 
      };
    case AUTH_ACTIONS.CLEAR_PENDING_VERIFICATION:
      return { 
        ...state, 
        pendingVerification: null 
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
      console.log('AuthContext: Verificando estado de autenticación...');
      const token = await AsyncStorage.getItem('token');
      console.log('AuthContext: Token encontrado en checkAuthState:', {
        exists: !!token,
        length: token?.length,
        parts: token ? token.split('.') : null,
        decodedPayload: token ? JSON.parse(atob(token.split('.')[1])) : null
      });

      if (token) {
        // Aquí podrías hacer una llamada al backend para verificar si el token es válido
        console.log('AuthContext: Token válido, actualizando estado...');
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { token, user: null },
        });
      } else {
        console.log('AuthContext: No se encontró token, limpiando estado...');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('AuthContext: Error al verificar estado de autenticación:', {
        error: error.message,
        stack: error.stack
      });
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const login = async (credentials) => {
    try {
      if (!credentials.username || !credentials.password) {
        throw new Error('Usuario y contraseña son requeridos');
      }
      
      console.log('AuthContext: Iniciando login con username:', credentials.username);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      // Llamar a authService.login con los parámetros separados
      const response = await authService.login(credentials.username, credentials.password);
      
      console.log('AuthContext: Login exitoso, guardando token...');
      await AsyncStorage.setItem('token', response.token);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token: response.token,
          user: response.user || null,
        },
      });
      
      console.log('AuthContext: Login completado exitosamente');
      return response;
    } catch (error) {
      console.error('AuthContext: Error en login:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authService.signup(userData);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      dispatch({ type: AUTH_ACTIONS.SET_PENDING_VERIFICATION, payload: userData.email }); // <-- NUEVO
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const verifyAccount = async (verificationData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authService.verifyAccount(verificationData);
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
      const response = await authService.forgotPassword(email);
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
      const response = await authService.verifyResetCode(verificationData);
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
      const response = await authService.resetPassword(resetData);
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
      const response = await authService.resendCode(resendData);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    logout,
    signup,
    verifyAccount,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    resendCode,
    dispatch,
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