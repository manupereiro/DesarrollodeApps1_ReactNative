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
    
    console.log('📱 QR Code escaneado:', data);
    console.log('📱 QR Code details:', {
      length: data.length,
      preview: data.substring(0, 100)
    });
    
    try {
      // Enviar DIRECTAMENTE a validación - el servicio se encarga de todo
      console.log('🔍 Enviando QR a validación:', data);
      
      // Validar QR con el servicio de paquetes
      const validationResult = await packagesService.validateQR(data);
      
      if (validationResult.isValid) {
        // QR válido - Mostrar información y proceder
        Alert.alert(
          '✅ QR Válido',
          `Paquete: ${validationResult.packageInfo.description}\nDestinatario: ${validationResult.packageInfo.recipientName}`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => {
                setScanned(false);
                setIsValidating(false);
              }
            },
            {
              text: 'Ver Información del Paquete',
              onPress: () => {
                console.log('🚀 Navegando a PackageInfo con datos:', validationResult.packageInfo);
                
                // 1. MARCAR PAQUETE COMO ESCANEADO INMEDIATAMENTE
                markPackageScanned(
                  validationResult.packageInfo.routeId,
                  validationResult.packageInfo.id,
                  validationResult.packageInfo
                );
                
                // 2. ACTUALIZAR ESTADO DE RUTA A IN_PROGRESS
                updateRouteStatus(
                  validationResult.packageInfo.routeId,
                  'IN_PROGRESS'
                );
                
                // 3. QUITAR ESTADOS DE LOADING
                setScanned(false);
                setIsValidating(false);
                
                // 4. IR DIRECTO A PACKAGEINFO
                const packageWithScannedFlag = {
                  ...validationResult.packageInfo,
                  scanned: true,
                  scannedAt: new Date().toISOString(),
                  status: 'IN_PROGRESS'
                };
                
                console.log('🎯 QRScanner - Navegando con paquete marcado como escaneado:', packageWithScannedFlag);
                
                navigation.navigate('PackageInfo', {
                  packageData: packageWithScannedFlag,
                  qrCode: data,
                  fromQRScan: true
                });
              }
            }
          ]
        );
      } else {
        // QR no válido
        Alert.alert(
          '❌ QR No Válido',
          validationResult.message,
          [
            {
              text: 'Entendido',
              onPress: () => {
                setScanned(false);
                setIsValidating(false);
              }
            },

          ]
        );
      }
    } catch (error) {
      console.error('❌ Error validando QR:', error);
      Alert.alert(
        'Error de Conexión',
        error.error || 'No se pudo validar el código QR. Verifica tu conexión a internet.',
        [
          {
            text: 'Reintentar',
            onPress: () => {
              setScanned(false);
              setIsValidating(false);
            }
          }
        ]
      );
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
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
                El QR debe venir de "Mis Rutas" → Paquetes
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
  headerSpacer: {
    width: 40,
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
    bottom: 150,
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
});

export default QRScannerScreen; 