import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Importar pantallas
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

const Stack = createStackNavigator();

// Stack de autenticación con ruta inicial dinámica
const AuthStackWithInitial = ({ initialRoute }) => {
  console.log('🔄 AuthStackWithInitial: Inicializando con initialRoute =', initialRoute);
  
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
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
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Navegador principal
const AppNavigator = () => {
  const { state } = useAuth();
  const { userToken, isLoading, user } = state;
  
  // Determinar si está autenticado basado en la presencia del token
  const isAuthenticated = !!userToken;
  
  console.log('🔍 AppNavigator: isAuthenticated =', isAuthenticated, 'isLoading =', isLoading);
  console.log('🔍 AppNavigator: userToken =', userToken ? 'existe' : 'no existe');
  console.log('👤 AppNavigator: user =', user);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  console.log('🚀 AppNavigator: Navegando a', isAuthenticated ? 'MainStack' : 'AuthStack');

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStackWithInitial initialRoute="LoginScreen" />}
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