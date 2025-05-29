import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Importar pantallas
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

const Stack = createStackNavigator();

// Stack de autenticación (NO autenticado)
const AuthStack = () => {
  console.log('🔄 AuthStack: Renderizando stack de autenticación');
  
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="LoginScreen" 
        component={LoginScreen} 
        options={{ title: 'Iniciar Sesión' }}
      />
      <Stack.Screen 
        name="RegisterScreen" 
        component={RegisterScreen} 
        options={{ title: 'Registro' }}
      />
      <Stack.Screen 
        name="VerifyEmailScreen" 
        component={VerifyEmailScreen} 
        options={{ title: 'Verificar Email' }}
      />
      <Stack.Screen 
        name="ForgotPasswordScreen" 
        component={ForgotPasswordScreen} 
        options={{ title: 'Recuperar Contraseña' }}
      />
      <Stack.Screen 
        name="VerifyCodeScreen" 
        component={VerifyCodeScreen} 
        options={{ title: 'Verificar Código' }}
      />
      <Stack.Screen 
        name="ResetPasswordScreen" 
        component={ResetPasswordScreen} 
        options={{ title: 'Nueva Contraseña' }}
      />
    </Stack.Navigator>
  );
};

// Stack principal (autenticado)
const AppStack = () => {
  console.log('🔄 AppStack: Renderizando stack principal');
  
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ 
          title: 'Inicio',
          headerLeft: null, // No se puede volver atrás
          gestureEnabled: false, // Deshabilitar gesto de vuelta
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Mi Perfil' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Configuración' }}
      />
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen} 
        options={{ title: 'Historial de Pedidos' }}
      />
      <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen} 
        options={{ title: 'Detalles del Pedido' }}
      />
    </Stack.Navigator>
  );
};

// Navegador principal
const AppNavigator = () => {
  const { state } = useAuth();
  const { userToken, isLoading, user } = state;
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  
  console.log('🔍 AppNavigator: Renderizando navegador principal');
  console.log('🔍 AppNavigator: isLoading =', isLoading);
  console.log('🔍 AppNavigator: hasBootstrapped =', hasBootstrapped);
  console.log('🔍 AppNavigator: userToken =', userToken ? 'existe' : 'no existe');
  console.log('👤 AppNavigator: user =', user);

  // Marcar como bootstrapped cuando termine la carga inicial
  useEffect(() => {
    if (!isLoading && !hasBootstrapped) {
      console.log('✅ AppNavigator: Bootstrap completado');
      setHasBootstrapped(true);
    }
  }, [isLoading, hasBootstrapped]);

  // Pantalla de carga SOLO durante bootstrap inicial
  if (!hasBootstrapped) {
    console.log('⏳ AppNavigator: Mostrando pantalla de carga inicial');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Determinar qué stack mostrar
  const isAuthenticated = !!userToken;
  console.log('🚀 AppNavigator: isAuthenticated =', isAuthenticated);
  console.log('🚀 AppNavigator: Navegando a', isAuthenticated ? 'AppStack' : 'AuthStack');

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default AppNavigator; 