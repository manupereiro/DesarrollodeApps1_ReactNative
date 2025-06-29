import api from './api';

export const userApi = {
  savePushToken: async (expoPushToken) => {
    try {
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
