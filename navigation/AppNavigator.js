import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

// Importar pantallas
import AvailableRoutes from '../screens/AvailableRoutes';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MyRoutes from '../screens/MyRoutes';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import RoutesScreen from '../screens/RoutesScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack de autenticación
const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
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
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Iniciar Sesión' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Registro' }}
      />
      <Stack.Screen 
        name="VerifyEmail" 
        component={VerifyEmailScreen} 
        options={{ title: 'Verificar Email' }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ title: 'Recuperar Contraseña' }}
      />
      <Stack.Screen 
        name="VerifyCode" 
        component={VerifyCodeScreen} 
        options={{ title: 'Verificar Código' }}
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen} 
        options={{ title: 'Nueva Contraseña' }}
      />
    </Stack.Navigator>
  );
};

// Tabs principales (cuando el usuario está autenticado)
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

// Stack principal (cuando el usuario está autenticado)
const MainStack = () => {
  return (
    <Stack.Navigator
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
    </Stack.Navigator>
  );
};

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
  const { isAuthenticated, isLoading, pendingVerification } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AuthStackWithInitial
        initialRouteName={pendingVerification ? 'VerifyEmail' : 'Login'}
        pendingVerification={pendingVerification}
      />
    </NavigationContainer>
  );
};

export default AppNavigator; 