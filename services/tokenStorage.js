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
    return false;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Verificar que cada parte no esté vacía
    if (!parts[0] || !parts[1] || !parts[2]) {
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Token válido si no ha expirado o expira en más de 1 minuto (reducido de 5)
    if (payload.exp && payload.exp > (now + 60)) {
      return true;
    }
    
    if (payload.exp && payload.exp > now) {
      return true; // Aún válido pero expira pronto
    }
    
    return false;
  } catch (error) {
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
    if (!token || !isTokenValid(token)) {
      return false;
    }

    await storage.setItemAsync('jwt', token);
    
    // Guardar timestamp de cuando se guardó el token
    await storage.setItemAsync('jwt_saved_at', Date.now().toString());
    
    // Verificar que se guardó correctamente
    const savedToken = await storage.getItemAsync('jwt');
    const success = savedToken === token;
    
    return success;
  } catch (error) {
    if (isWeb) {
      try {
        localStorage.setItem('jwt', token);
        localStorage.setItem('jwt_saved_at', Date.now().toString());
        return true;
      } catch (webError) {
        return false;
      }
    }
    return false;
  }
};

export const getToken = async () => {
  try {
    const token = await storage.getItemAsync('jwt');
    
    if (!token) {
      return null;
    }
    
    // Validar el token antes de devolverlo
    if (!isTokenValid(token)) {
      await removeToken();
      return null;
    }
    
    return token;
  } catch (error) {
    if (isWeb) {
      try {
        const webToken = localStorage.getItem('jwt');
        if (webToken && isTokenValid(webToken)) {
          return webToken;
        }
        localStorage.removeItem('jwt');
        localStorage.removeItem('jwt_saved_at');
      } catch (webError) {
      }
    }
    return null;
  }
};

export const removeToken = async () => {
  try {
    await Promise.all([
      storage.deleteItemAsync('jwt'),
      storage.deleteItemAsync('jwt_saved_at')
    ]);
  } catch (error) {
    if (isWeb) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('jwt_saved_at');
    }
  }
};

// Funciones adicionales para datos de usuario
export const saveUserData = async (userData) => {
  try {
    await storage.setItemAsync('userData', JSON.stringify(userData));
    return true;
  } catch (error) {
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
    const userDataString = await storage.getItemAsync('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return userData;
    }
    return null;
  } catch (error) {
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
    await storage.deleteItemAsync('userData');
  } catch (error) {
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
      return tokenInfo;
    } catch (error) {
      return { hasToken: false, isExpired: true };
    }
  },
  
  setAuthData: async (token, userData = null) => {
    try {
      if (!token || !isTokenValid(token)) {
        return false;
      }

      const tokenSaved = await saveToken(token);
      if (!tokenSaved) {
        return false;
      }
      
      if (userData) {
        const userDataSaved = await saveUserData(userData);
        if (!userDataSaved) {
        }
      }

      // Verificar que todo se guardó correctamente
      const { token: savedToken, userData: savedUserData } = await TokenStorage.getAuthData();
      const success = !!savedToken && (!userData || !!savedUserData);
      
      return success;
    } catch (error) {
      return false;
    }
  },
  
  getAuthData: async () => {
    try {
      const token = await getToken();
      const userData = await getUserData();
      return { token, userData };
    } catch (error) {
      return { token: null, userData: null };
    }
  },
  
  clearAll: async () => {
    try {
      await Promise.all([
        removeToken(),
        removeUserData()
      ]);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  clearAllAuthData: async () => {
    try {
      await Promise.all([
        removeToken(),
        removeUserData()
      ]);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  hasAuthData: async () => {
    try {
      const token = await getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  },
  
  hasToken: async () => {
    return TokenStorage.hasAuthData();
  },
  
  // Debug function
  debugMethods: () => {}
};

// Legacy export para compatibilidad hacia atrás
export const clearAllAuthData = async () => {
  return await TokenStorage.clearAllAuthData();
};

export default TokenStorage;