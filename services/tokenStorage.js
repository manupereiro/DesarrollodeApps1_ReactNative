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

// Token validation helpers mejorada
const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') {
    console.warn('⚠️ TokenStorage: Token inválido - no es string o está vacío');
    return false;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ TokenStorage: Token inválido - no tiene 3 partes (JWT)');
      return false;
    }
    
    // Verificar que cada parte no esté vacía
    if (!parts[0] || !parts[1] || !parts[2]) {
      console.warn('⚠️ TokenStorage: Token inválido - alguna parte está vacía');
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Logging del payload para debug
    console.log('🔍 TokenStorage: Payload del token:', {
      iat: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'No present',
      exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No present',
      sub: payload.sub ? payload.sub.substring(0, 10) + '...' : 'No present',
      timeUntilExpiry: payload.exp ? Math.floor((payload.exp - now) / 60) + ' minutos' : 'No expiry'
    });
    
    // Token válido si no ha expirado o expira en más de 1 minuto (reducido de 5)
    if (payload.exp && payload.exp > (now + 60)) {
      console.log('✅ TokenStorage: Token válido (expira en más de 1 minuto)');
      return true;
    }
    
    if (payload.exp && payload.exp > now) {
      const minutesLeft = Math.floor((payload.exp - now) / 60);
      console.warn(`⚠️ TokenStorage: Token expira pronto: ${minutesLeft} minutos`);
      return true; // Aún válido pero expira pronto
    }
    
    console.warn('⚠️ TokenStorage: Token expirado');
    return false;
  } catch (error) {
    console.error('❌ TokenStorage: Error validando token:', error);
    return false;
  }
};

const getTokenExpirationTime = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
};

export const saveToken = async (token) => {
  try {
    console.log('🔐 TokenStorage: Guardando token...', {
      tokenLength: token?.length,
      tokenType: typeof token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      isValid: isTokenValid(token)
    });
    
    if (!token || !isTokenValid(token)) {
      console.warn('⚠️ TokenStorage: Intento de guardar token inválido');
      return false;
    }

    await storage.setItemAsync('jwt', token);
    
    // Guardar timestamp de cuando se guardó el token
    await storage.setItemAsync('jwt_saved_at', Date.now().toString());
    
    // Verificar que se guardó correctamente
    const savedToken = await storage.getItemAsync('jwt');
    const success = savedToken === token;
    
    if (success) {
      const expiration = getTokenExpirationTime(token);
      console.log('✅ TokenStorage: Token guardado exitosamente', {
        saved: true,
        length: savedToken?.length,
        expiresAt: expiration?.toLocaleString()
      });
    } else {
      console.error('❌ TokenStorage: El token guardado no coincide');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error saving token:', error);
    if (isWeb) {
      try {
        localStorage.setItem('jwt', token);
        localStorage.setItem('jwt_saved_at', Date.now().toString());
        console.log('✅ TokenStorage: Token guardado en localStorage (fallback)');
        return true;
      } catch (webError) {
        console.error('❌ Error saving token in web fallback:', webError);
        return false;
      }
    }
    return false;
  }
};

export const getToken = async () => {
  try {
    console.log('🔍 TokenStorage: Obteniendo token...');
    const token = await storage.getItemAsync('jwt');
    
    if (!token) {
      console.log('🔍 TokenStorage: No hay token guardado');
      return null;
    }
    
    // Validar el token antes de devolverlo
    if (!isTokenValid(token)) {
      console.warn('⚠️ TokenStorage: Token inválido encontrado, limpiando...');
      await removeToken();
      return null;
    }
    
    const expiration = getTokenExpirationTime(token);
    console.log('🔍 TokenStorage: Token válido obtenido:', {
      exists: true,
      length: token.length,
      preview: `${token.substring(0, 20)}...`,
      expiresAt: expiration?.toLocaleString()
    });

    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    if (isWeb) {
      try {
        const webToken = localStorage.getItem('jwt');
        if (webToken && isTokenValid(webToken)) {
          console.log('🔍 TokenStorage: Token válido obtenido de localStorage (fallback)');
          return webToken;
        }
        console.log('🔍 TokenStorage: Token inválido en localStorage, limpiando...');
        localStorage.removeItem('jwt');
        localStorage.removeItem('jwt_saved_at');
      } catch (webError) {
        console.error('❌ Error getting token in web fallback:', webError);
      }
    }
    return null;
  }
};

export const removeToken = async () => {
  try {
    console.log('🧹 TokenStorage: Eliminando token...');
    await Promise.all([
      storage.deleteItemAsync('jwt'),
      storage.deleteItemAsync('jwt_saved_at')
    ]);
    console.log('✅ TokenStorage: Token eliminado exitosamente');
  } catch (error) {
    console.error('❌ Error removing token:', error);
    if (isWeb) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('jwt_saved_at');
    }
  }
};

// Funciones adicionales para datos de usuario
export const saveUserData = async (userData) => {
  try {
    console.log('👤 TokenStorage: Guardando datos de usuario...');
    await storage.setItemAsync('userData', JSON.stringify(userData));
    console.log('✅ TokenStorage: Datos de usuario guardados');
    return true;
  } catch (error) {
    console.error('❌ Error saving user data:', error);
    if (isWeb) {
      try {
        localStorage.setItem('userData', JSON.stringify(userData));
        return true;
      } catch {
        return false;
      }
    }
    return false;
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
      try {
        const userDataString = localStorage.getItem('userData');
        return userDataString ? JSON.parse(userDataString) : null;
      } catch {
        return null;
      }
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

// Token management functions
const TokenStorage = {
  setToken: saveToken,
  getToken: getToken,
  removeToken: removeToken,
  clearToken: removeToken,
  
  setUserData: saveUserData,
  getUserData: getUserData,
  removeUserData: removeUserData,
  clearUserData: removeUserData,
  
  // Función mejorada para validar token
  isTokenValid: async () => {
    try {
      const token = await getToken();
      return token !== null;
    } catch {
      return false;
    }
  },
  
  // Obtener información del token mejorada
  getTokenInfo: async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.log('🔍 TokenStorage: getTokenInfo - No hay token');
        return null;
      }
      
      const expiration = getTokenExpirationTime(token);
      const now = new Date();
      const timeUntilExpiry = expiration ? expiration.getTime() - now.getTime() : 0;
      
      const tokenInfo = {
        hasToken: true,
        expiresAt: expiration,
        expiresIn: Math.max(0, Math.floor(timeUntilExpiry / 1000)),
        expiresInMinutes: Math.max(0, Math.floor(timeUntilExpiry / (1000 * 60))),
        isExpired: timeUntilExpiry <= 0,
        expiresSoon: timeUntilExpiry <= (5 * 60 * 1000) // Expira en menos de 5 minutos
      };
      
      console.log('🔍 TokenStorage: getTokenInfo result:', tokenInfo);
      return tokenInfo;
    } catch (error) {
      console.error('❌ TokenStorage: Error en getTokenInfo:', error);
      return { hasToken: false, isExpired: true };
    }
  },
  
  setAuthData: async (token, userData = null) => {
    try {
      console.log('🔐 TokenStorage: Guardando datos de autenticación completos...', {
        hasToken: !!token,
        tokenLength: token?.length,
        hasUserData: !!userData,
        tokenValid: isTokenValid(token)
      });

      if (!token || !isTokenValid(token)) {
        console.warn('⚠️ TokenStorage: Intento de guardar token inválido');
        return false;
      }

      const tokenSaved = await saveToken(token);
      if (!tokenSaved) {
        console.error('❌ TokenStorage: Error guardando token');
        return false;
      }
      
      if (userData) {
        const userDataSaved = await saveUserData(userData);
        if (!userDataSaved) {
          console.warn('⚠️ TokenStorage: Error guardando datos de usuario');
        }
      }

      // Verificar que todo se guardó correctamente
      const { token: savedToken, userData: savedUserData } = await TokenStorage.getAuthData();
      const success = !!savedToken && (!userData || !!savedUserData);
      
      console.log('✅ TokenStorage: Verificación de datos guardados:', {
        tokenSaved: !!savedToken,
        tokenLength: savedToken?.length,
        userDataSaved: !!savedUserData,
        success
      });
      
      return success;
    } catch (error) {
      console.error('❌ TokenStorage: Error guardando datos de autenticación:', error);
      return false;
    }
  },
  
  getAuthData: async () => {
    try {
      console.log('🔍 TokenStorage: Obteniendo datos de autenticación completos...');
      const token = await getToken();
      const userData = await getUserData();
      console.log('🔍 TokenStorage: Datos obtenidos - Token:', token ? 'válido' : 'no existe', 'Usuario:', userData ? 'existe' : 'no existe');
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
      return true;
    } catch (error) {
      console.error('❌ TokenStorage: Error limpiando datos:', error);
      return false;
    }
  },
  
  clearAllAuthData: async () => {
    try {
      console.log('🧹 TokenStorage: Limpiando todos los datos de autenticación (clearAllAuthData)...');
      await Promise.all([
        removeToken(),
        removeUserData()
      ]);
      console.log('✅ TokenStorage: Todos los datos eliminados exitosamente');
      return true;
    } catch (error) {
      console.error('❌ TokenStorage: Error limpiando datos:', error);
      return false;
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
  },
  
  // Debug function
  debugMethods: () => {
    console.log('🔍 TokenStorage methods available:', {
      clearAll: typeof TokenStorage.clearAll,
      clearAllAuthData: typeof TokenStorage.clearAllAuthData,
      setAuthData: typeof TokenStorage.setAuthData,
      getAuthData: typeof TokenStorage.getAuthData,
      isTokenValid: typeof TokenStorage.isTokenValid,
      getTokenInfo: typeof TokenStorage.getTokenInfo
    });
  }
};

// Legacy export para compatibilidad hacia atrás
export const clearAllAuthData = async () => {
  console.log('🧹 TokenStorage: clearAllAuthData (export directo) llamado...');
  return await TokenStorage.clearAllAuthData();
};

export default TokenStorage; 