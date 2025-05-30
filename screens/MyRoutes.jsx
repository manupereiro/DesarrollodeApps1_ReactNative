import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import RouteCard from '../components/RouteCard';
import { useRoutes } from '../context/RoutesContext';

const MyRoutes = () => {
  const { myRoutes, loading, error, cancelRoute, updateRouteStatus } = useRoutes();

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

  return (
    <View style={styles.container}>
      <FlatList
        data={myRoutes}
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
});

export default MyRoutes; 