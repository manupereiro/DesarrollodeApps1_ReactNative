import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configuración para conectar con el backend Spring Boot
const LOCAL_IP = '192.168.1.3'; // IP real del usuario

// Función simplificada para detectar tipo de dispositivo
const getDeviceType = () => {
  // Si está corriendo en Expo Go, es dispositivo físico
  if (Constants.appOwnership === 'expo') {
    return 'PHYSICAL_DEVICE';
  }

  // Si está corriendo en un emulador/simulador
  if (!Constants.isDevice) {
    return Platform.OS === 'android' ? 'ANDROID_EMULATOR' : 'IOS_SIMULATOR';
  }

  // Fallback
  return Platform.OS === 'android' ? 'ANDROID_EMULATOR' : 'IOS_SIMULATOR';
};

export const API_CONFIG = {
  BASE_URL: (() => {
    const deviceType = getDeviceType();
    
    // Para desarrollo con backend Spring Boot en localhost:8080
    if (deviceType === 'PHYSICAL_DEVICE') {
      return `http://${LOCAL_IP}:8080/api`; // Usar la IP real del usuario + /api
    } else if (deviceType === 'ANDROID_EMULATOR') {
      return 'http://10.0.2.2:8080/api'; // 10.0.2.2 es localhost para emulador Android
    } else {
      return `http://localhost:8080/api`; // localhost para simulador iOS
    }
  })(),
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Función para obtener la configuración de la API
export const getApiConfig = () => {
  const baseURL = API_CONFIG.BASE_URL;
  const deviceType = getDeviceType();

  return {
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS
  };
};

// Función para obtener tu IP automáticamente (usar en desarrollo)
export const getLocalIP = async () => {
  try {
    // Esta función ayuda a debugging - muestra qué IP debería usar
  } catch (error) {
    console.error('Error getting local IP:', error);
    return null;
  }
};