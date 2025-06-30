import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';

import { AuthProvider } from './context/AuthContext';
import { RoutesProvider } from './context/RoutesContext';
import AppNavigator from './navigation/AppNavigator';

import { registerForPushNotificationsAsync } from './services/pushNotifications';
import * as userApi from './services/userApi';

export default function App() {
  useEffect(() => {
    // Verificar si estamos en Expo Go
    const isExpoGo = Constants.appOwnership === 'expo';
    console.log('🚀 App iniciando -', isExpoGo ? 'Expo Go' : 'Development Build');

    if (isExpoGo) {
      console.log('📡 Notificaciones vía Long Polling (cada 30s)');
    }

    // Inicializar Long Polling Service
    const initializeLongPolling = async () => {
      try {
        const longPollingService = await import('./services/longPollingService');
        console.log('✅ Long Polling Service preparado');
      } catch (error) {
        console.error('❌ Error inicializando Long Polling:', error);
      }
    };

    initializeLongPolling();
  }, []);

  return (
    <AuthProvider>
      <RoutesProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </RoutesProvider>
    </AuthProvider>
  );
}
