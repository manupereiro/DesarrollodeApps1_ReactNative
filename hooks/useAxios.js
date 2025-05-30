import { useState, useCallback } from 'react';
import axios from 'axios';
import TokenStorage from '../services/tokenStorage';
import { API_BASE_URL } from '../config/constants';

export const useAxios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Crear instancia de axios con configuración personalizada
  const createAxiosInstance = useCallback(async () => {
    const token = await TokenStorage.getToken();
    
    return axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  }, []);

  const execute = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    
    try {
      const axiosInstance = await createAxiosInstance();
      const response = await axiosInstance(config);
      
      setData(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      
      // Si es error 401, limpiar tokens
      if (err.response?.status === 401) {
        console.log('🔒 Token expirado en useAxios, limpiando...');
        await TokenStorage.clearAll();
      }
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Network error or server unavailable';
      setError(errorMessage);
      throw errorMessage;
    }
  }, [createAxiosInstance]);

  const get = useCallback((url, config = {}) => {
    return execute({ method: 'GET', url, ...config });
  }, [execute]);

  const post = useCallback((url, data, config = {}) => {
    return execute({ method: 'POST', url, data, ...config });
  }, [execute]);

  const put = useCallback((url, data, config = {}) => {
    return execute({ method: 'PUT', url, data, ...config });
  }, [execute]);

  const del = useCallback((url, config = {}) => {
    return execute({ method: 'DELETE', url, ...config });
  }, [execute]);

  const patch = useCallback((url, data, config = {}) => {
    return execute({ method: 'PATCH', url, data, ...config });
  }, [execute]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    delete: del,
    patch,
    execute,
    clearError,
    clearData,
  };
}; 