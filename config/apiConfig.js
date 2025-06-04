import { Platform } from 'react-native';

export const API_CONFIG = {
  BASE_URL: Platform.select({
    android: 'http://10.0.2.2:8080',
    ios: 'http://localhost:8080',
    default: 'http://localhost:8080'
  }),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

export const getApiConfig = () => ({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
}); 