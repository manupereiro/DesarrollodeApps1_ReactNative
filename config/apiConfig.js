import Constants from 'expo-constants';
import { Platform } from 'react-native';

// IP de tu computadora en la red local
const LOCAL_IP = '192.168.1.3';

export const API_CONFIG = {
  BASE_URL: `http://${LOCAL_IP}:8080`, // Siempre usar IP local
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Función para obtener la configuración de la API
export const getApiConfig = () => {
  const baseURL = API_CONFIG.BASE_URL;
  
  console.log('🌐 API Config:', {
    LOCAL_IP,
    baseURL,
    isDev: __DEV__,
    platform: Platform.OS,
    isDevice: Constants.isDevice
  });

  return {
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS
  };
};