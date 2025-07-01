import Constants from 'expo-constants';
import { Platform } from 'react-native';

// IP de tu computadora en la red local (detectada automáticamente)
const LOCAL_IP = '192.168.1.43'; // 🔥 IP ACTUAL DETECTADA

// Función mejorada para detectar tipo de dispositivo
const getDeviceType = () => {

  // Si está corriendo en Expo Go (appOwnership === 'expo'), es muy probable que sea dispositivo físico
  if (Constants.appOwnership === 'expo') {
    return 'PHYSICAL_DEVICE';
  }

  // Método tradicional mejorado
  if (Constants.isDevice === true) {
    return 'PHYSICAL_DEVICE';
  } else if (Constants.isDevice === false) {
    return Platform.OS === 'android' ? 'ANDROID_EMULATOR' : 'IOS_SIMULATOR';
  }

  // Fallback: si isDevice es undefined, verificar otros indicadores
  if (Constants.experienceUrl && Constants.experienceUrl.includes('192.168')) {
    return 'PHYSICAL_DEVICE';
  }

  // Fallback final basado en plataforma
  return Platform.OS === 'android' ? 'ANDROID_EMULATOR' : 'IOS_SIMULATOR';
};

export const API_CONFIG = {
  BASE_URL: (() => {
    const deviceType = getDeviceType();
    
    console.log('🎯 Tipo de dispositivo determinado:', deviceType);
    
    // SIEMPRE usar IP local para Expo Go y dispositivos físicos
    if (deviceType === 'PHYSICAL_DEVICE') {
      console.log('📱 Configurando para dispositivo físico');
      return `http://${LOCAL_IP}:8080`;
    } else if (deviceType === 'ANDROID_EMULATOR') {
      console.log('🤖 Configurando para emulador Android');
      return 'http://10.0.2.2:8080';
    } else {
      console.log('🍎 Configurando para simulador iOS');
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

  return {
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS
  };
};
