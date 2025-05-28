import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

// Importar pantallas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

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

// Stack principal (cuando el usuario está autenticado)
const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
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