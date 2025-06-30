import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LOCAL_IP = '192.168.0.15';

// Función para detectar tipo de dispositivo
const getDeviceType = () => {
  // Si está corriendo en Expo Go, es muy probable que sea dispositivo físico
  if (Constants.appOwnership === 'expo') {
    return 'PHYSICAL_DEVICE';
  }

  // Método tradicional
  if (Constants.isDevice === true) {
    return 'PHYSICAL_DEVICE';
  } else if (Constants.isDevice === false) {
    return Platform.OS === 'android' ? 'ANDROID_EMULATOR' : 'IOS_SIMULATOR';
  }

  // Fallback: verificar otros indicadores
  if (Constants.experienceUrl && Constants.experienceUrl.includes('192.168')) {
    return 'PHYSICAL_DEVICE';
  }

  // Fallback final basado en plataforma
  return Platform.OS === 'android' ? 'ANDROID_EMULATOR' : 'IOS_SIMULATOR';
};

export const API_CONFIG = {
  BASE_URL: (() => {
    const deviceType = getDeviceType();
    
    // Configuración según tipo de dispositivo
    if (deviceType === 'PHYSICAL_DEVICE') {
      return `http://${LOCAL_IP}:8080`;
    } else if (deviceType === 'ANDROID_EMULATOR') {
      return 'http://10.0.2.2:8080';
    } else {
      return `http://${LOCAL_IP}:8080`;
    }
  })(),
  TIMEOUT: 15000, // Reducido a 15s para respuestas más rápidas
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Función para obtener la configuración de la API
export const getApiConfig = () => {
  const baseURL = API_CONFIG.BASE_URL;
  const deviceType = getDeviceType();
  
  console.log('🌐 API Config:', {
    baseURL,
    deviceType,
    platform: Platform.OS
  });

  return {
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS
  };
};

// Función para obtener tu IP automáticamente (usar en desarrollo)
export const getLocalIP = async () => {
  try {
    console.log('💡 Para configurar correctamente:');
    console.log('1. Ejecuta: ipconfig (Windows) o ifconfig (Mac/Linux)');
    console.log('2. Reemplaza LOCAL_IP en apiConfig.js con tu IP local');
  } catch (error) {
    console.error('Error getting local IP:', error);
  }
};