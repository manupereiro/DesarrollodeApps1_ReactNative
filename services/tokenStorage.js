import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

class TokenStorage {
  /**
   * Guardar token de usuario
   * @param {string} token 
   */
  static async setToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
        console.log('🔐 Token guardado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error guardando token:', error);
      throw error;
    }
  }

  /**
   * Obtener token de usuario
   * @returns {Promise<string|null>}
   */
  static async getToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      return token;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Eliminar token de usuario
   */
  static async removeToken() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      console.log('🗑️ Token eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando token:', error);
      throw error;
    }
  }

  /**
   * Verificar si existe un token
   * @returns {Promise<boolean>}
   */
  static async hasToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      return !!token;
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      return false;
    }
  }

  /**
   * Guardar datos del usuario
   * @param {object} userData 
   */
  static async setUserData(userData) {
    try {
      if (userData) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        console.log('👤 Datos de usuario guardados exitosamente');
      }
    } catch (error) {
      console.error('❌ Error guardando datos de usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener datos del usuario
   * @returns {Promise<object|null>}
   */
  static async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error obteniendo datos de usuario:', error);
      return null;
    }
  }

  /**
   * Eliminar datos del usuario
   */
  static async removeUserData() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      console.log('🗑️ Datos de usuario eliminados exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando datos de usuario:', error);
      throw error;
    }
  }

  /**
   * Limpiar todo el almacenamiento de autenticación
   */
  static async clearAll() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA)
      ]);
      console.log('🧹 Almacenamiento de autenticación limpio');
    } catch (error) {
      console.error('❌ Error limpiando almacenamiento:', error);
      throw error;
    }
  }

  /**
   * Guardar tanto token como datos de usuario
   * @param {string} token 
   * @param {object} userData 
   */
  static async setAuthData(token, userData) {
    try {
      await Promise.all([
        this.setToken(token),
        userData ? this.setUserData(userData) : Promise.resolve()
      ]);
      console.log('✅ Datos de autenticación guardados completos');
    } catch (error) {
      console.error('❌ Error guardando datos de autenticación:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los datos de autenticación
   * @returns {Promise<{token: string|null, userData: object|null}>}
   */
  static async getAuthData() {
    try {
      const [token, userData] = await Promise.all([
        this.getToken(),
        this.getUserData()
      ]);
      return { token, userData };
    } catch (error) {
      console.error('❌ Error obteniendo datos de autenticación:', error);
      return { token: null, userData: null };
    }
  }
}

export default TokenStorage; 