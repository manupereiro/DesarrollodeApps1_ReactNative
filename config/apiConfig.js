import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detectar si es emulador o dispositivo físico
const isAndroidEmulator = Platform.OS === 'android' && !Constants.isDevice;
const isIOSSimulator = Platform.OS === 'ios' && !Constants.isDevice;

// IP de tu computadora en la red local (detectada automáticamente)
const LOCAL_IP = '192.168.0.8'; // 🔥 IP ACTUAL DETECTADA

export const API_CONFIG = {
  BASE_URL: (() => {
    if (isAndroidEmulator) {
      return 'http://10.0.2.2:8080'; // Emulador Android
    } else if (isIOSSimulator) {
      return `http://${LOCAL_IP}:8080`; // Simulador iOS
    } else {
      return `http://${LOCAL_IP}:8080`; // Dispositivo físico
    }
  })(),
  TIMEOUT: 30000, // Aumentamos el timeout a 30 segundos para dispositivos físicos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Función para obtener la configuración de la API
export const getApiConfig = () => {
  const baseURL = API_CONFIG.BASE_URL;
  
  console.log('🌐 API Config:', {
    platform: Platform.OS,
    baseURL,
    isDevice: Constants.isDevice,
    isAndroidEmulator,
    isIOSSimulator,
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