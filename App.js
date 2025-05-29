import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { RoutesProvider } from './context/RoutesContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RoutesProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </RoutesProvider>
    </AuthProvider>
  );
} 