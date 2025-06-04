import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import RouteCard from '../components/RouteCard';
import { useRoutes } from '../context/RoutesContext';

const MyRoutes = () => {
  const { myRoutes, loading, error, cancelRoute, updateRouteStatus } = useRoutes();

  // Filtrar solo las rutas activas (no completadas ni canceladas)
  const activeRoutes = myRoutes.filter(route => 
    route.status !== 'COMPLETED' && route.status !== 'CANCELLED'
  );

  const handleCancelRoute = async (routeId) => {
    try {
      await cancelRoute(routeId);
      Alert.alert(
        'Ruta cancelada',
        'Has cancelado la ruta exitosamente',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Error al cancelar la ruta'
      );
    }
  };

  const handleCompleteRoute = async (routeId) => {
    try {
      await updateRouteStatus(routeId, 'COMPLETED');
      Alert.alert(
        'Ruta completada',
        'Has completado la ruta exitosamente',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Error al completar la ruta'
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (activeRoutes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes rutas activas en este momento</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activeRoutes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            onCancel={() => handleCancelRoute(item.id)}
            onComplete={() => handleCompleteRoute(item.id)}
            showActions={true}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MyRoutes; 