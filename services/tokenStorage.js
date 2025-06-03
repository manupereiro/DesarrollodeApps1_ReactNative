import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Check if we're running on web
const isWeb = Platform.OS === 'web';

// Mock implementation for web environment using localStorage
const webStorage = {
  setItemAsync: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  getItemAsync: (key) => {
    const value = localStorage.getItem(key);
    return Promise.resolve(value);
  },
  deleteItemAsync: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Use the appropriate storage implementation
const storage = isWeb ? webStorage : SecureStore;

export const saveToken = async (token) => {
  try {
    console.log('🔐 TokenStorage: Guardando token...', {
      tokenLength: token?.length,
      tokenType: typeof token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : null
    });
    
    if (!token) {
      console.warn('⚠️ TokenStorage: Intento de guardar token nulo o indefinido');
      return;
    }

    await storage.setItemAsync('jwt', token);
    
    // Verificar que se guardó correctamente
    const savedToken = await storage.getItemAsync('jwt');
    console.log('✅ TokenStorage: Token guardado exitosamente', {
      saved: !!savedToken,
      length: savedToken?.length,
      matches: savedToken === token
    });
  } catch (error) {
    console.error('❌ Error saving token:', error);
    // Fallback to a simpler implementation if the method doesn't exist
    if (isWeb) {
      localStorage.setItem('jwt', token);
      console.log('✅ TokenStorage: Token guardado en localStorage (fallback)');
    }
  }
};

export const getToken = async () => {
  try {
    console.log('🔍 TokenStorage: Obteniendo token...');
    const token = await storage.getItemAsync('jwt');
    
    console.log('🔍 TokenStorage: Token obtenido:', {
      exists: !!token,
      length: token?.length,
      type: typeof token,
      preview: token ? `${token.substring(0, 10)}...` : null
    });

    if (!token && isWeb) {
      // Fallback para web
      const webToken = localStorage.getItem('jwt');
      console.log('🔍 TokenStorage: Token obtenido de localStorage (fallback):', {
        exists: !!webToken,
        length: webToken?.length
      });
      return webToken;
    }

    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    if (isWeb) {
      const webToken = localStorage.getItem('jwt');
      console.log('🔍 TokenStorage: Token obtenido de localStorage (fallback):', {
        exists: !!webToken,
        length: webToken?.length
      });
      return webToken;
    }
    return null;
  }
};

export const removeToken = async () => {
  try {
    console.log('🧹 TokenStorage: Eliminando token...');
    await storage.deleteItemAsync('jwt');
    console.log('✅ TokenStorage: Token eliminado exitosamente');
  } catch (error) {
    console.error('❌ Error removing token:', error);
    // Fallback to a simpler implementation if the method doesn't exist
    if (isWeb) {
      localStorage.removeItem('jwt');
    }
  }
};

// Funciones adicionales para datos de usuario
export const saveUserData = async (userData) => {
  try {
    console.log('👤 TokenStorage: Guardando datos de usuario...');
    await storage.setItemAsync('userData', JSON.stringify(userData));
    console.log('✅ TokenStorage: Datos de usuario guardados');
  } catch (error) {
    console.error('❌ Error saving user data:', error);
    if (isWeb) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }
};

export const getUserData = async () => {
  try {
    console.log('👤 TokenStorage: Obteniendo datos de usuario...');
    const userDataString = await storage.getItemAsync('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      console.log('👤 TokenStorage: Datos de usuario obtenidos');
      return userData;
    }
    console.log('👤 TokenStorage: No hay datos de usuario');
    return null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    if (isWeb) {
      const userDataString = localStorage.getItem('userData');
      return userDataString ? JSON.parse(userDataString) : null;
    }
    return null;
  }
};

export const removeUserData = async () => {
  try {
    console.log('🧹 TokenStorage: Eliminando datos de usuario...');
    await storage.deleteItemAsync('userData');
    console.log('✅ TokenStorage: Datos de usuario eliminados');
  } catch (error) {
    console.error('❌ Error removing user data:', error);
    if (isWeb) {
      localStorage.removeItem('userData');
    }
  }
};

// Funciones compuestas para mantener compatibilidad con el código existente
const TokenStorage = {
  setToken: saveToken,
  getToken: getToken,
  removeToken: removeToken,
  clearToken: removeToken,
  
  setUserData: saveUserData,
  getUserData: getUserData,
  removeUserData: removeUserData,
  clearUserData: removeUserData,
  
  setAuthData: async (token, userData = null) => {
    try {
      console.log('🔐 TokenStorage: Guardando datos de autenticación completos...', {
        hasToken: !!token,
        tokenLength: token?.length,
        hasUserData: !!userData
      });

      if (!token) {
        console.warn('⚠️ TokenStorage: Intento de guardar token nulo o indefinido');
        return;
      }

      await saveToken(token);
      if (userData) {
        await saveUserData(userData);
      }

      // Verificar que todo se guardó correctamente
      const { token: savedToken, userData: savedUserData } = await TokenStorage.getAuthData();
      console.log('✅ TokenStorage: Verificación de datos guardados:', {
        tokenSaved: !!savedToken,
        tokenLength: savedToken?.length,
        tokenMatches: savedToken === token,
        userDataSaved: !!savedUserData
      });
    } catch (error) {
      console.error('❌ TokenStorage: Error guardando datos de autenticación:', error);
      throw error;
    }
  },
  
  getAuthData: async () => {
    try {
      console.log('🔍 TokenStorage: Obteniendo datos de autenticación completos...');
      const token = await getToken();
      const userData = await getUserData();
      console.log('🔍 TokenStorage: Datos obtenidos - Token:', token ? 'existe' : 'no existe', 'Usuario:', userData ? 'existe' : 'no existe');
      return { token, userData };
    } catch (error) {
      console.error('❌ TokenStorage: Error obteniendo datos de autenticación:', error);
      return { token: null, userData: null };
    }
  },
  
  clearAll: async () => {
    try {
      console.log('🧹 TokenStorage: Limpiando todos los datos de autenticación...');
      await Promise.all([
        removeToken(),
        removeUserData()
      ]);
      console.log('✅ TokenStorage: Todos los datos eliminados exitosamente');
    } catch (error) {
      console.error('❌ TokenStorage: Error limpiando datos:', error);
    }
  },
  
  hasAuthData: async () => {
    try {
      const token = await getToken();
      return !!token;
    } catch (error) {
      console.error('❌ TokenStorage: Error verificando datos:', error);
      return false;
    }
  },
  
  hasToken: async () => {
    return TokenStorage.hasAuthData();
  }
};

export default TokenStorage; 