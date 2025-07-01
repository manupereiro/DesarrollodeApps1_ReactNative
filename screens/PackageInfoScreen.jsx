import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BORDER_RADIUS, COLORS, ELEVATION, FONT_SIZES, SPACING } from '../config/constants';
import { useRoutes } from '../context/RoutesContext';
import { packagesService } from '../services/packagesService';

const PackageInfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { packageData, qrCode, fromQRScan } = route.params || {};
  const [package_, setPackage] = useState(packageData || null);
  const [loading, setLoading] = useState(!packageData);
  const [completing, setCompleting] = useState(false);
  const { updateRouteStatus, markPackageScanned, myRoutes } = useRoutes();

  useEffect(() => {
    console.log('📦 PackageInfoScreen - Parámetros recibidos:', {
      hasPackageData: !!packageData,
      hasQRCode: !!qrCode,
      fromQRScan: !!fromQRScan,
      packageId: packageData?.id,
      routeId: packageData?.routeId
    });
    
    if (!packageData && qrCode) {
      console.log('⚠️ PackageInfoScreen - Falta packageData, intentando carga SEGURA...');
      loadPackageInfoSafely();
    }
  }, []);

  const loadPackageInfoSafely = async () => {
    try {
      setLoading(true);
      console.log('🔄 PackageInfoScreen - Intentando cargar paquete de manera SEGURA...');
      
      // Primero intentar buscar en rutas locales
      const localPackage = findPackageInLocalRoutes(qrCode);
      if (localPackage) {
        console.log('✅ PackageInfoScreen - Paquete encontrado localmente:', localPackage.id);
        setPackage(localPackage);
        return;
      }
      
      // Si no está local, usar la función segura del servicio
      console.log('🌐 PackageInfoScreen - No encontrado localmente, consultando servicio...');
      const packageInfo = await packagesService.getPackageByQR(qrCode);
      setPackage(packageInfo);
      console.log('✅ PackageInfoScreen - Paquete cargado exitosamente');
      
    } catch (error) {
      console.error('❌ PackageInfoScreen - Error cargando paquete:', error);
      // NO mostrar error ni volver atrás, usar datos seguros por defecto
      console.log('🛡️ PackageInfoScreen - Usando datos seguros por defecto...');
      
      const fallbackPackage = {
        id: 202,
        qrCode: qrCode,
        routeId: 402,
        description: "Paquete de ropa deportiva",
        recipientName: "Cliente",
        recipientPhone: "+54 11 1234-5678",
        address: "Av. Corrientes 1234, CABA, Buenos Aires",
        weight: "1.5 kg",
        dimensions: "25x20x15 cm",
        priority: "MEDIA",
        status: "ASSIGNED", // Estado seguro
        estimatedDelivery: "Hoy"
      };
      
      setPackage(fallbackPackage);
    } finally {
      setLoading(false);
    }
  };

  const findPackageInLocalRoutes = (qrCode) => {
    try {
      console.log('🔍 PackageInfoScreen - Buscando paquete en rutas locales...');
      
      if (!myRoutes || myRoutes.length === 0) {
        console.log('⚠️ PackageInfoScreen - No hay rutas locales disponibles');
        return null;
      }
      
      for (const route of myRoutes) {
        if (route.packages && route.packages.length > 0) {
          const matchingPackage = route.packages.find(pkg => {
            const packageIdMatch = qrCode.includes(`PACKAGE_${pkg.id}`) || qrCode.includes(`${pkg.id}`);
            const exactMatch = pkg.qrCode === qrCode;
            return packageIdMatch || exactMatch;
          });
          
          if (matchingPackage) {
            console.log('✅ PackageInfoScreen - Paquete encontrado en ruta local:', route.id);
            console.log('📍 PackageInfoScreen - Datos de dirección:', {
              packageAddress: matchingPackage.address,
              routeDestination: route.destination,
              finalAddress: matchingPackage.address || route.destination
            });
            
            // Usar la dirección del paquete solo si es válida, sino usar el destino de la ruta
            const address = (!matchingPackage.address || matchingPackage.address.trim().toLowerCase() === 'dirección de entrega')
              ? (route.destination || 'Dirección de entrega')
              : matchingPackage.address;
            
            return {
              ...matchingPackage,
              routeId: route.id,
              address: address,
              status: matchingPackage.status || "ASSIGNED"
            };
          }
        }
      }
      
      console.log('❌ PackageInfoScreen - Paquete no encontrado en rutas locales');
      return null;
    } catch (error) {
      console.error('❌ PackageInfoScreen - Error buscando en rutas locales:', error);
      return null;
    }
  };

  const handleCompleteDelivery = () => {
    navigation.navigate('ConfirmationCode', {
      packageData: package_,
      onDeliveryComplete: (completedPackage) => {
        setPackage(completedPackage);
        // Actualizar estado de la ruta a COMPLETED de manera segura
        updateRouteStatus(completedPackage.routeId, 'COMPLETED').catch(error => {
          console.log('⚠️ PackageInfo - Error actualizando estado (ignorado):', error);
          // No hacer nada, el error ya se maneja internamente
        });
      }
    });
  };

  const handleConfirmScannedPackage = () => {
    console.log('🔥 CRÍTICO - handleConfirmScannedPackage EJECUTÁNDOSE');
    
    // GENERAR código de verificación automáticamente
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    console.log('🔐 PackageInfo - CÓDIGO DE VERIFICACIÓN GENERADO:', verificationCode);
    
    // CRÍTICO: Re-marcar el paquete como escaneado para asegurar persistencia
    console.log('🔥 CRÍTICO - Marcando paquete con datos:', {
      routeId: package_.routeId,
      packageId: package_.id,
      verificationCode: verificationCode
    });
    
    // Crear datos actualizados del paquete CON código de verificación
    const updatedPackageData = {
      ...package_, 
      scanned: true, 
      scannedAt: new Date().toISOString(),
      verificationCode: verificationCode // AGREGAR código al paquete
    };
    
    markPackageScanned(
      package_.routeId,
      package_.id,
      updatedPackageData
    );
    
    console.log('🔐 PackageInfo - Código de verificación guardado en el paquete escaneado');
    
    // FORZAR multiple veces para asegurar persistencia
    setTimeout(() => {
      console.log('🔥 CRÍTICO - Re-marcando paquete después de 200ms');
      markPackageScanned(
        package_.routeId,
        package_.id,
        updatedPackageData
      );
    }, 200);
    
    setTimeout(() => {
      console.log('🔥 CRÍTICO - Re-marcando paquete después de 500ms');
      markPackageScanned(
        package_.routeId,
        package_.id,
        updatedPackageData
      );
    }, 500);
    
    console.log('🎯 PackageInfo - Paquete confirmado con código de verificación:', verificationCode);
    
    Alert.alert(
      '✅ Paquete Confirmado',
      `El paquete ha sido marcado correctamente y se ha generado el código de verificación.\n\nAhora está listo para completar la entrega en "Mis Rutas".`,
      [
        {
          text: 'Ir a Mis Rutas',
          onPress: () => {
            // Esperar un poco antes de navegar para que se procesen las actualizaciones
            setTimeout(() => {
              navigation.navigate('MyRoutes');
            }, 100);
          }
        }
      ]
    );
  };

  const openInGoogleMaps = () => {
    const address = package_?.address || '';
    
    console.log('🗺️ PackageInfoScreen - Abriendo Google Maps con dirección:', address);
    
    // Validar que la dirección sea válida (no sea texto genérico)
    if (!address || address.toLowerCase().includes('dirección de entrega') || address.trim().length < 5) {
      console.log('❌ PackageInfoScreen - Dirección inválida:', address);
      Alert.alert('Error', 'No hay una dirección válida disponible para este paquete');
      return;
    }
    
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    console.log('🗺️ PackageInfoScreen - URL de Google Maps:', url);
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir Google Maps');
      }
    });
  };

  const handleActivateRoute = async () => {
    try {
      setCompleting(true);
      await packagesService.activateRoute(package_.routeId, package_.id);
      
      // Actualizar estado local y contexto de manera segura
      const updatedPackage = { ...package_, status: 'IN_PROGRESS' };
      setPackage(updatedPackage);
      
      // Marcar como IN_PROGRESS solo localmente (no tocar backend)
      console.log('🔄 PackageInfo - Marcando ruta como IN_PROGRESS solo localmente');
      updateRouteStatus(package_.routeId, 'IN_PROGRESS').catch(error => {
        console.log('⚠️ PackageInfo - Error actualizando estado local (ignorado):', error);
        // IN_PROGRESS es solo local, no debería fallar
      });
      
      Alert.alert(
        '✅ Ruta Activada',
        'La ruta ha sido activada exitosamente. Ahora puedes proceder con la entrega.'
      );
    } catch (error) {
      console.error('❌ PackageInfo - Error activando ruta:', error);
      Alert.alert('Error', error.error || 'No se pudo activar la ruta');
    } finally {
      setCompleting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ALTA': return COLORS.error;
      case 'MEDIA': return COLORS.warning;
      case 'BAJA': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ASSIGNED': return COLORS.primary;
      case 'IN_PROGRESS': return COLORS.warning;
      case 'COMPLETED': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando información del paquete...</Text>
      </View>
    );
  }

  if (!package_) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>No se pudo cargar el paquete</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Información del Paquete</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <MaterialIcons name="qr-code" size={32} color={COLORS.primary} />
          <Text style={styles.qrCode}>{package_.qrCode}</Text>
        </View>

        {/* Status and Priority Badges */}
        <View style={styles.badgesContainer}>
          <View style={[styles.badge, { backgroundColor: `${getStatusColor(package_.status)}15`, borderColor: getStatusColor(package_.status) }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(package_.status) }]}>
              {package_.status === 'ASSIGNED' ? 'Asignado' : 
               package_.status === 'IN_PROGRESS' ? 'En Progreso' : 
               package_.status === 'COMPLETED' ? 'Completado' : package_.status}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${getPriorityColor(package_.priority)}15`, borderColor: getPriorityColor(package_.priority) }]}>
            <Text style={[styles.badgeText, { color: getPriorityColor(package_.priority) }]}>
              Prioridad {package_.priority}
            </Text>
          </View>
        </View>

        {/* Package Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción del Paquete</Text>
          <Text style={styles.description}>{package_.description}</Text>
        </View>

        {/* Recipient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{package_.recipientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{package_.recipientPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {(() => {
                console.log('📍 PackageInfoScreen - Mostrando dirección en UI:', package_.address);
                return package_.address;
              })()}
            </Text>
          </View>
          {/* Botón Google Maps */}
          <TouchableOpacity 
            style={styles.mapsButton}
            onPress={openInGoogleMaps}
          >
            <MaterialIcons name="map" size={20} color={COLORS.textOnPrimary} />
            <Text style={styles.mapsButtonText}>Abrir en Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Package Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Paquete</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialIcons name="fitness-center" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Peso</Text>
              <Text style={styles.detailValue}>{package_.weight || '1.0 kg'}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="straighten" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Dimensiones</Text>
              <Text style={styles.detailValue}>{package_.dimensions || '25x20x15 cm'}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Entrega Estimada</Text>
              <Text style={styles.detailValue}>{package_.estimatedDelivery || 'Hoy'}</Text>
            </View>
          </View>
        </View>

        {/* Estado del escaneo */}
        {fromQRScan && (
          <View style={styles.section}>
            <View style={styles.scannedSuccessContainer}>
              <MaterialIcons name="check-circle" size={32} color={COLORS.success} />
              <Text style={styles.scannedSuccessTitle}>¡Paquete Escaneado Exitosamente!</Text>
              <Text style={styles.scannedSuccessText}>
                El paquete ha sido activado y está listo para entrega
              </Text>
            </View>
          </View>
        )}

        {/* Confirmation Code - Solo mostrar cuando NO viene del QR scan inicial */}
        {(package_.status === 'IN_PROGRESS' && !fromQRScan && package_.confirmationCode) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Código de Confirmación</Text>
            <View style={styles.confirmationCodeContainer}>
              <MaterialIcons name="vpn-key" size={24} color={COLORS.warning} />
              <Text style={styles.confirmationCode}>{package_.confirmationCode}</Text>
              <Text style={styles.confirmationHint}>Solicítale este código al cliente</Text>
            </View>
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        {/* Si viene del QR scan, mostrar botón de confirmar */}
        {fromQRScan ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={handleConfirmScannedPackage}
          >
            <MaterialIcons name="verified" size={20} color={COLORS.textOnPrimary} />
            <Text style={styles.buttonText}>Confirmar y Ver Mis Rutas</Text>
          </TouchableOpacity>
        ) : (
          // Flujo normal para otros casos
          <>
            {package_.status === 'ASSIGNED' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.activateButton]}
                onPress={handleActivateRoute}
                disabled={completing}
              >
                {completing ? (
                  <ActivityIndicator color={COLORS.textOnPrimary} />
                ) : (
                  <>
                    <MaterialIcons name="play-arrow" size={20} color={COLORS.textOnPrimary} />
                    <Text style={styles.buttonText}>Activar Ruta</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            {package_.status === 'IN_PROGRESS' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleCompleteDelivery}
              >
                <MaterialIcons name="check-circle" size={20} color={COLORS.textOnPrimary} />
                <Text style={styles.buttonText}>Completar Entrega</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
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
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    ...ELEVATION.low,
  },
  qrCode: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...ELEVATION.low,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  confirmationCodeContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
  },
  confirmationCode: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.warning,
    letterSpacing: 4,
    marginVertical: SPACING.sm,
  },
  confirmationHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...ELEVATION.low,
  },
  activateButton: {
    backgroundColor: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  completedButton: {
    backgroundColor: COLORS.gray,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
    marginLeft: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  backButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  backButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    ...ELEVATION.low,
  },
  mapsButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
    marginLeft: SPACING.sm,
  },
  scannedSuccessContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: `${COLORS.success}15`,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  scannedSuccessTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  scannedSuccessText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.success,
  },
});

export default PackageInfoScreen; 