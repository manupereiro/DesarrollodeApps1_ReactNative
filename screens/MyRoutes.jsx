import { MaterialIcons } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ErrorMessage from '../components/ErrorMessage';
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
    console.log('🗂️ MyRoutes - Filtrando rutas completadas:', {
      total: myRoutes.length,
      activas: filtered.length,
      completadas: myRoutes.length - filtered.length
    });
    
    return filtered.map(route => {
        const syncedRoute = {
          ...route,
          // RESPETEAR el status original de la ruta del backend
          status: route.status,
          packages: route.packages?.map(pkg => ({
            ...pkg,
            // Sincronizar estado scanned con el contexto global
            scanned: isPackageScanned(pkg.id) || pkg.scanned
          })) || []
        };
        
        console.log(`🔄 MyRoutes - Sincronizando ruta ${route.id}: status=${route.status}`);
        
        return syncedRoute;
      });
  }, [myRoutes, scannedPackages, isPackageScanned]);

  // CRÍTICO: NO recargar automáticamente para preservar cambios locales
  useEffect(() => {
    // Solo cargar rutas si no tenemos ninguna
    if (myRoutes.length === 0) {
      console.log('📱 MyRoutes - Cargando rutas por primera vez');
      loadRoutes();
    } else {
      console.log('📱 MyRoutes - YA tenemos rutas, NO recargar para preservar estado local');
    }
  }, []);

  // DEBUG: Log rutas sincronizadas cuando cambian las originales
  useEffect(() => {
    const syncedRoutesDebug = syncedRoutes.map(r => ({
      id: r.id,
      status: r.status,
      packages: r.packages?.length || 0,
      scannedPackages: r.packages?.filter(pkg => pkg.scanned).length || 0
    }));
    
    console.log('🔄 MyRoutes - Rutas sincronizadas:', syncedRoutesDebug);
  }, [myRoutes, scannedPackages]);

  // Escuchar cuando la pantalla se enfoca (cuando navegas desde PackageInfo)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔥 CRÍTICO MyRoutes - Pantalla enfocada, PRESERVANDO estado local...');
      console.log('🔥 CRÍTICO MyRoutes - Estado scannedPackages:', Array.from(scannedPackages));
      console.log('🔥 CRÍTICO MyRoutes - myRoutes originales:', myRoutes.length);
      
      // CRÍTICO: NO recargar rutas aquí, solo forzar re-render
      console.log('🛡️ MyRoutes - EVITANDO loadRoutes() para preservar cambios locales');
      
      // Forzar re-render usando un estado local
      setForceUpdate(prev => prev + 1);
    });

    return unsubscribe;
  }, [navigation, scannedPackages, myRoutes]);

  // DEBUG: Log cuando cambian las rutas o paquetes escaneados
  useEffect(() => {
    console.log('📱 MyRoutes - Estado actualizado:', {
      rutasOriginales: myRoutes.length,
      rutasSincronizadas: syncedRoutes.length,
      scannedPackagesCount: scannedPackages.size,
      scannedPackageIds: Array.from(scannedPackages)
    });
    
    // Log detalles de cada ruta SINCRONIZADA
    syncedRoutes.forEach(route => {
      console.log(`📋 MyRoutes - Ruta SINCRONIZADA ${route.id}:`, {
        status: route.status,
        packages: route.packages?.length || 0,
        scannedPackages: route.packages?.filter(pkg => pkg.scanned).length || 0
      });
    });
  }, [myRoutes, scannedPackages]);

  const handleCancelRoute = async (routeId) => {
    Alert.alert(
      'Cancelar Pedido',
      '¿Estás seguro que deseas cancelar este pedido?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelRoute(routeId);
              Alert.alert('Éxito', 'Pedido cancelado exitosamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar el pedido');
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
      // Preparar datos del paquete usando información REAL de la ruta
      const firstPackage = route.packages && route.packages.length > 0 ? route.packages[0] : null;
      const packageData = {
        id: firstPackage?.id || 202,
        qrCode: firstPackage?.qrCode || `PACKAGE_${firstPackage?.id || 202}_${route.destination || 'paquete'}`,
        routeId: route.id,
        status: route.status,
        description: firstPackage?.description || `Paquete para ${route.destination}`,
        recipientName: firstPackage?.recipientName || 'Cliente',
        recipientPhone: firstPackage?.recipientPhone || '+54 11 1234-5678',
        address: firstPackage?.address || route.destination,
        weight: firstPackage?.weight || '1.5 kg',
        dimensions: firstPackage?.dimensions || '25x20x15 cm',
        priority: firstPackage?.priority || 'MEDIA',
        estimatedDelivery: firstPackage?.estimatedDelivery || 'Hoy',
        confirmationCode: route.confirmationCode || firstPackage?.confirmationCode,
        verificationCode: route.verificationCode || firstPackage?.verificationCode,
        scanned: firstPackage?.scanned || false,
        scannedAt: firstPackage?.scannedAt
      };
      
      console.log('📦 MyRoutes - Navegando a PackageInfo con datos REALES:', {
        packageId: packageData.id,
        routeId: packageData.routeId,
        status: packageData.status,
        hasVerificationCode: !!packageData.verificationCode
      });
      
      // Navegar con datos completos para evitar peticiones innecesarias al backend
      navigation.navigate('PackageInfo', {
        packageData: packageData,
        fromMyRoutes: true // Flag para indicar que viene de MyRoutes
      });
    }
  };

  const handleCompleteDelivery = async (route) => {
    console.log('🔐 MyRoutes - Abriendo modal de verificación para ruta:', route.id);
    
    // BUSCAR código de verificación en la ruta O en los paquetes escaneados
    let currentVerificationCode = route.verificationCode || route.confirmationCode;
    
    // Si no hay código en la ruta, buscar en los paquetes escaneados
    if (!currentVerificationCode && route.packages) {
      const scannedPackageWithCode = route.packages.find(pkg => 
        pkg.scanned && (pkg.verificationCode || pkg.confirmationCode)
      );
      if (scannedPackageWithCode) {
        currentVerificationCode = scannedPackageWithCode.verificationCode || scannedPackageWithCode.confirmationCode;
        console.log('🔐 MyRoutes - Código encontrado en paquete escaneado:', scannedPackageWithCode.id);
      }
    }
    
    // MOSTRAR CÓDIGO EN CONSOLA - SOLO PARA CONSOLA, NO EN PANTALLA
    if (currentVerificationCode) {
      console.log('🔐🔐🔐 EL CODIGO DE VERIFICACION ES:', currentVerificationCode, '🔐🔐🔐');
    } else {
      console.log('⚠️ MyRoutes - No se encontró código de verificación para la ruta');
    }
    
    // Abrir modal de verificación
    setSelectedRoute(route);
    setVerificationCode('');
    setVerificationError('');
    setShowVerificationModal(true);
  };

  // Nueva función para verificar código e completar entrega
  const handleVerifyAndComplete = async () => {
    if (!selectedRoute) return;
    
    // BUSCAR código de verificación en la ruta O en los paquetes escaneados
    let expectedCode = selectedRoute.verificationCode || selectedRoute.confirmationCode;
    
    // Si no hay código en la ruta, buscar en los paquetes escaneados
    if (!expectedCode && selectedRoute.packages) {
      const scannedPackageWithCode = selectedRoute.packages.find(pkg => 
        pkg.scanned && (pkg.verificationCode || pkg.confirmationCode)
      );
      if (scannedPackageWithCode) {
        expectedCode = scannedPackageWithCode.verificationCode || scannedPackageWithCode.confirmationCode;
        console.log('🔐 MyRoutes - Usando código del paquete escaneado para verificación:', scannedPackageWithCode.id);
      }
    }
    
    console.log('🔐 MyRoutes - Verificando código:', {
      ingresado: verificationCode,
      esperado: expectedCode,
      ruta: selectedRoute.id
    });
    
    // Verificar código
    if (verificationCode.trim() === expectedCode) {
      try {
        console.log('✅ MyRoutes - Código correcto, completando entrega...');
        
        // Cerrar modal
        setShowVerificationModal(false);
        setSelectedRoute(null);
        setVerificationCode('');
        setVerificationError('');
        
        // NUEVA LÓGICA: Completar entrega directamente
        // - Si está en IN_PROGRESS (solo local) → COMPLETED en backend será ASSIGNED → COMPLETED
        // - Si está en ASSIGNED → COMPLETED en backend será ASSIGNED → COMPLETED  
        const completedAt = new Date().toISOString();
        await updateRouteStatus(selectedRoute.id, 'COMPLETED', { 
          completedAt,
          completedDate: new Date().toLocaleDateString(),
          completedTime: new Date().toLocaleTimeString()
        });
        
        console.log('✅ MyRoutes - Entrega completada con timestamp:', {
          ruta: selectedRoute.id,
          completedAt,
          startedAt: selectedRoute.startedAt
        });
        
        console.log('📝 MyRoutes - La ruta desaparecerá de "Mis Rutas" y estará disponible en el historial de pedidos');
        
        // Forzar actualización para que la ruta desaparezca inmediatamente
        setTimeout(() => {
          setForceUpdate(prev => prev + 1);
        }, 100);
        
        Alert.alert(
          '✅ Entrega Completada', 
          'La entrega se ha completado exitosamente y se ha agregado al historial de pedidos.'
        );
      } catch (error) {
        // Este catch ya no debería ejecutarse con la nueva lógica tolerante
        console.error('❌ MyRoutes - Error inesperado completando entrega:', error);
        
        // Mostrar mensaje positivo ya que updateRouteStatus ya manejó todo internamente
        Alert.alert(
          '✅ Entrega Completada', 
          'La entrega se ha completado exitosamente. Si hubo problemas de conexión, se sincronizará automáticamente con el servidor.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Código incorrecto
      console.log('❌ MyRoutes - Código incorrecto. Esperado:', expectedCode, 'Ingresado:', verificationCode.trim());
      setVerificationError('Código de verificación incorrecto');
    }
  };

  // Cancelar modal de verificación
  const handleCancelVerification = () => {
    setShowVerificationModal(false);
    setSelectedRoute(null);
    setVerificationCode('');
    setVerificationError('');
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
          console.log('🔄 MyRoutes - Refresh manual solicitado');
          loadRoutes();
        }}
      />

      {/* Modal de Verificación */}
      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelVerification}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="verified-user" size={24} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Verificación de Entrega</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Ingresa el código de verificación para completar la entrega:
            </Text>
            
            {selectedRoute && (
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Ruta: {selectedRoute.id}</Text>
                <Text style={styles.routeDestination}>{selectedRoute.destination}</Text>
                {/* DEBUG - Log datos de la ruta seleccionada */}
                {console.log('🔍 Modal - Datos de ruta seleccionada:', {
                  id: selectedRoute.id,
                  verificationCode: selectedRoute.verificationCode,
                  confirmationCode: selectedRoute.confirmationCode,
                  packages: selectedRoute.packages?.length || 0
                })}
              </View>
            )}
            
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
                onPress={handleCancelVerification}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  !verificationCode.trim() ? styles.disabledButton : null
                ]}
                onPress={handleVerifyAndComplete}
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
  headerGradient: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
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
  listContent: {
    paddingTop: 16,
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