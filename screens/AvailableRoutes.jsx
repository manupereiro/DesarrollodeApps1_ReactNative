import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import RouteCard from '../components/RouteCard';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';
import { useRoutes } from '../context/RoutesContext';

const AvailableRoutes = () => {
  const { availableRoutes, loading, error, selectRoute } = useRoutes();

  // Debug: Log las rutas que llegan al componente
  console.log('🔍 AvailableRoutes - Rutas disponibles:', availableRoutes?.length || 0);
  if (availableRoutes && availableRoutes.length > 0) {
    console.log('🔍 AvailableRoutes - Primera ruta completa:', JSON.stringify(availableRoutes[0], null, 2));
  }

  const handleSelectRoute = async (routeId) => {
    try {
      await selectRoute(routeId);
      Alert.alert(
        'Pedido seleccionado',
        'Has seleccionado el pedido exitosamente',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Error al seleccionar el pedido'
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!availableRoutes || availableRoutes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay pedidos disponibles en este momento</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={availableRoutes}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            onSelect={() => handleSelectRoute(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: SPACING.sm,
  },
});

export default AvailableRoutes; 