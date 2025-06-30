import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRoutes } from '../context/RoutesContext';
import { profileApi } from '../services/profileApi';
import TokenStorage from '../services/tokenStorage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ELEVATION, BUTTON_STYLES, CARD_STYLES } from '../config/constants';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { myRoutes } = useRoutes();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Stats calculadas
  const completedRoutes = myRoutes?.filter(route => route.status === 'COMPLETED') || [];
  const activeRoutes = myRoutes?.filter(route => 
    route.status === 'ASSIGNED' || route.status === 'IN_PROGRESS'
  ) || [];

  // Función para cargar datos del perfil con auto-recovery
  const loadProfileData = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }
      setError(null);
      
      console.log('🔄 ProfileScreen - Iniciando carga de perfil...');
      
      // 1. Verificar estado del token
      const currentTokenInfo = await TokenStorage.getTokenInfo();
      
      console.log('🔍 ProfileScreen - Estado del token:', currentTokenInfo);
      
      if (!currentTokenInfo?.hasToken) {
        console.warn('⚠️ ProfileScreen - No hay token, usando datos locales');
        setProfileData(user);
        return;
      }
      
      if (currentTokenInfo.isExpired) {
        console.warn('⚠️ ProfileScreen - Token expirado');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      
      // 2. Intentar auto-recovery si hay problemas previos
      let profileResult;
      if (retryCount > 0 || error) {
        console.log('🔧 ProfileScreen - Usando auto-recovery...');
        profileResult = await profileApi.recoverProfile();
        
        if (!profileResult.success) {
          if (profileResult.needsReauth) {
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          }
          throw new Error(profileResult.error || 'Error recovering profile');
        }
        
        setProfileData(profileResult.data);
      } else {
        // 3. Carga normal del perfil
        console.log('🔄 ProfileScreen - Carga normal del perfil...');
        const profile = await profileApi.getProfile();
        setProfileData(profile);
      }
      
      console.log('✅ ProfileScreen - Perfil cargado exitosamente');
      setRetryCount(0); // Reset retry count on success
      
    } catch (error) {
      console.error('❌ ProfileScreen - Error cargando perfil:', error.message);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('Token') || error.message.includes('sesión') || error.message.includes('authentication')) {
        // Error de autenticación - usar datos locales si están disponibles
        if (user) {
          console.log('🔄 ProfileScreen - Usando datos locales del usuario');
          setProfileData(user);
          setError('Algunos datos pueden no estar actualizados. Desliza hacia abajo para actualizar.');
        } else {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
      } else if (error.message.includes('network') || error.message.includes('connectivity')) {
        // Error de red - usar datos locales
        if (user) {
          setProfileData(user);
          setError('Sin conexión. Mostrando datos guardados.');
        } else {
          setError('Sin conexión a internet. Revisa tu conexión.');
        }
      } else {
        // Otros errores - ser permisivo
        if (user) {
          setProfileData(user);
          setError('Error cargando algunos datos. Usando información local.');
        } else {
          setError('Error cargando el perfil. Intenta nuevamente.');
        }
      }
      
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función de refresh más inteligente
  const handleRefresh = useCallback(async () => {
    console.log('🔄 ProfileScreen - Refresh solicitado...');
    setRefreshing(true);
    setError(null);
    await loadProfileData(false);
  }, [retryCount]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProfileData();
  }, []);

  // Auto-refresh cada 30 segundos si hay errores
  useEffect(() => {
    if (error && retryCount > 0 && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log('🔄 ProfileScreen - Auto-retry debido a error...');
        loadProfileData(false);
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 ProfileScreen - Cerrando sesión...');
              await logout();
              console.log('✅ ProfileScreen - Sesión cerrada exitosamente');
            } catch (error) {
              console.error('❌ ProfileScreen - Error cerrando sesión:', error);
              // Continuar con el logout aunque falle
            }
          },
        },
      ],
    );
  };

  const handleRoutePress = (route) => {
    navigation.navigate('RouteDetails', { routeData: route });
  };

  // Función para reintentar manualmente
  const handleRetry = () => {
    console.log('🔄 ProfileScreen - Retry manual solicitado...');
    setError(null);
    loadProfileData();
  };

  if (loading && !profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayData = profileData || user || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="warning" size={20} color={COLORS.warning} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header del perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={60} color={COLORS.textOnPrimary} />
          </View>
          <Text style={styles.username}>{displayData.username || 'Usuario'}</Text>
          <Text style={styles.email}>{displayData.email || 'Sin email'}</Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="assignment-turned-in" size={30} color={COLORS.success} />
            <Text style={styles.statNumber}>{completedRoutes.length}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="local-shipping" size={30} color={COLORS.primary} />
            <Text style={styles.statNumber}>{activeRoutes.length}</Text>
            <Text style={styles.statLabel}>Activas</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={30} color={COLORS.warning} />
            <Text style={styles.statNumber}>{myRoutes?.length || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Rutas recientes */}
        {myRoutes && myRoutes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rutas Recientes</Text>
            {myRoutes.slice(0, 3).map((route) => (
              <TouchableOpacity
                key={route.id}
                style={styles.routeCard}
                onPress={() => handleRoutePress(route)}
              >
                <View style={styles.routeInfo}>
                  <MaterialIcons 
                    name={route.status === 'COMPLETED' ? 'check-circle' : 'radio-button-unchecked'} 
                    size={20} 
                    color={route.status === 'COMPLETED' ? COLORS.success : COLORS.primary} 
                  />
                  <View style={styles.routeDetails}>
                    <Text style={styles.routeDestination}>{route.destination}</Text>
                    <Text style={styles.routeStatus}>{route.status}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Botón de cerrar sesión */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color={COLORS.textOnPrimary} />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...ELEVATION.low,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  errorText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: '#856404',
  },
  retryButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  retryButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  profileHeader: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.textOnPrimary,
  },
  username: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    marginTop: -SPACING.lg,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    ...ELEVATION.medium,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    ...CARD_STYLES.default,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  routeDestination: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  routeStatus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  logoutContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  logoutButton: {
    ...BUTTON_STYLES.danger,
    flexDirection: 'row',
  },
  logoutButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
});

export default ProfileScreen; 