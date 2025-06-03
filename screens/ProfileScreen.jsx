import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRoutes } from '../context/RoutesContext';
import profileApi from '../services/profileApi';

const ProfileScreen = ({ navigation }) => {
  const { state } = useAuth();
  const { user } = state;
  const { myRoutes, loading: routesLoading, loadRoutes } = useRoutes();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [completedRoutes, setCompletedRoutes] = useState([]);

  useEffect(() => {
    loadProfileData();
    loadRoutes();
  }, []);

  useEffect(() => {
    // Filtrar solo las rutas completadas
    const completed = myRoutes.filter(route => route.status === 'COMPLETED');
    // Ordenar por fecha de completado (más recientes primero)
    const sorted = completed.sort((a, b) => 
      new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt)
    );
    setCompletedRoutes(sorted);
  }, [myRoutes]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await profileApi.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error cargando datos del perfil:', err);
      setError(err.message || 'Error al cargar los datos');
      Alert.alert(
        'Error',
        'No se pudieron cargar los datos del perfil. Por favor, intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadProfileData();
    loadRoutes();
  };

  const handleRoutePress = (route) => {
    navigation.navigate('RouteDetails', { routeData: route });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={60} color="#2196F3" />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.username || 'Usuario'}</Text>
            
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#fff" style={styles.infoIcon} />
                <Text style={styles.userEmail}>{profile?.email || 'No disponible'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Route History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial de Rutas</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('RouteHistory')}
            >
              <Text style={styles.seeAllButtonText}>Ver todo</Text>
              <Ionicons name="chevron-forward" size={16} color="#2196F3" />
            </TouchableOpacity>
          </View>

          {routesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.loadingText}>Cargando rutas...</Text>
            </View>
          ) : completedRoutes.length === 0 ? (
            <View style={styles.emptyOrdersContainer}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#ccc" />
              <Text style={styles.emptyOrdersText}>No hay rutas completadas</Text>
            </View>
          ) : (
            completedRoutes.slice(0, 3).map((route) => (
              <TouchableOpacity 
                key={route.id} 
                style={styles.routeCard}
                onPress={() => handleRoutePress(route)}
              >
                <View style={styles.routeHeader}>
                  <View>
                    <Text style={styles.routeDate}>
                      {new Date(route.completedAt || route.updatedAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.routeTime}>
                      {new Date(route.completedAt || route.updatedAt).toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Completada</Text>
                  </View>
                </View>

                <View style={styles.routeContent}>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={20} color="#666" />
                    <Text style={styles.locationText} numberOfLines={1}>{route.origin}</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Ionicons name="flag" size={20} color="#666" />
                    <Text style={styles.locationText} numberOfLines={1}>{route.destination}</Text>
                  </View>
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                      <Ionicons name="speedometer" size={20} color="#666" />
                      <Text style={styles.detailText}>{route.distance} km</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={20} color="#666" />
                      <Text style={styles.detailText}>
                        {route.estimatedDuration ? `${route.estimatedDuration} mins` : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#2196F3',
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  infoIcon: {
    marginRight: 12,
    opacity: 0.9,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeAllButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyOrdersContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
  },
  emptyOrdersText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  routeTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  routeContent: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default ProfileScreen; 