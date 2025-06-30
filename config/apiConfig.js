import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configuración para conectar con el backend Spring Boot
const LOCAL_IP = '192.168.1.3'; // IP real del usuario

// Función simplificada para detectar tipo de dispositivo
const getDeviceType = () => {
  console.log('🔍 Detectando tipo de dispositivo:', {
    platform: Platform.OS,
    isDevice: Constants.isDevice,
    appOwnership: Constants.appOwnership
  });

  // Si está corriendo en Expo Go, es dispositivo físico
  if (Constants.appOwnership === 'expo') {
    console.log('📱 Detectado: Expo Go - Dispositivo físico');
    return 'PHYSICAL_DEVICE';
  }

  // Método tradicional
  if (Constants.isDevice === true) {
    return 'PHYSICAL_DEVICE';
  } else if (Constants.isDevice === false) {
    return Platform.OS === 'android' ? 'ANDROID_EMULATOR' : 'IOS_SIMULATOR';
  }

  // Fallback
  console.log('⚠️ No se pudo determinar tipo de dispositivo, usando fallback');
  return Platform.OS === 'android' ? 'ANDROID_EMULATOR' : 'IOS_SIMULATOR';
};

export const API_CONFIG = {
  BASE_URL: (() => {
    const deviceType = getDeviceType();
    
    console.log('🎯 Tipo de dispositivo determinado:', deviceType);
    
    // Para desarrollo con backend Spring Boot en localhost:8080
    if (deviceType === 'PHYSICAL_DEVICE') {
      console.log('📱 Configurando para dispositivo físico - usando IP local');
      return `http://${LOCAL_IP}:8080/api`; // Usar la IP real del usuario + /api
    } else if (deviceType === 'ANDROID_EMULATOR') {
      console.log('🤖 Configurando para emulador Android');
      return 'http://10.0.2.2:8080/api'; // 10.0.2.2 es localhost para emulador Android
    } else {
      console.log('🍎 Configurando para simulador iOS');
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
  
  console.log('🌐 API Config Final:', {
    platform: Platform.OS,
    baseURL,
    deviceType,
    isDevice: Constants.isDevice,
    appOwnership: Constants.appOwnership,
    isDev: __DEV__
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
    // Esta función ayuda a debugging - muestra qué IP debería usar
    console.log('💡 Para configurar correctamente:');
    console.log('1. Abre CMD/Terminal en tu PC');
    console.log('2. Ejecuta: ipconfig (Windows) o ifconfig (Mac/Linux)');
    console.log('3. Busca tu IP local (ej: 192.168.1.XX)');
    console.log('4. Reemplaza LOCAL_IP en apiConfig.js');
    console.log('5. Asegúrate que el backend esté corriendo en esa IP');
  } catch (error) {
    console.error('Error getting local IP:', error);
  }
};