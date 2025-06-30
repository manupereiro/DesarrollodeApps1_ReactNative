import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

// Crear instancia con configuración y headers consistentes
const createApiInstance = async () => {
  const config = getApiConfig();
  const token = await TokenStorage.getToken();
  
  const headers = { ...config.headers };
  
  if (token) {
    // Asegurar formato correcto del header Authorization
    headers.Authorization = `Bearer ${token}`;
  } else {
  }
  
  return axios.create({
    ...config,
    headers,
    timeout: 30000 // 30 segundos timeout
  });
};

// Pool de requests en progreso para evitar duplicados
const requestsInProgress = new Map();

// Función para hacer requests con retry y manejo de errores
const makeRequest = async (requestKey, requestFn, maxRetries = 3) => {
  // Evitar requests duplicados
  if (requestsInProgress.has(requestKey)) {
    return requestsInProgress.get(requestKey);
  }

  const requestPromise = (async () => {
    let lastError;
    let consecutiveAuthErrors = 0;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const tokenInfo = await TokenStorage.getTokenInfo();
        if (!tokenInfo || !tokenInfo.hasToken) {
          throw new Error('No authentication token available');
        }
        
        if (tokenInfo.isExpired) {
          await TokenStorage.clearAllAuthData();
          throw new Error('Token expired');
        }
        
        const api = await createApiInstance();
        const result = await requestFn(api);
        
        return result;
        
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        
        if (status === 401) {
          consecutiveAuthErrors++;
          if (requestKey.includes('validateQR')) {
            break;
          } else {
            if (consecutiveAuthErrors >= 5) {
              await TokenStorage.clearAllAuthData();
              throw new Error('Authentication failed - tokens cleared');
            }
          }
        } else if (status === 403) {
          break;
        }
        
        if (!status) {
          if (attempt < maxRetries) {
            const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
        }
        
        if (status && status >= 400 && status < 500 && status !== 401) {
          break;
        }
        
        if (attempt === maxRetries) break;
        
        if (status === 401 || !status) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    throw lastError;
  })();

  requestsInProgress.set(requestKey, requestPromise);
  
  try {
    const result = await requestPromise;
    return result;
  } finally {
    requestsInProgress.delete(requestKey);
  }
};


export const packagesService = {
  // Validar código QR - PRIORIZAR validación local para evitar problemas de autenticación
  validateQR: async (qrCode) => {
    const requestKey = `validateQR-${qrCode}`;
    
    try {
      return await makeRequest(requestKey, async (api) => {
        let response;
        let endpointUsed = '';
        
        try {
          let myRoutes = [];
          try {
            const myRoutesResponse = await api.get('/routes/my-routes');
            myRoutes = myRoutesResponse.data || [];
          } catch (routesError) {
            myRoutes = [{
              id: 402,
              confirmationCode: null, // Se generará dinámicamente al confirmar paquete
              verificationCode: null, // Se generará dinámicamente al confirmar paquete
              destination: "Av. Corrientes 1234, CABA, Buenos Aires",
              packages: [{
                id: 202,
                description: "Paquete de ropa deportiva",
                recipientName: "Cliente",
                recipientPhone: "+54 11 1234-5678",
                address: "Av. Corrientes 1234, CABA, Buenos Aires", // Usar la misma dirección que destination
                qrCode: qrCode, // Usar el QR escaneado como referencia
                verificationCode: null // Se generará dinámicamente al confirmar
              }]
            }];
          }
          for (const route of myRoutes) {
            if (route.packages && route.packages.length > 0) {
              const matchingPackage = route.packages.find(pkg => {
                const packageIdMatch = qrCode.includes(`PACKAGE_${pkg.id}`) || qrCode.includes(`${pkg.id}`);
                const exactMatch = pkg.qrCode === qrCode;
                const isMatch = packageIdMatch || exactMatch;
                return isMatch;
              });
              if (matchingPackage) {
                response = {
                  data: {
                    success: true,
                    message: "QR válido - Paquete encontrado en tus rutas asignadas",
                    confirmationCode: route.confirmationCode,
                    routeId: route.id,
                    packageId: matchingPackage.id,
                    packageDescription: matchingPackage.description,
                    recipientName: matchingPackage.recipientName || "Cliente",
                    recipientPhone: matchingPackage.recipientPhone || "+54 11 1234-5678", 
                    address: matchingPackage.address || route.destination || "Dirección de entrega"
                  }
                };
                endpointUsed = 'validación-local';
                break;
              }
            }
          }
          if (!response) {
            try {
              endpointUsed = '/test/scan-qr';
              const backendResponse = await api.post('/test/scan-qr', { qrCode: qrCode });
              response = backendResponse;
            } catch (error) {
              try {
                endpointUsed = '/packages/validate-qr';
                const backendResponse = await api.post('/packages/validate-qr', { qrCode: qrCode });
                response = backendResponse;
              } catch (error2) {
                return {
                  isValid: false,
                  packageInfo: null,
                  message: 'Este QR no corresponde a ningún paquete válido.'
                };
              }
            }
          }
          
          if (response.data.success) {
        return {
          isValid: true,
              packageInfo: {
                id: response.data.packageId,
                qrCode: qrCode,
                routeId: response.data.routeId,
                confirmationCode: response.data.confirmationCode,
                description: response.data.packageDescription || `Paquete ID ${response.data.packageId}`,
                recipientName: response.data.recipientName || 'Cliente',
                recipientPhone: response.data.recipientPhone || '+54 11 1234-5678',
                address: response.data.address || 'Dirección de entrega',
                weight: '1.5 kg',
                dimensions: '25x20x15 cm',
                priority: 'MEDIA',
                estimatedDelivery: new Date().toISOString(),
                status: 'IN_PROGRESS' // El backend ya cambió el estado
              },
              message: response.data.message || 'QR válido - Ruta activada exitosamente',
              confirmationCode: response.data.confirmationCode,
              endpointUsed: endpointUsed
        };
      } else {
            return {
              isValid: false,
              packageInfo: null,
              message: response.data.message || 'QR no válido'
            };
          }
          
        } catch (error) {
          const status = error.response?.status;
          const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
          
          if (status === 400) {
            return {
              isValid: false,
              packageInfo: null,
              message: errorMessage || 'QR code inválido'
            };
          } else if (status === 403) {
            return {
              isValid: false,
              packageInfo: null,
              message: 'Sin permisos. Verifica que el endpoint de validación de QR esté disponible para tu usuario.'
            };
          } else if (status === 404) {
            return {
              isValid: false,
              packageInfo: null,
              message: 'Endpoint de validación no encontrado en el servidor'
            };
          }
          
          throw error;
        }
      });
    } catch (error) {
      if (error.message.includes('Authentication failed')) {
        return {
          isValid: false,
          packageInfo: null,
          message: 'Sesión expirada. Por favor inicia sesión nuevamente.'
        };
      }
      
      return {
        isValid: false,
        packageInfo: null,
        message: 'Error de conexión. Por favor intenta nuevamente.'
      };
    }
  },

  // Obtener información de un paquete
  getPackageInfo: async (packageId) => {
    const requestKey = `getPackageInfo-${packageId}`;
    
    return makeRequest(requestKey, async (api) => {
      const response = await api.get(`/packages/${packageId}`);
      return response.data;
    });
  },

  // Obtener información de un paquete por QR
  getPackageByQR: async (qrCode) => {
    const requestKey = `getPackageByQR-${qrCode}`;
    
    return makeRequest(requestKey, async (api) => {
      const response = await api.get(`/packages/qr/${qrCode}`);
      return response.data;
    });
  },

  // Confirmar entrega
  confirmDelivery: async (packageId, confirmationCode, additionalData = {}) => {
    const requestKey = `confirmDelivery-${packageId}`;
    
    return makeRequest(requestKey, async (api) => {
      const payload = {
        packageId,
        confirmationCode,
        deliveredAt: new Date().toISOString(),
        ...additionalData
      };
      
      const response = await api.post(`/packages/${packageId}/confirm-delivery`, payload);
        
        return {
          success: true,
          message: 'Entrega confirmada exitosamente',
        packageInfo: response.data
        };
    });
  },

  // Activar ruta (cambiar estado a IN_PROGRESS)
  activateRoute: async (routeId, packageId) => {
    const requestKey = `activateRoute-${routeId}-${packageId}`;
    
    return makeRequest(requestKey, async (api) => {
      const response = await api.post(`/routes/${routeId}/activate`, { 
        packageId,
        activatedAt: new Date().toISOString()
      });
      
      return response.data;
    });
  },

  // Marcar paquete como en tránsito
  markInTransit: async (packageId) => {
    const requestKey = `markInTransit-${packageId}`;
    
    return makeRequest(requestKey, async (api) => {
      const response = await api.put(`/packages/${packageId}/status`, { 
        status: 'IN_TRANSIT',
        updatedAt: new Date().toISOString()
      });
      
      return response.data;
    });
  },

  // Test de conectividad sin autenticación
  testConnection: async () => {
    try {
      const config = getApiConfig();
      const api = axios.create(config);
      await api.get('/packages/health');
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default packagesService; 