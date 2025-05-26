import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        baseURL: API_BASE_URL,
        timeout: 10000,
        ...config,
      });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Network error or server unavailable';
      setError(errorMessage);
      throw errorMessage;
    }
  }, []);

  const get = useCallback((url, config = {}) => {
    return apiCall({ method: 'GET', url, ...config });
  }, [apiCall]);

  const post = useCallback((url, data, config = {}) => {
    return apiCall({ method: 'POST', url, data, ...config });
  }, [apiCall]);

  const put = useCallback((url, data, config = {}) => {
    return apiCall({ method: 'PUT', url, data, ...config });
  }, [apiCall]);

  const del = useCallback((url, config = {}) => {
    return apiCall({ method: 'DELETE', url, ...config });
  }, [apiCall]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    apiCall,
  };
}; 