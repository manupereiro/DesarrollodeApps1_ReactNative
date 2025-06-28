import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BORDER_RADIUS, BUTTON_STYLES, CARD_STYLES, COLORS, ELEVATION, FONT_SIZES, SPACING } from '../config/constants';

const { height } = Dimensions.get('window');

const PackageInfoScreen = ({ route, navigation }) => {
  const { qrCode, packageInfo: initialPackageInfo } = route.params;
  const [packageInfo, setPackageInfo] = useState(initialPackageInfo || null);
  const [loading, setLoading] = useState(!initialPackageInfo);

  useEffect(() => {
    if (!initialPackageInfo) {
      loadPackageInfo();
    } else {
      // Si ya tenemos la información del paquete, mostrarla en logs
      logPackageInfo(initialPackageInfo);
    }
  }, [initialPackageInfo]);

  const logPackageInfo = (info) => {
    console.log('=== INFORMACIÓN DEL PAQUETE ===');
    console.log('Código QR:', info.qrCode);
    console.log('Ubicación en depósito:', info.location);
    console.log('Sección:', info.warehouseSection);
    console.log('Estante:', info.shelfNumber);
    console.log('Descripción:', info.description);
    console.log('Peso:', info.weight + ' kg');
    console.log('Dimensiones:', info.dimensions);
    console.log('Frágil:', info.fragile ? 'Sí' : 'No');
    console.log('=== RUTA ASOCIADA ===');
    console.log('Origen:', info.routeOrigin);
    console.log('Destino:', info.routeDestination);
    console.log('Distancia:', info.routeDistance + ' km');
    console.log('Estado:', info.routeStatus);
    console.log('================================');
  };

  const loadPackageInfo = async () => {
    try {
      // Si no tenemos información inicial, intentar cargarla
      if (!initialPackageInfo) {
        // Aquí podrías hacer una llamada adicional al backend si es necesario
        console.log('🔄 Cargando información del paquete para QR:', qrCode);
        
        // Por ahora, mostrar error si no tenemos datos
        Alert.alert(
          'Información no disponible',
          'La información del paquete debe obtenerse escaneando el QR desde la pantalla principal.',
          [
            {
              text: 'Volver',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.log('❌ Error cargando información del paquete:', error);
      Alert.alert('Error', 'No se pudo cargar la información del paquete');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoute = () => {
    Alert.alert(
      '🚚 Ruta Iniciada',
      'La ruta ha sido asignada y puedes comenzar la entrega.',
      [
        {
          text: 'Ver mis rutas',
          onPress: () => navigation.navigate('MyRoutes')
        },
        {
          text: 'Continuar',
          style: 'cancel'
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Información del Paquete</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando información del paquete...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!packageInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Información del Paquete</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.errorText}>No se encontró información para este código QR</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Info del Paquete</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Código QR */}
        <View style={styles.qrSection}>
          <MaterialIcons name="qr-code" size={48} color={COLORS.primary} />
          <Text style={styles.qrCode}>{packageInfo.qrCode}</Text>
        </View>

        {/* Información del Paquete */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📦 Información del Paquete</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="inventory" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{packageInfo.description}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="scale" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{packageInfo.weight} kg</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="straighten" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{packageInfo.dimensions}</Text>
          </View>
          {packageInfo.fragile && (
            <View style={styles.warningRow}>
              <MaterialIcons name="warning" size={20} color={COLORS.warning} />
              <Text style={styles.warningText}>⚠️ FRÁGIL - Manejar con cuidado</Text>
            </View>
          )}
        </View>

        {/* Ubicación en Depósito */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Ubicación en Depósito</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{packageInfo.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="business" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>Sección: {packageInfo.warehouseSection}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="shelves" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>Estante: {packageInfo.shelfNumber}</Text>
          </View>
        </View>

        {/* Información de la Ruta */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🚚 Ruta de Entrega</Text>
          <View style={styles.routeInfo}>
            <MaterialIcons name="location-on" size={20} color={COLORS.success} />
            <Text style={styles.routeText}>Origen: {packageInfo.routeOrigin}</Text>
          </View>
          <View style={styles.routeInfo}>
            <MaterialIcons name="flag" size={20} color={COLORS.error} />
            <Text style={styles.routeText}>Destino: {packageInfo.routeDestination}</Text>
          </View>
          <View style={styles.routeInfo}>
            <MaterialIcons name="straighten" size={20} color={COLORS.textSecondary} />
            <Text style={styles.routeText}>Distancia: {packageInfo.routeDistance} km</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón para iniciar ruta */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartRoute}
        >
          <MaterialIcons name="local-shipping" size={24} color={COLORS.textOnPrimary} />
          <Text style={styles.startButtonText}>Iniciar Ruta</Text>
        </TouchableOpacity>
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...ELEVATION.low,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  qrSection: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...ELEVATION.low,
  },
  qrCode: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  card: {
    ...CARD_STYLES.default,
    marginHorizontal: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
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
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: '#fff3cd',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  warningText: {
    fontSize: FONT_SIZES.md,
    color: '#856404',
    marginLeft: SPACING.sm,
    flex: 1,
    fontWeight: '500',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  routeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
    ...BUTTON_STYLES.success,
    flexDirection: 'row',
  },
  startButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  retryButton: {
    ...BUTTON_STYLES.secondary,
  },
  retryButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});

export default PackageInfoScreen; 