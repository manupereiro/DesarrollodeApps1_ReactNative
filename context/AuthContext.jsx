import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authApi from '../services/authApi';
import TokenStorage from '../services/tokenStorage';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.token,
        user: action.user,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignout: false,
        userToken: action.token,
        user: action.user,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        userToken: null,
        user: null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.user,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        console.log('🔄 Iniciando bootstrap de autenticación...');
        const { token, userData } = await TokenStorage.getAuthData();
        
        if (token) {
          console.log('🔍 Token encontrado, validando...');
          // Verificar si el token es válido obteniendo el perfil del usuario
          try {
            const profileData = await authApi.getProfile();
            const user = profileData.user || profileData;
            console.log('✅ Token válido, usuario autenticado');
            dispatch({ type: 'RESTORE_TOKEN', token, user });
          } catch (error) {
            // Token inválido, eliminarlo
            console.log('❌ Token inválido, limpiando almacenamiento...');
            await TokenStorage.clearAll();
            dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
          }
        } else {
          console.log('ℹ️ No hay token guardado');
          dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
        }
      } catch (e) {
        console.error('❌ Error durante bootstrap:', e);
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    signIn: async (credentials) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        console.log('🔄 Iniciando login con credenciales:', credentials);
        const response = await authApi.login(credentials);
        console.log('📥 Respuesta del servidor:', response);
        
        if (response.token) {
          console.log('✅ Login exitoso, guardando datos...');
          console.log('🔐 Token recibido:', response.token.substring(0, 20) + '...');
          console.log('👤 Usuario recibido:', response.user);
          await TokenStorage.setAuthData(response.token, response.user);
          dispatch({ 
            type: 'SIGN_IN', 
            token: response.token,
            user: response.user || null
          });
          console.log('✅ Dispatch SIGN_IN completado');
          return response;
        } else {
          console.log('❌ No hay token en la respuesta');
          throw new Error('No se recibió token del servidor');
        }
      } catch (error) {
        console.error('❌ Error en login:', error);
        console.error('❌ Error details:', {
          message: error.message,
          error: error.error,
          response: error.response?.data
        });
        dispatch({ type: 'SET_LOADING', isLoading: false });
        throw error;
      }
    },

    signUp: async (userData) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        console.log('🔄 Iniciando registro...');
        const response = await authApi.signup(userData);
        console.log('✅ Registro exitoso');
        dispatch({ type: 'SET_LOADING', isLoading: false });
        return response;
      } catch (error) {
        console.error('❌ Error en registro:', error);
        dispatch({ type: 'SET_LOADING', isLoading: false });
        throw error;
      }
    },

    verifyAccount: async (verificationData) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        console.log('🔄 Verificando cuenta...');
        const response = await authApi.verifyAccount(verificationData);
        console.log('✅ Verificación exitosa:', response);
        
        if (response.token) {
          console.log('🔐 Verificación incluye token, logueando automáticamente...');
          await TokenStorage.setAuthData(response.token, response.user);
          dispatch({ 
            type: 'SIGN_IN', 
            token: response.token,
            user: response.user || null
          });
        } else {
          dispatch({ type: 'SET_LOADING', isLoading: false });
        }
        
        return response;
      } catch (error) {
        console.error('❌ Error en verificación:', error);
        dispatch({ type: 'SET_LOADING', isLoading: false });
        throw error;
      }
    },

    forgotPassword: async (email) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        const response = await authApi.forgotPassword(email);
        dispatch({ type: 'SET_LOADING', isLoading: false });
        return response;
      } catch (error) {
        dispatch({ type: 'SET_LOADING', isLoading: false });
        throw error;
      }
    },

    verifyResetCode: async (verificationData) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        const response = await authApi.verifyResetCode(verificationData);
        dispatch({ type: 'SET_LOADING', isLoading: false });
        return response;
      } catch (error) {
        dispatch({ type: 'SET_LOADING', isLoading: false });
        throw error;
      }
    },

    resetPassword: async (resetData) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        const response = await authApi.resetPassword(resetData);
        dispatch({ type: 'SET_LOADING', isLoading: false });
        return response;
      } catch (error) {
        dispatch({ type: 'SET_LOADING', isLoading: false });
        throw error;
      }
    },

    resendCode: async (resendData) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      
      try {
        const response = await authApi.resendCode(resendData);
        dispatch({ type: 'SET_LOADING', isLoading: false });
        return response;
      } catch (error) {
        dispatch({ type: 'SET_LOADING', isLoading: false });
        throw error;
      }
    },

    signOut: async () => {
      try {
        console.log('🔄 Cerrando sesión...');
        // Intentar logout en el servidor (opcional)
        await authApi.logout();
      } catch (error) {
        console.warn('⚠️ Error en logout del servidor:', error);
      } finally {
        console.log('🧹 Limpiando almacenamiento local...');
        await TokenStorage.clearAll();
        dispatch({ type: 'SIGN_OUT' });
        console.log('✅ Sesión cerrada exitosamente');
      }
    },

    setLoading: (isLoading) => {
      dispatch({ type: 'SET_LOADING', isLoading });
    },

    updateUser: async (userData) => {
      try {
        await TokenStorage.setUserData(userData);
        dispatch({ type: 'SET_USER', user: userData });
      } catch (error) {
        console.error('❌ Error actualizando usuario:', error);
      }
    },

    state,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 