import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';
import { useRoutes } from '../context/RoutesContext';
import { packagesService } from '../services/packagesService';

const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const navigation = useNavigation();
  const { updateRouteStatus, markPackageScanned } = useRoutes();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isValidating) return;
    
    setScanned(true);
    setIsValidating(true);
    
    try {
      // Validar el QR code
      const validationResult = await packagesService.validateQRCode(data);
      
      if (validationResult.isValid) {
        // Navegar a la pantalla de información del paquete
        navigation.navigate('PackageInfo', {
          packageInfo: validationResult.packageInfo,
          routeId: validationResult.packageInfo.routeId,
          packageId: validationResult.packageInfo.id
        });
      } else {
        Alert.alert('QR Inválido', validationResult.message || 'Este código QR no es válido');
        setScanned(false);
        setIsValidating(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar el código QR');
      setScanned(false);
      setIsValidating(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="camera-alt" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Sin acceso a la cámara</Text>
        <Text style={styles.errorSubtext}>
          Por favor, permite el acceso a la cámara en la configuración de la aplicación
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Escanear QR</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}>
            <View style={styles.focusedContainer}>
              <View style={styles.scanArea}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
          </View>
          
          {/* Instrucciones */}
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionItem}>
              <MaterialIcons name="info" size={20} color={COLORS.primary} />
              <Text style={styles.instructionText}>
                Apunta la cámara hacia el código QR del paquete
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <MaterialIcons name="qr-code" size={20} color={COLORS.primary} />
              <Text style={styles.instructionText}>
                El QR debe coincidir con el de alguno de los paquetes seleccionados en mis pedidos
              </Text>
            </View>
          </View>
        </View>

        {/* Estado de validación */}
        {isValidating && (
          <View style={styles.validatingContainer}>
            <ActivityIndicator size="large" color={COLORS.textOnPrimary} />
            <Text style={styles.validatingText}>Validando QR...</Text>
          </View>
        )}

        {/* Manual scan again button */}
        {scanned && !isValidating && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <MaterialIcons name="refresh" size={20} color={COLORS.textOnPrimary} />
            <Text style={styles.scanAgainText}>Escanear otro QR</Text>
          </TouchableOpacity>
        )}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  focusedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.success,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  instructionText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  validatingContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 10,
  },
  validatingText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  scanAgainText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.sm,
    fontWeight: '600',
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
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  backButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
  headerSpacer: {
    width: 40,
  },
});

export default QRScannerScreen; 