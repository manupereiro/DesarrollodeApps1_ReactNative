import TokenStorage, { clearAllAuthData } from '../services/tokenStorage';

const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(authReducer, initialState);

  const signIn = async (credentials) => {
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
      // Si el error es de JWT expirado, limpiar todo
      if (error?.error?.includes('expired') || error?.message?.includes('expired')) {
        await clearAllAuthData();
      }
      console.error('❌ Error en login:', error);
      console.error('❌ Error details:', {
        message: error.message,
        error: error.error,
        response: error.response?.data
      });
      dispatch({ type: 'SET_LOADING', isLoading: false });
      throw error;
    }
  };

  const signOut = () => {
    dispatch({ type: 'SIGN_OUT' });
  };

  const value = {
    state,
    dispatch,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
