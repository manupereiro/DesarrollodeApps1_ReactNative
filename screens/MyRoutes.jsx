import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import RouteCard from '../components/RouteCard';
import { useRoutes } from '../context/RoutesContext';
import { COLORS, SPACING, FONT_SIZES } from '../config/constants';

const MyRoutes = ({ navigation }) => {
  const { myRoutes, loading, error, cancelRoute, updateRouteStatus } = useRoutes();

  // Filtrar solo las rutas activas (no completadas ni canceladas)
  const activeRoutes = myRoutes.filter(route => 
    route.status !== 'COMPLETED' && route.status !== 'CANCELLED'
  );

  const handleCancelRoute = async (routeId) => {
    try {
      console.log('🔄 MyRoutes - Cancelando ruta:', routeId);
      const result = await cancelRoute(routeId);
      
      // Si no hubo excepción, mostrar éxito (incluso si result es null)
      Alert.alert(
        'Ruta cancelada',
        'Has cancelado la ruta exitosamente',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ MyRoutes - Error al cancelar ruta:', error);
      
      // Solo mostrar error si realmente es un error grave
      Alert.alert(
        'Error',
        'Hubo un problema al cancelar la ruta. Revisa la lista para ver si se canceló.',
        [{ text: 'OK' }]
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

  const handleNavigateToConfirmationCode = (route) => {
    navigation.navigate('ConfirmationCode', {
      routeId: route.id,
      routeInfo: route
    });
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
            onNavigateToCode={handleNavigateToConfirmationCode}
            showActions={true}
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

export default MyRoutes; 