import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, ELEVATION, FONT_SIZES, SPACING } from '../config/constants';
import { useRoutes } from '../context/RoutesContext';

const RouteCard = ({ route, onSelect, onCancel, onComplete, onNavigateToCode, showActions = true }) => {
  const { scannedPackages, isPackageScanned } = useRoutes();
  
  // Debug: Log la ruta que recibe este componente
  console.log('🔍 RouteCard - Ruta recibida:', JSON.stringify(route, null, 2));
  
  // Debug: Log específicamente los paquetes y QR codes
  if (route.packages && route.packages.length > 0) {
    console.log('📦 RouteCard - Paquetes encontrados:', route.packages.length);
    route.packages.forEach((pkg, index) => {
      console.log(`📦 RouteCard - Paquete ${index + 1}:`, {
        id: pkg.id,
        description: pkg.description,
        qrCode: pkg.qrCode ? `${pkg.qrCode.substring(0, 50)}...` : 'NO QR',
        qrCodeLength: pkg.qrCode ? pkg.qrCode.length : 0
      });
    });
  } else {
    console.log('❌ RouteCard - Esta ruta NO tiene paquetes definidos');
  }

  // VERIFICACIÓN CRÍTICA: Double-check scanned packages
  const hasAnyScannedPackage = route.packages?.some(pkg => {
    const isScannedInPkg = pkg.scanned === true;
    const isScannedInContext = isPackageScanned(pkg.id);
    
    console.log(`🔥 CRÍTICO - Paquete ${pkg.id}:`, {
      scannedInPkg: isScannedInPkg,
      scannedInContext: isScannedInContext,
      finalResult: isScannedInPkg || isScannedInContext
    });
    
    return isScannedInPkg || isScannedInContext;
  }) || false;

  // NUEVA LÓGICA DE ESTADOS:
  // - ASSIGNED: Estado inicial en backend y local
  // - IN_PROGRESS: Solo existe localmente, nunca se envía al backend
  // - COMPLETED: Se envía al backend como ASSIGNED → COMPLETED (saltando IN_PROGRESS)
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return COLORS.success;
      case 'ASSIGNED':
        return COLORS.primary;
      case 'IN_PROGRESS': // Solo local
        return COLORS.warning;
      case 'COMPLETED':
        return COLORS.gray;
      case 'CANCELLED':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'ASSIGNED':
        return 'Asignada';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: `${color}15`, // 15% opacity
      borderColor: color,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, getStatusBadgeStyle(route.status)]}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(route.status) },
            ]}
          />
          <Text style={[styles.statusText, { color: getStatusColor(route.status) }]}>
            {getStatusText(route.status)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.routeInfo}>
          <View style={styles.locationContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="location-on" size={18} color={COLORS.success} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Origen</Text>
              <Text style={styles.locationText} numberOfLines={1}>{route?.origin || 'Sin origen'}</Text>
            </View>
          </View>
          
          <View style={styles.routeArrow}>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.textSecondary} />
          </View>
          
          <View style={styles.locationContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="flag" size={18} color={COLORS.error} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Destino</Text>
              <Text style={styles.locationText} numberOfLines={1}>{route?.destination || 'Sin destino'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MaterialIcons name="straighten" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{route?.distance || 'N/A'} km</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="access-time" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {route.estimatedDuration ? `${route.estimatedDuration} min` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Sección de Paquetes */}
        {route.packages && route.packages.length > 0 && (
          <View>
            <View style={styles.divider} />
            <View style={styles.packagesSection}>
              <View style={styles.packagesSectionHeader}>
                <MaterialIcons name="inventory" size={16} color={COLORS.primary} />
                <Text style={styles.packagesSectionTitle}>
                  Paquetes ({route.packages.length})
                </Text>
              </View>
              
              {route.packages.map((pkg, index) => (
                <View key={pkg.id} style={styles.packageItem}>
                  <View style={styles.packageInfo}>
                    <MaterialIcons 
                      name={pkg.scanned ? "check-circle" : "radio-button-unchecked"} 
                      size={16} 
                      color={pkg.scanned ? COLORS.success : COLORS.textSecondary} 
                    />
                    <Text style={[
                      styles.packageDescription,
                      pkg.scanned && styles.packageScanned
                    ]}>
                      {pkg.description || `Paquete ${pkg.id}`}
                    </Text>
                  </View>
                  
                  {pkg.scanned && (
                    <View style={styles.scannedBadge}>
                      <Text style={styles.scannedText}>Escaneado</Text>
                    </View>
                  )}
                  
                  {!pkg.scanned && route.status === 'ASSIGNED' && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>Pendiente</Text>
                    </View>
                  )}
                </View>
              ))}
              
              {/* NO mostrar código de confirmación aquí - se pedirá en modal */}
            </View>
          </View>
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          {route.status === 'AVAILABLE' ? (
            <TouchableOpacity
              style={[styles.button, styles.selectButton]}
              onPress={() => onSelect(route.id)}
            >
              <MaterialIcons name="add-road" size={16} color={COLORS.textOnPrimary} />
              <Text style={styles.buttonText}>Elegir Ruta</Text>
            </TouchableOpacity>
          ) : (route.status === 'ASSIGNED') ? (
            <View style={styles.actionButtons}>
              {/* Verificar si ya tiene código de verificación o paquetes escaneados */}
              {(route.verificationCode || route.confirmationCode || hasAnyScannedPackage) ? (
                <TouchableOpacity
                  style={[styles.button, styles.completeButton]}
                  onPress={() => onComplete(route)}
                >
                  <MaterialIcons name="check-circle" size={16} color={COLORS.textOnPrimary} />
                  <Text style={styles.buttonText}>Completar Entrega</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.qrButton]}
                  onPress={() => onNavigateToCode ? onNavigateToCode(route) : null}
                >
                  <MaterialIcons name="qr-code-scanner" size={16} color={COLORS.textOnPrimary} />
                  <Text style={styles.buttonText}>Escanear QR</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => onCancel(route.id)}
              >
                <MaterialIcons name="cancel" size={16} color={COLORS.textOnPrimary} />
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (route.status === 'IN_PROGRESS') ? (
            <View style={styles.actionButtons}>
              {/* DEBUG CRÍTICO: Decisión del botón */}
              {(() => {
                console.log(`🔥 CRÍTICO DECISIÓN - Ruta ${route.id}:`, {
                  hasAnyScannedPackage,
                  status: route.status,
                  paquetes: route.packages?.map(p => ({ id: p.id, scanned: !!p.scanned }))
                });
                return null;
              })()}
              
              {/* VERIFICACIÓN CON FALLBACK: usar hasAnyScannedPackage */}
              {hasAnyScannedPackage ? (
                <TouchableOpacity
                  style={[styles.button, styles.completeButton]}
                  onPress={() => onComplete(route)}
                >
                  <MaterialIcons name="check-circle" size={16} color={COLORS.textOnPrimary} />
                  <Text style={styles.buttonText}>Completar Entrega</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.qrButton]}
                  onPress={() => onNavigateToCode ? onNavigateToCode(route) : null}
                >
                  <MaterialIcons name="qr-code-scanner" size={16} color={COLORS.textOnPrimary} />
                  <Text style={styles.buttonText}>Escanear QR</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => onCancel(route.id)}
              >
                <MaterialIcons name="cancel" size={16} color={COLORS.textOnPrimary} />
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    ...ELEVATION.low,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  content: {
    marginBottom: SPACING.md,
  },
  routeInfo: {
    marginBottom: SPACING.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
    fontWeight: '500',
  },
  locationText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  routeArrow: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  actions: {
    marginTop: SPACING.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 44, // Para mejor accesibilidad
    ...ELEVATION.low,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.success,
    flex: 1,
    marginRight: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    flex: 1,
    marginLeft: SPACING.xs,
  },
  buttonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  qrButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
    marginRight: SPACING.xs,
  },
  // Estilos para sección de paquetes
  packagesSection: {
    marginTop: SPACING.sm,
  },
  packagesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  packagesSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  packageDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  packageScanned: {
    color: COLORS.success,
    fontWeight: '500',
  },
  scannedBadge: {
    backgroundColor: `${COLORS.success}15`,
    borderColor: COLORS.success,
    borderWidth: 1,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  scannedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: `${COLORS.textSecondary}15`,
    borderColor: COLORS.textSecondary,
    borderWidth: 1,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  pendingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  confirmationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}15`,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  confirmationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});

export default RouteCard; 