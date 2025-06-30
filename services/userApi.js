import api from './api';

export const userApi = {
  savePushToken: async (expoPushToken) => {
    try {
      const response = await api.post('/users/push-token', { token: expoPushToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePushToken: async (pushToken) => {
    try {
      const api = await createAuthApiInstance(true);
      const response = await api.post('/users/push-token', { pushToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
