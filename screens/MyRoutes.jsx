import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import RouteCard from '../components/RouteCard';
import { BORDER_RADIUS, COLORS, ELEVATION, FONT_SIZES, SPACING } from '../config/constants';
import { useRoutes } from '../context/RoutesContext';

const MyRoutes = () => {
  const navigation = useNavigation();
  const { myRoutes, loading, error, loadRoutes, cancelRoute, updateRouteStatus, scannedPackages, isPackageScanned } = useRoutes();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Estados para modal de verificación
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [verificationError, setVerificationError] = useState('');

  // CRÍTICO: Crear rutas sincronizadas con paquetes escaneados usando useMemo
  const syncedRoutes = useMemo(() => {
    const filtered = myRoutes.filter(route => route.status !== 'COMPLETED');
    
    return filtered.map(route => {
      const hasScannedPackages = route.packages?.some(pkg => 
        pkg.scanned || scannedPackages.has(pkg.id)
      );
      
      const syncedRoute = {
        ...route,
        packages: route.packages?.map(pkg => ({
          ...pkg,
          scanned: pkg.scanned || scannedPackages.has(pkg.id)
        })) || []
      };
      
      return syncedRoute;
    });
  }, [myRoutes, scannedPackages]);

  // CRÍTICO: NO recargar automáticamente para preservar cambios locales
  useEffect(() => {
    // Solo cargar rutas si no tenemos ninguna
    if (myRoutes.length === 0) {
      loadRoutes();
    }
  }, []);

  // Escuchar cuando la pantalla se enfoca (cuando navegas desde PackageInfo)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setForceUpdate(prev => prev + 1);
    });

    return unsubscribe;
  }, [navigation, scannedPackages, myRoutes]);

  const handleCancelRoute = async (routeId) => {
    try {
      await cancelRoute(routeId);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cancelar la ruta');
    }
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

  const handleCompleteDelivery = async (route) => {
    const currentVerificationCode = route.verificationCode || route.confirmationCode;
    
    // Abrir modal de verificación
    setSelectedRoute(route);
    setShowVerificationModal(true);
    setVerificationCode('');
    setVerificationError('');
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setVerificationError('Por favor ingresa el código de verificación');
      return;
    }

    const expectedCode = selectedRoute.verificationCode || selectedRoute.confirmationCode;
    
    // Verificar código
    if (verificationCode.trim() === expectedCode) {
      try {
        // Cerrar modal
        setShowVerificationModal(false);
        setSelectedRoute(null);
        setVerificationCode('');
        setVerificationError('');

        // Actualizar estado de la ruta a completada
        const completedAt = new Date().toISOString();
        updateRouteStatus(selectedRoute.id, 'COMPLETED', {
          completedAt,
          completedDate: new Date().toLocaleDateString(),
          completedTime: new Date().toLocaleTimeString()
        });
        
        Alert.alert(
          '✅ Entrega Completada',
          'La entrega se ha completado exitosamente. La ruta aparecerá en tu historial de pedidos.',
          [{ text: 'OK' }]
        );
      } catch (error) {
        Alert.alert('Error', 'No se pudo completar la entrega');
      }
    } else {
      // Código incorrecto
      setVerificationError('Código de verificación incorrecto');
    }
  };

  const getStatusCounts = () => {
    const assigned = syncedRoutes.filter(route => route.status === 'ASSIGNED').length;
    const inProgress = syncedRoutes.filter(route => route.status === 'IN_PROGRESS').length;
    const completed = syncedRoutes.filter(route => route.status === 'COMPLETED').length;
    
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
      <Text style={styles.emptyTitle}>No tienes pedidos activos</Text>
      <Text style={styles.emptySubtitle}>
        Ve a "Pedidos Disponibles" para seleccionar un pedido.{'\n'}
        Los pedidos completados aparecen en el historial desde tu perfil.
      </Text>
      <TouchableOpacity
        style={styles.availableRoutesButton}
        onPress={() => navigation.navigate('AvailableRoutes')}
      >
        <MaterialIcons name="add-road" size={20} color={COLORS.textOnPrimary} />
        <Text style={styles.availableRoutesButtonText}>Ver Pedidos Disponibles</Text>
      </TouchableOpacity>
    </View>
  );

  const statusCounts = getStatusCounts();

  if (loading) {
    return <LoadingSpinner message="Cargando tus pedidos..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
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

      {/* Quick Actions - SIN historial de pedidos */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionButton, { flex: 1 }]}
          onPress={() => navigation.navigate('QRScanner')}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Escanear QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, { flex: 1 }]}
          onPress={() => navigation.navigate('AvailableRoutes')}
        >
          <MaterialIcons name="add-road" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Nuevos Pedidos</Text>
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

      {/* Routes List - USANDO SYNCEDROUTES */}
      <FlatList
        data={syncedRoutes}
        renderItem={renderRouteCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={syncedRoutes.length === 0 ? styles.emptyListContainer : styles.listContainer}
        ListEmptyComponent={!loading && !error ? renderEmptyState : null}
        refreshing={loading}
        onRefresh={() => {
          loadRoutes();
        }}
      />

      {/* Modal de Verificación */}
      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowVerificationModal(false);
          setVerificationCode('');
          setVerificationError('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Entrega</Text>
              {selectedRoute && (
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>Pedido: {selectedRoute.id}</Text>
                  <Text style={styles.routeDestination}>{selectedRoute.destination}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.modalSubtitle}>
              Ingresa el código de verificación para completar la entrega:
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.codeInput,
                  verificationError ? styles.inputError : null
                ]}
                value={verificationCode}
                onChangeText={(text) => {
                  setVerificationCode(text);
                  setVerificationError(''); // Limpiar error al escribir
                }}
                placeholder="Código de verificación"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                maxLength={10}
                autoFocus={true}
                selectTextOnFocus={true}
              />
              
              {verificationError ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                  <MaterialIcons name="error" size={16} color={COLORS.error} />
                  <Text style={styles.errorMessage}>{verificationError}</Text>
                </View>
              ) : null}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowVerificationModal(false);
                  setVerificationCode('');
                  setVerificationError('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  !verificationCode.trim() ? styles.disabledButton : null
                ]}
                onPress={handleVerifyCode}
                disabled={!verificationCode.trim()}
              >
                <MaterialIcons name="check-circle" size={16} color={COLORS.textOnPrimary} />
                <Text style={styles.confirmButtonText}>Verificar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    width: '85%',
    maxWidth: 400,
    ...ELEVATION.high,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  routeInfo: {
    backgroundColor: COLORS.lightGray,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  routeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  routeDestination: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  codeInput: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.divider,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorMessage: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.sm,
    marginTop: SPACING.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...ELEVATION.low,
  },
  cancelButton: {
    backgroundColor: COLORS.textSecondary,
  },
  cancelButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.success,
  },
  confirmButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
});

export default MyRoutes; 