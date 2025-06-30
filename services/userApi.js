import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

// Crear instancia de API con autenticación
const createUserApiInstance = async () => {
  const config = getApiConfig();
  const token = await TokenStorage.getToken();
  
  const headers = { ...config.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return axios.create({
    ...config,
    headers,
    timeout: 30000
  });
};

export const userApi = {
  savePushToken: async (expoPushToken) => {
    try {
      const api = await createUserApiInstance();
      const response = await api.post('/users/push-token', { token: expoPushToken });
      console.log('✅ Push Token guardado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error guardando Push Token:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error.response?.data || { error: 'Error guardando push token' };
    }
  },
};

