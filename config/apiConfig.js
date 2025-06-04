import { Platform } from 'react-native';

export const API_CONFIG = {
  BASE_URL: Platform.select({
    // Para emulador Android
    android: 'http://10.0.2.2:8080',
    // Para dispositivo físico Android
    android_physical: 'http://192.168.1.3:8080',
    // Para iOS
    ios: 'http://localhost:8080',
    // Por defecto
    default: 'http://localhost:8080'
  }),
  TIMEOUT: 15000, // Aumentamos el timeout a 15 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Función para obtener la configuración de la API
export const getApiConfig = () => {
  // Si estamos en Android y es un dispositivo físico, usar la IP de la red local
  const baseURL = Platform.OS === 'android' && !__DEV__ 
    ? API_CONFIG.android_physical 
    : API_CONFIG.BASE_URL;

  console.log('🌐 API Config:', {
    platform: Platform.OS,
    baseURL,
    isDev: __DEV__
  });

  return {
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS
  };
}; 