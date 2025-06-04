import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import RouteCard from '../components/RouteCard';
import { useRoutes } from '../context/RoutesContext';

const AvailableRoutes = () => {
  const { availableRoutes, loading, error, selectRoute } = useRoutes();

  const handleSelectRoute = async (routeId) => {
    try {
      await selectRoute(routeId);
      Alert.alert(
        'Ruta seleccionada',
        'Has seleccionado la ruta exitosamente',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Error al seleccionar la ruta'
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
        data={availableRoutes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            onSelect={() => handleSelectRoute(item.id)}
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

export default AvailableRoutes; 