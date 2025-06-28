import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
  const { packageData, qrCode } = route.params || {};
  const [package_, setPackage] = useState(packageData || null);
  const [loading, setLoading] = useState(!packageData);
  const [completing, setCompleting] = useState(false);
  const { updateRouteStatus } = useRoutes();

  useEffect(() => {
    if (!packageData && qrCode) {
      loadPackageInfo();
    }
  }, []);

  const loadPackageInfo = async () => {
    try {
      setLoading(true);
      const packageInfo = await packagesService.getPackageByQR(qrCode);
      setPackage(packageInfo);
    } catch (error) {
      Alert.alert('Error', error.error || 'No se pudo cargar la información del paquete');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = () => {
    navigation.navigate('ConfirmationCode', {
      packageData: package_,
      onDeliveryComplete: (completedPackage) => {
        setPackage(completedPackage);
        // Actualizar estado de la ruta a COMPLETED
        updateRouteStatus(completedPackage.routeId, 'COMPLETED');
      }
    });
  };

  const handleActivateRoute = async () => {
    try {
      setCompleting(true);
      await packagesService.activateRoute(package_.routeId, package_.id);
      
      // Actualizar estado local y contexto
      const updatedPackage = { ...package_, status: 'IN_PROGRESS' };
      setPackage(updatedPackage);
      await updateRouteStatus(package_.routeId, 'IN_PROGRESS');
      
      Alert.alert(
        '✅ Ruta Activada',
        'La ruta ha sido activada exitosamente. Ahora puedes proceder con la entrega.'
      );
    } catch (error) {
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
            <Text style={styles.infoText}>{package_.address}</Text>
          </View>
        </View>

        {/* Package Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Paquete</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialIcons name="fitness-center" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Peso</Text>
              <Text style={styles.detailValue}>{package_.weight}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="straighten" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Dimensiones</Text>
              <Text style={styles.detailValue}>{package_.dimensions}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Entrega Estimada</Text>
              <Text style={styles.detailValue}>{package_.estimatedDelivery}</Text>
            </View>
          </View>
        </View>

        {/* Confirmation Code (only if IN_PROGRESS) */}
        {package_.status === 'IN_PROGRESS' && (
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

        {package_.status === 'COMPLETED' && (
          <View style={[styles.actionButton, styles.completedButton]}>
            <MaterialIcons name="check-circle" size={20} color={COLORS.textOnPrimary} />
            <Text style={styles.buttonText}>Entrega Completada</Text>
          </View>
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
});

export default PackageInfoScreen; 