import { Platform } from 'react-native';

export const API_CONFIG = {
  BASE_URL: Platform.select({
    // Para emulador Android
    android: 'http://10.0.2.2:8080',
    // Para dispositivo físico (iOS y Android)
    ios: 'http://192.168.1.39:8080',
    // Por defecto para dispositivos físicos
    default: 'http://192.168.1.39:8080'
  }),
  TIMEOUT: 15000, // Aumentamos el timeout a 15 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Función para obtener la configuración de la API
export const getApiConfig = () => {
  // Para dispositivos físicos, usar la IP de la red local
  // Para emuladores, usar las IPs específicas del emulador
  const baseURL = API_CONFIG.BASE_URL;

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