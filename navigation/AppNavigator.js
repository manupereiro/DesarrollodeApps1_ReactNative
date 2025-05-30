import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

// Pantallas
import AvailableRoutes from '../screens/AvailableRoutes';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MyRoutes from '../screens/MyRoutes';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import RoutesScreen from '../screens/RoutesScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tabs principales (autenticado)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Routes"
        component={RoutesScreen}
        options={{
          title: 'Rutas',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="local-shipping" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Stack principal (autenticado)
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2196F3' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AvailableRoutes"
        component={AvailableRoutes}
        options={{ title: 'Rutas Disponibles' }}
      />
      <Stack.Screen
        name="MyRoutes"
        component={MyRoutes}
        options={{ title: 'Mis Rutas' }}
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

// Stack autenticación
const AuthStackWithInitial = ({ initialRouteName, pendingVerification }) => (
  <Stack.Navigator
    initialRouteName={initialRouteName}
    screenOptions={{
      headerStyle: { backgroundColor: '#2196F3' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
    <Stack.Screen
      name="VerifyEmail"
      component={VerifyEmailScreen}
      options={{ title: 'Verificar Email' }}
      initialParams={pendingVerification ? { email: pendingVerification } : undefined}
    />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar Contraseña' }} />
    <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} options={{ title: 'Verificar Código' }} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Nueva Contraseña' }} />
  </Stack.Navigator>
);

// Navegador principal
const AppNavigator = () => {
  const { state, isLoading: authLoading, pendingVerification } = useAuth();
  const { userToken } = state || {};
  const [hasBootstrapped, setHasBootstrapped] = useState(false);

  useEffect(() => {
    if (!authLoading && !hasBootstrapped) {
      setHasBootstrapped(true);
    }
  }, [authLoading, hasBootstrapped]);

  if (!hasBootstrapped) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const isAuthenticated = !!userToken;

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppStack />
      ) : (
        <AuthStackWithInitial
          initialRouteName={pendingVerification ? 'VerifyEmail' : 'Login'}
          pendingVerification={pendingVerification}
        />
      )}
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
