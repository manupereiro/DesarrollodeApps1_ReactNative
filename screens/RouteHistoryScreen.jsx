import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useRoutes } from '../context/RoutesContext';

const RouteHistoryScreen = ({ navigation }) => {
  const { myRoutes, loading, error, loadRoutes } = useRoutes();
  const [completedRoutes, setCompletedRoutes] = useState([]);

  useEffect(() => {
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

  const handleRefresh = () => {
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
          <Text style={styles.headerTitle}>Historial de Rutas</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
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
          <Text style={styles.headerTitle}>Historial de Rutas</Text>
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
        <Text style={styles.headerTitle}>Historial de Rutas</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {completedRoutes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay rutas completadas en tu historial</Text>
        </View>
      ) : (
        <FlatList
          data={completedRoutes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.routeCard}
              onPress={() => handleRoutePress(item)}
            >
              <View style={styles.routeHeader}>
                <View style={styles.timestampContainer}>
                  <Text style={styles.routeDate}>
                    {item.completedDate || new Date(item.completedAt || item.updatedAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.timeDetails}>
                    <View style={styles.timeItem}>
                      <Ionicons name="play-circle" size={16} color="#4CAF50" />
                      <Text style={styles.timeLabel}>Iniciada:</Text>
                      <Text style={styles.timeValue}>
                        {item.startedTime || (item.startedAt ? new Date(item.startedAt).toLocaleTimeString() : 'N/A')}
                      </Text>
                    </View>
                    <View style={styles.timeItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#2196F3" />
                      <Text style={styles.timeLabel}>Completada:</Text>
                      <Text style={styles.timeValue}>
                        {item.completedTime || new Date(item.completedAt || item.updatedAt).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Completada</Text>
                </View>
              </View>

              <View style={styles.routeContent}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={20} color="#666" />
                  <Text style={styles.locationText}>{item.origin}</Text>
                </View>
                <View style={styles.locationContainer}>
                  <Ionicons name="flag" size={20} color="#666" />
                  <Text style={styles.locationText}>{item.destination}</Text>
                </View>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Ionicons name="speedometer" size={20} color="#666" />
                    <Text style={styles.detailText}>{item.distance} km</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={20} color="#666" />
                    <Text style={styles.detailText}>
                      {item.estimatedDuration ? `${item.estimatedDuration} mins` : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
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
  timestampContainer: {
    flex: 1,
  },
  routeDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timeDetails: {
    gap: 6,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timeValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
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

export default RouteHistoryScreen; 