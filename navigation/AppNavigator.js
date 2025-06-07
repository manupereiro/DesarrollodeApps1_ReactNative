import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Pantallas
import AvailableRoutes from '../screens/AvailableRoutes';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MyRoutes from '../screens/MyRoutes';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import RouteDetailsScreen from '../screens/RouteDetailsScreen';
import RouteHistoryScreen from '../screens/RouteHistoryScreen';
import RoutesScreen from '../screens/RoutesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Componente para el botón QR personalizado
const QRButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.qrButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.qrButtonInner}>
        <MaterialIcons name="qr-code-scanner" size={30} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

// Pantalla temporal para el QR (para implementar después)
const QRScreen = () => {
  return (
    <View style={styles.qrScreenContainer}>
      <MaterialIcons name="qr-code-scanner" size={100} color="#055A85" />
      <Text style={styles.qrScreenText}>Escáner QR</Text>
      <Text style={styles.qrScreenSubtext}>Funcionalidad próximamente</Text>
    </View>
  );
};



// Tabs principales (autenticado)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#055A85',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        headerShown: false, // Hide all tab headers
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
        name="QRScanner"
        component={QRScreen}
        options={{
          title: '',
          tabBarButton: (props) => (
            <QRButton onPress={props.onPress} />
          ),
          tabBarLabel: () => null,
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
        headerShown: false, // Hide all stack headers
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />
      <Stack.Screen
        name="AvailableRoutes"
        component={AvailableRoutes}
      />
      <Stack.Screen
        name="MyRoutes"
        component={MyRoutes}
      />
      <Stack.Screen
        name="RouteHistory"
        component={RouteHistoryScreen}
      />
      <Stack.Screen
        name="RouteDetails"
        component={RouteDetailsScreen}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
      />
    </Stack.Navigator>
  );
};

// Stack autenticación
const AuthStackWithInitial = ({ initialRouteName, pendingVerification }) => (
  <Stack.Navigator
    initialRouteName={initialRouteName}
    screenOptions={{
      headerShown: false, // Hide all auth headers
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen
      name="VerifyEmail"
      component={VerifyEmailScreen}
      initialParams={pendingVerification ? { email: pendingVerification } : undefined}
    />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

// Navegador principal
const AppNavigator = () => {
  const { state, isLoading: authLoading, pendingVerification, isAuthenticated } = useAuth();
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
  qrButton: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
  },
  qrButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#055A85',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  qrScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  qrScreenText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#055A85',
    marginTop: 20,
  },
  qrScreenSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default AppNavigator;
