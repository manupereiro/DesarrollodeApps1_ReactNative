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
      await this.scheduleNextRefresh();
    } catch (error) {
      // Error iniciando auto-refresh
    }
  };

  // Detener el auto-refresh
  stopAutoRefresh = () => {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  };

  // Programar el próximo refresh
  scheduleNextRefresh = async () => {
    try {
      const token = await TokenStorage.getToken();
      if (!token) {
        return;
      }

      const timeUntilRefresh = this.getTimeUntilRefresh(token);
      
      if (timeUntilRefresh > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshTokenIfNeeded();
        }, timeUntilRefresh);
      } else {
        await this.refreshTokenIfNeeded();
      }
    } catch (error) {
      // Error programando refresh
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
      return 0;
    }
  };

  // Refrescar token si es necesario
  refreshTokenIfNeeded = async () => {
    if (this.isRefreshing) {
      return;
    }

    try {
      this.isRefreshing = true;

      // Obtener credenciales guardadas (si las tienes)
      const userData = await TokenStorage.getUserData();
      
      if (!userData || !userData.username) {
        return;
      }

      // Aquí podrías implementar un endpoint de refresh token
      // Por ahora, simularemos que el token se mantiene válido
      
      // Programar el próximo refresh
      await this.scheduleNextRefresh();
      
    } catch (error) {
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
    await this.refreshTokenIfNeeded();
  };
}

// Instancia singleton
const tokenRefreshService = new TokenRefreshService();

export default tokenRefreshService;