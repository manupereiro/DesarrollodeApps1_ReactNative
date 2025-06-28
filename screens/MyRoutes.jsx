import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import RouteCard from '../components/RouteCard';
import { BORDER_RADIUS, COLORS, ELEVATION, FONT_SIZES, SPACING } from '../config/constants';
import { useRoutes } from '../context/RoutesContext';

const MyRoutes = () => {
  const navigation = useNavigation();
  const { myRoutes, loading, error, loadRoutes, cancelRoute, updateRouteStatus } = useRoutes();

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleCancelRoute = async (routeId) => {
    Alert.alert(
      'Cancelar Ruta',
      '¿Estás seguro que deseas cancelar esta ruta?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelRoute(routeId);
              Alert.alert('Éxito', 'Ruta cancelada exitosamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la ruta');
            }
          }
        }
      ]
    );
  };

  const handleNavigateToQR = (route) => {
    if (route.status === 'ASSIGNED') {
      // Navegar al scanner QR para activar la ruta
      navigation.navigate('QRScanner');
    } else if (route.status === 'IN_PROGRESS') {
      // Navegar directamente a PackageInfo para completar la entrega
      navigation.navigate('PackageInfo', {
        packageData: {
          id: route.id,
          qrCode: `PKG00${route.id}`,
          routeId: route.id,
          status: 'IN_PROGRESS',
          description: `Paquete para ${route.destination}`,
          recipientName: 'Cliente Demo',
          recipientPhone: '+54 11 1234-5678',
          address: route.destination,
          weight: '1.0 kg',
          dimensions: '20x15x10 cm',
          priority: 'MEDIA',
          estimatedDelivery: '2024-01-15 16:00',
          confirmationCode: '123456'
        }
      });
    }
  };

  const handleCompleteDelivery = async (routeId) => {
    try {
      await updateRouteStatus(routeId, 'COMPLETED');
      Alert.alert('Éxito', 'Ruta completada exitosamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la ruta');
    }
  };

  const getStatusCounts = () => {
    const assigned = myRoutes.filter(route => route.status === 'ASSIGNED').length;
    const inProgress = myRoutes.filter(route => route.status === 'IN_PROGRESS').length;
    const completed = myRoutes.filter(route => route.status === 'COMPLETED').length;
    
    return { assigned, inProgress, completed };
  };

  const renderRouteCard = ({ item }) => (
    <RouteCard
      route={item}
      onNavigateToCode={handleNavigateToQR}
      onComplete={handleCompleteDelivery}
      onCancel={handleCancelRoute}
      showActions={true}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="local-shipping" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No tienes rutas asignadas</Text>
      <Text style={styles.emptySubtitle}>
        Ve a "Rutas Disponibles" para seleccionar una ruta
      </Text>
      <TouchableOpacity
        style={styles.availableRoutesButton}
        onPress={() => navigation.navigate('AvailableRoutes')}
      >
        <MaterialIcons name="add-road" size={20} color={COLORS.textOnPrimary} />
        <Text style={styles.availableRoutesButtonText}>Ver Rutas Disponibles</Text>
      </TouchableOpacity>
    </View>
  );

  const statusCounts = getStatusCounts();

  if (loading) {
    return <LoadingSpinner message="Cargando tus rutas..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Rutas</Text>
        <TouchableOpacity onPress={loadRoutes}>
          <MaterialIcons name="refresh" size={24} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
      </View>

      {/* Status Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{statusCounts.assigned}</Text>
          <Text style={styles.summaryLabel}>Asignadas</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: COLORS.warning }]}>
            {statusCounts.inProgress}
          </Text>
          <Text style={styles.summaryLabel}>En Progreso</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: COLORS.success }]}>
            {statusCounts.completed}
          </Text>
          <Text style={styles.summaryLabel}>Completadas</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('QRScanner')}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Escanear QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('AvailableRoutes')}
        >
          <MaterialIcons name="add-road" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Nuevas Rutas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('RouteHistory')}
        >
          <MaterialIcons name="history" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Historial</Text>
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={24} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadRoutes}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Routes List */}
      <FlatList
        data={myRoutes}
        renderItem={renderRouteCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={myRoutes.length === 0 ? styles.emptyListContainer : styles.listContainer}
        ListEmptyComponent={!loading && !error ? renderEmptyState : null}
        refreshing={loading}
        onRefresh={loadRoutes}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    ...ELEVATION.low,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    marginVertical: SPACING.xs,
  },
  summaryCard: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
    minWidth: 80,
  },
  quickActionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: SPACING.lg,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  availableRoutesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    ...ELEVATION.low,
  },
  availableRoutesButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
  },
  retryText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});

export default MyRoutes; 