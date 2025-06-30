import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import TokenStorage from '../services/tokenStorage';
import { getApiConfig } from '../config/apiConfig';

export const useAxios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const requestsInProgress = useRef(new Set());

  // Crear instancia de axios con configuración personalizada
  const createAxiosInstance = useCallback(async () => {
    const token = await TokenStorage.getToken();
    const config = getApiConfig();
    
    return axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        ...config.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  }, []);

  // Función de delay para los reintentos
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Función para verificar si un error es reintentable
  const isRetryableError = (error) => {
    const status = error.response?.status;
    const message = error.message;
    
    // Reintentar en errores de red, timeouts, o errores del servidor
    return (
      !status || // Error de red
      status >= 500 || // Errores del servidor
      status === 408 || // Timeout
      message.includes('timeout') ||
      message.includes('Network Error') ||
      message.includes('JDBC') ||
      message.includes('prepared statement')
    );
  };

  const execute = useCallback(async (config, maxRetries = 3) => {
    // Crear un identificador único para evitar requests duplicados
    const requestId = `${config.method}-${config.url}-${Date.now()}`;
    
    // Evitar requests duplicados concurrentes
    if (requestsInProgress.current.has(requestId)) {
      return;
    }
    
    requestsInProgress.current.add(requestId);
    setLoading(true);
    setError(null);
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const axiosInstance = await createAxiosInstance();
        const response = await axiosInstance(config);
        
        setData(response.data);
        setLoading(false);
        requestsInProgress.current.delete(requestId);
        return response.data;
        
      } catch (err) {
        lastError = err;
        console.log(`❌ Error en intento ${attempt}:`, err.message);
        
        // Si es error 401, limpiar tokens y no reintentar
        if (err.response?.status === 401) {
          console.log('🔒 Token expirado, limpiando...');
          await TokenStorage.clearAll();
          break;
        }
        
        // Si no es reintentable o es el último intento, salir
        if (!isRetryableError(err) || attempt === maxRetries) {
          break;
        }
        
        // Delay exponencial para reintentos
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await delay(delayMs);
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    setLoading(false);
    requestsInProgress.current.delete(requestId);
    
    const errorMessage = lastError.response?.data?.message || 
                        lastError.response?.data?.error || 
                        lastError.message || 
                        'Network error or server unavailable';
    setError(errorMessage);
    throw lastError;
  }, [createAxiosInstance, isRetryableError]);

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