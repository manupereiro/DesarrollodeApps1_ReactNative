import TokenStorage from './tokenStorage';
import authApi from './authApi';

class TokenRefreshService {
  constructor() {
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.refreshThreshold = 5 * 60 * 1000; // 5 minutos antes de expirar
  }

  // Iniciar el servicio de auto-refresh
  startAutoRefresh = async () => {
    try {
      console.log('🔄 TokenRefresh - Iniciando auto-refresh...');
      await this.scheduleNextRefresh();
    } catch (error) {
      console.error('❌ TokenRefresh - Error iniciando auto-refresh:', error);
    }
  };

  // Detener el auto-refresh
  stopAutoRefresh = () => {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
      console.log('🛑 TokenRefresh - Auto-refresh detenido');
    }
  };

  // Programar el próximo refresh
  scheduleNextRefresh = async () => {
    try {
      const token = await TokenStorage.getToken();
      if (!token) {
        console.log('⚠️ TokenRefresh - No hay token, deteniendo auto-refresh');
        return;
      }

      const timeUntilRefresh = this.getTimeUntilRefresh(token);
      
      if (timeUntilRefresh > 0) {
        console.log(`⏰ TokenRefresh - Próximo refresh en ${Math.floor(timeUntilRefresh / 60000)} minutos`);
        
        this.refreshTimer = setTimeout(() => {
          this.refreshTokenIfNeeded();
        }, timeUntilRefresh);
      } else {
        console.log('⚠️ TokenRefresh - Token próximo a expirar, refrescando ahora...');
        await this.refreshTokenIfNeeded();
      }
    } catch (error) {
      console.error('❌ TokenRefresh - Error programando refresh:', error);
    }
  };

  // Calcular tiempo hasta el refresh
  getTimeUntilRefresh = (token) => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return 0;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      if (!payload.exp) {
        return 0;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiryTime = payload.exp;
      const refreshTime = expiryTime - (this.refreshThreshold / 1000);
      
      return Math.max(0, (refreshTime - now) * 1000);
    } catch (error) {
      console.error('❌ TokenRefresh - Error calculando tiempo:', error);
      return 0;
    }
  };

  // Refrescar token si es necesario
  refreshTokenIfNeeded = async () => {
    if (this.isRefreshing) {
      console.log('🔄 TokenRefresh - Ya hay un refresh en progreso...');
      return;
    }

    try {
      this.isRefreshing = true;
      console.log('🔄 TokenRefresh - Intentando refrescar token...');

      // Obtener credenciales guardadas (si las tienes)
      const userData = await TokenStorage.getUserData();
      
      if (!userData || !userData.username) {
        console.log('⚠️ TokenRefresh - No hay credenciales guardadas para refresh');
        return;
      }

      // Aquí podrías implementar un endpoint de refresh token
      // Por ahora, simularemos que el token se mantiene válido
      console.log('✅ TokenRefresh - Token mantenido válido (simulado)');
      
      // Programar el próximo refresh
      await this.scheduleNextRefresh();
      
    } catch (error) {
      console.error('❌ TokenRefresh - Error refrescando token:', error);
      // Si falla el refresh, intentar de nuevo en 1 minuto
      this.refreshTimer = setTimeout(() => {
        this.refreshTokenIfNeeded();
      }, 60000);
    } finally {
      this.isRefreshing = false;
    }
  };

  // Refresh manual del token
  manualRefresh = async () => {
    console.log('🔄 TokenRefresh - Refresh manual solicitado...');
    await this.refreshTokenIfNeeded();
  };
}

// Instancia singleton
const tokenRefreshService = new TokenRefreshService();

export default tokenRefreshService; 