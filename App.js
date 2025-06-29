import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';

import { AuthProvider } from './context/AuthContext';
import { RoutesProvider } from './context/RoutesContext';
import AppNavigator from './navigation/AppNavigator';

import { registerForPushNotificationsAsync } from './services/pushNotifications';
import * as userApi from './services/userApi';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      console.log('Expo Push Token:', token);
      if (token) {
        userApi.savePushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Respuesta:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
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
