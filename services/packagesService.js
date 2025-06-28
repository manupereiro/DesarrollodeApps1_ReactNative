import axios from 'axios';
import { getApiConfig } from '../config/apiConfig';
import TokenStorage from './tokenStorage';

// Crear instancia con configuración
const createApiInstance = async () => {
  const config = getApiConfig();
  const token = await TokenStorage.getToken();
  
  return axios.create({
    ...config,
    headers: {
      ...config.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

// Datos de prueba para desarrollo
const MOCK_PACKAGES = {
  'PKG001': {
    id: 1,
    qrCode: 'PKG001',
    description: 'Paquete electrónicos - Smartphone Samsung',
    recipientName: 'Juan Pérez',
    recipientPhone: '+54 11 1234-5678',
    address: 'Av. Corrientes 1234, CABA',
    weight: '0.5 kg',
    dimensions: '15x10x5 cm',
    priority: 'ALTA',
    estimatedDelivery: '2024-01-15 14:00',
    confirmationCode: '123456',
    routeId: 1,
    status: 'ASSIGNED'
  },
  'PKG002': {
    id: 2,
    qrCode: 'PKG002',
    description: 'Paquete ropa - Zapatillas Nike',
    recipientName: 'María González',
    recipientPhone: '+54 11 9876-5432',
    address: 'Calle Falsa 123, Vicente López',
    weight: '1.2 kg',
    dimensions: '30x20x15 cm',
    priority: 'MEDIA',
    estimatedDelivery: '2024-01-15 16:00',
    confirmationCode: '789012',
    routeId: 2,
    status: 'ASSIGNED'
  },
  'PKG003': {
    id: 3,
    qrCode: 'PKG003',
    description: 'Paquete libros - Colección Harry Potter',
    recipientName: 'Carlos Rodríguez',
    recipientPhone: '+54 11 5555-4444',
    address: 'San Martín 456, San Isidro',
    weight: '2.1 kg',
    dimensions: '25x18x12 cm',
    priority: 'BAJA',
    estimatedDelivery: '2024-01-15 18:00',
    confirmationCode: '345678',
    routeId: 3,
    status: 'ASSIGNED'
  }
};

export const packagesService = {
  // Validar código QR
  validateQR: async (qrCode) => {
    console.log('📦 packagesService - Validando QR:', qrCode);
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar si el QR existe en nuestros datos de prueba
      const packageData = MOCK_PACKAGES[qrCode];
      
      if (packageData) {
        console.log('✅ packagesService - QR válido encontrado:', packageData);
        return {
          isValid: true,
          packageInfo: packageData,
          message: 'QR válido - Paquete encontrado'
        };
      } else {
        console.log('❌ packagesService - QR no válido:', qrCode);
        return {
          isValid: false,
          packageInfo: null,
          message: 'El código QR no corresponde a ningún paquete en tus rutas asignadas'
        };
      }
    } catch (error) {
      console.error('❌ packagesService - Error validando QR:', error);
      throw {
        error: 'No se pudo validar el código QR. Verifica tu conexión a internet'
      };
    }
  },

  // Obtener información de un paquete
  getPackageInfo: async (packageId) => {
    console.log('📦 packagesService - Obteniendo info del paquete:', packageId);
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Buscar paquete por ID
      const packageData = Object.values(MOCK_PACKAGES).find(pkg => pkg.id === packageId);
      
      if (packageData) {
        console.log('✅ packagesService - Paquete encontrado:', packageData);
        return packageData;
      } else {
        throw new Error('Paquete no encontrado');
      }
    } catch (error) {
      console.error('❌ packagesService - Error obteniendo paquete:', error);
      throw {
        error: 'No se pudo obtener la información del paquete'
      };
    }
  },

  // Obtener información de un paquete por QR
  getPackageByQR: async (qrCode) => {
    console.log('📦 packagesService - Obteniendo paquete por QR:', qrCode);
    
    try {
      const packageData = MOCK_PACKAGES[qrCode];
      
      if (packageData) {
        console.log('✅ packagesService - Paquete encontrado por QR:', packageData);
        return packageData;
      } else {
        throw new Error('Paquete no encontrado');
      }
    } catch (error) {
      console.error('❌ packagesService - Error obteniendo paquete por QR:', error);
      throw {
        error: 'No se pudo obtener la información del paquete'
      };
    }
  },

  // Confirmar entrega
  confirmDelivery: async (packageId, confirmationCode) => {
    console.log('📦 packagesService - Confirmando entrega:', { packageId, confirmationCode });
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Buscar paquete por ID
      const packageData = Object.values(MOCK_PACKAGES).find(pkg => pkg.id === packageId);
      
      if (!packageData) {
        throw new Error('Paquete no encontrado');
      }
      
      // Validar código de confirmación
      if (packageData.confirmationCode === confirmationCode) {
        console.log('✅ packagesService - Entrega confirmada exitosamente');
        
        // Actualizar estado del paquete
        packageData.status = 'COMPLETED';
        packageData.deliveredAt = new Date().toISOString();
        
        return {
          success: true,
          message: 'Entrega confirmada exitosamente',
          packageInfo: packageData
        };
      } else {
        console.log('❌ packagesService - Código de confirmación incorrecto');
        return {
          success: false,
          message: 'El código de confirmación no es válido. Verifica con el cliente'
        };
      }
    } catch (error) {
      console.error('❌ packagesService - Error confirmando entrega:', error);
      throw {
        error: 'No se pudo confirmar la entrega. Intenta nuevamente'
      };
    }
  },

  // Activar ruta (cambiar estado a IN_PROGRESS)
  activateRoute: async (routeId, packageId) => {
    console.log('📦 packagesService - Activando ruta:', { routeId, packageId });
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Buscar paquete y actualizar estado
      const packageData = Object.values(MOCK_PACKAGES).find(pkg => pkg.id === packageId);
      
      if (packageData) {
        packageData.status = 'IN_PROGRESS';
        packageData.activatedAt = new Date().toISOString();
        
        console.log('✅ packagesService - Ruta activada exitosamente');
        return {
          success: true,
          message: 'Ruta activada exitosamente',
          packageInfo: packageData
        };
      } else {
        throw new Error('Paquete no encontrado');
      }
    } catch (error) {
      console.error('❌ packagesService - Error activando ruta:', error);
      throw {
        error: 'No se pudo activar la ruta. Intenta nuevamente'
      };
    }
  },

  // Obtener paquetes de una ruta específica
  getPackagesByRoute: async (routeId) => {
    console.log('📦 packagesService - Obteniendo paquetes de ruta:', routeId);
    
    try {
      const packages = Object.values(MOCK_PACKAGES).filter(pkg => pkg.routeId === routeId);
      console.log('✅ packagesService - Paquetes encontrados:', packages);
      return packages;
    } catch (error) {
      console.error('❌ packagesService - Error obteniendo paquetes:', error);
      throw {
        error: 'No se pudieron obtener los paquetes de la ruta'
      };
    }
  },

  // Debug: Mostrar todos los paquetes disponibles
  debugPackages: () => {
    console.log('🔍 packagesService - Paquetes disponibles:', MOCK_PACKAGES);
    return MOCK_PACKAGES;
  }
}; 