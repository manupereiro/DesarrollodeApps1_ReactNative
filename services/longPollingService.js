import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { getApiConfig } from '../config/apiConfig';

class LongPollingService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.pollingInterval = 30000; // 30 segundos
    this.lastCheck = null;
    this.authToken = null;
    this.isExpoGo = Constants.appOwnership === 'expo';
    this.notificationHandlerConfigured = false;
    
    console.log('🔧 LongPollingService inicializado -', this.isExpoGo ? 'Expo Go' : 'Development Build');
  }

  // Configurar el handler de notificaciones
  async setupNotificationHandler() {
    try {
      if (this.notificationHandlerConfigured) {
        return true;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Solicitar permisos de notificaciones
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Permisos de notificación no otorgados');
        return false;
      }

      this.notificationHandlerConfigured = true;
      console.log('✅ Notificaciones locales configuradas');
      return true;
    } catch (error) {
      console.error('❌ Error configurando notificaciones:', error);
      return false;
    }
  }

  // Configurar token de autenticación
  setAuthToken(token) {
    this.authToken = token;
    console.log('🔑 Token de autenticación configurado');
  }

  // Configurar intervalo de polling
  setPollingInterval(intervalMs) {
    this.pollingInterval = intervalMs;
    console.log(`⏱️ Intervalo configurado: ${intervalMs}ms`);
    
    // Si está corriendo, reiniciar con nuevo intervalo
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  // Iniciar Long Polling
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Ya está corriendo');
      return;
    }

    if (!this.authToken) {
      console.log('⚠️ No hay token de autenticación');
      return;
    }

    console.log(`🚀 Iniciando Long Polling cada ${this.pollingInterval}ms`);
    this.isRunning = true;
    
    // Configurar notificaciones
    if (!this.notificationHandlerConfigured) {
      await this.setupNotificationHandler();
    }
    
    // Primera verificación inmediata
    this.checkForNotifications();
    
    // Configurar verificaciones periódicas
    this.intervalId = setInterval(() => {
      this.checkForNotifications();
    }, this.pollingInterval);
  }

  // Detener Long Polling
  stop() {
    if (!this.isRunning) return;

    console.log('🛑 Deteniendo Long Polling');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Verificar notificaciones en el servidor
  async checkForNotifications() {
    if (!this.authToken) return;

    try {
      const now = new Date().toLocaleTimeString();
      console.log(`📡 [${now}] Verificando notificaciones...`);
      
      const config = getApiConfig();
      const url = `${config.baseURL}/notifications/poll`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      if (!response.ok) {
        // Manejo específico de errores de autenticación
        if (response.status === 401 || response.status === 403) {
          console.log(`🔐 Error de autenticación (${response.status}): Token posiblemente expirado`);
          return;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.notifications && data.notifications.length > 0) {
        console.log(`📬 [${now}] ${data.notifications.length} notificaciones nuevas`);
        
        // Mostrar cada notificación
        for (const notification of data.notifications) {
          await this.showLocalNotification(notification);
        }
        
        // Marcar todas como leídas después de mostrarlas
        await this.markAllNotificationsAsRead();
      } else {
        console.log(`📭 [${now}] Sin notificaciones nuevas`);
      }

    } catch (error) {
      console.error('❌ Error en polling:', error);
    }
  }

  // Mostrar notificación local
  async showLocalNotification(notification) {
    try {
      // Si no están configuradas las notificaciones, intentar configurarlas
      if (!this.notificationHandlerConfigured) {
        const configured = await this.setupNotificationHandler();
        if (!configured) {
          console.log('📝 Notificación recibida pero permisos no otorgados:', notification.title);
          return;
        }
      }

      console.log('📱 Mostrando notificación:', notification.title);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: {
            id: notification.id,
            type: notification.type,
            routeId: notification.route?.id,
            timestamp: notification.createdAt,
          },
        },
        trigger: null, // Mostrar inmediatamente
      });

    } catch (error) {
      console.log('📝 No se pudo mostrar notificación local:', notification.title);
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllNotificationsAsRead() {
    if (!this.authToken) return;

    try {
      const config = getApiConfig();
      const url = `${config.baseURL}/notifications/read-all`;
      
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });

    } catch (error) {
      console.error('❌ Error marcando como leídas:', error);
    }
  }

  // Obtener estado del servicio
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasToken: !!this.authToken,
      pollingInterval: this.pollingInterval,
      isExpoGo: this.isExpoGo,
      lastCheck: this.lastCheck,
    };
  }
}

// Instancia singleton
const longPollingService = new LongPollingService();

export default longPollingService; 