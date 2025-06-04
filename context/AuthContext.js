import React, { createContext, useContext, useEffect, useReducer } from 'react';
import authApi from '../services/authApi';
import TokenStorage from '../services/tokenStorage';

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
      console.log('AuthContext: Verificando estado de autenticación...');
      const { token, userData } = await TokenStorage.getAuthData();
      
      if (token) {
        console.log('AuthContext: Token encontrado, actualizando estado...');
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { token, user: userData },
        });
      } else {
        console.log('AuthContext: No se encontró token, limpiando estado...');
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
      
      console.log('AuthContext: Iniciando login con username:', credentials.username);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      // Llamar a authApi.login con el objeto credentials
      const response = await authApi.login(credentials);
      
      console.log('AuthContext: Login exitoso, respuesta recibida:', {
        hasToken: !!response.token,
        tokenLength: response.token?.length,
        hasUser: !!response.user,
        userData: response.user ? {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role
        } : null
      });

      console.log('AuthContext: Guardando token y datos de usuario...');
      await TokenStorage.setAuthData(response.token, response.user || null);
      
      // Verificar que el token se guardó correctamente
      const { token: savedToken, userData: savedUserData } = await TokenStorage.getAuthData();
      console.log('AuthContext: Verificación de datos guardados:', {
        tokenSaved: !!savedToken,
        tokenLength: savedToken?.length,
        userDataSaved: !!savedUserData
      });
      
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
      // Primero limpiamos el almacenamiento local
      await TokenStorage.clearAll();
      
      // Luego intentamos el logout en el backend (manejado silenciosamente)
      await authApi.logout();
      
      // Finalmente actualizamos el estado
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      // Si algo falla, aún así limpiamos el estado local
      console.log('✅ Sesión cerrada localmente');
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