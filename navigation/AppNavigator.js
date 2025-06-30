import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, ELEVATION, FONT_SIZES, SPACING } from '../config/constants';
import { useAuth } from '../context/AuthContext';

// Pantallas
import AvailableRoutes from '../screens/AvailableRoutes';
import ConfirmationCodeScreen from '../screens/ConfirmationCodeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MyRoutes from '../screens/MyRoutes';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import PackageInfoScreen from '../screens/PackageInfoScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
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
        <MaterialIcons name="qr-code-scanner" size={30} color={COLORS.textOnPrimary} />
      </View>
    </TouchableOpacity>
  );
};

// Tabs principales (autenticado)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 70,
          paddingBottom: SPACING.sm,
          paddingTop: SPACING.sm,
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
        component={QRScannerScreen}
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
          title: 'Pedidos',
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
      <Stack.Screen
        name="PackageInfo"
        component={PackageInfoScreen}
      />
      <Stack.Screen
        name="ConfirmationCode"
        component={ConfirmationCodeScreen}
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
        <ActivityIndicator size="large" color={COLORS.primary} />
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
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
    borderRadius: BORDER_RADIUS.xl * 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...ELEVATION.high,
    borderWidth: 4,
    borderColor: COLORS.surface,
  },
  qrScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  qrScreenText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.lg,
  },
  qrScreenSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});

export default AppNavigator;
