import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../config/constants';
import { useRoutes } from '../context/RoutesContext';

const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const navigation = useNavigation();
  const { scanQR, myRoutes } = useRoutes();
  const cameraRef = useRef(null);

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
    
    console.log('📱 QR Code escaneado (contenido):', data);
    console.log('📱 QR Code details:', {
      length: data.length,
      preview: data.substring(0, 100)
    });
    
    try {
      // 🎯 USAR EL BASE64 DEL QR QUE YA VIENE EN EL PAQUETE
      console.log('📸 Usando Base64 del QR del paquete...');
      
      // Buscar el paquete específico basado en el QR escaneado
      // El QR contiene: "PACKAGE_354_Documentos importantes"
      const packageIdMatch = data.match(/PACKAGE_(\d+)_/);
      const packageId = packageIdMatch ? parseInt(packageIdMatch[1]) : null;
      
      console.log('🔍 Buscando paquete con ID:', packageId);
      
      let qrImageBase64 = null;
      
      // Buscar el paquete específico en todas las rutas
      for (const route of myRoutes) {
        const pkg = route.packages?.find(pkg => pkg.id === packageId);
        if (pkg && pkg.qrCode && pkg.qrCode.includes('data:image')) {
          qrImageBase64 = pkg.qrCode;
          console.log('✅ QR Base64 encontrado en paquete:', pkg.id);
          break;
        }
      }
      
      if (!qrImageBase64) {
        console.warn('⚠️ No se encontró QR Base64 para el paquete:', packageId);
        // Fallback: usar el primer QR disponible
        for (const route of myRoutes) {
          const pkg = route.packages?.find(pkg => pkg.qrCode && pkg.qrCode.includes('data:image'));
          if (pkg) {
            qrImageBase64 = pkg.qrCode;
            console.log('🔄 Usando QR Base64 de fallback del paquete:', pkg.id);
            break;
          }
        }
      }
      
      if (!qrImageBase64) {
        throw new Error('No se encontró QR Base64 en los paquetes');
      }
      
      console.log('📱 QR Image Base64 (del paquete):', qrImageBase64.substring(0, 100) + '...');
      
      // Usar el nuevo método del contexto que llama al backend real
      console.log('🔍 Escaneando QR con backend real (Base64):');
      
      const scanResult = await scanQR(qrImageBase64);
      
      if (scanResult.success) {
        // QR válido - Mostrar información y proceder
        Alert.alert(
          '✅ QR Válido',
          `Código de confirmación: ${scanResult.confirmationCode}\n\n${scanResult.message}`,
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
                console.log('🚀 Navegando a PackageInfo con datos del backend:', scanResult);
                
                // Crear objeto de paquete con datos del backend
                const packageData = {
                  id: scanResult.packageId,
                  qrCode: data,
                  routeId: scanResult.routeId,
                  confirmationCode: scanResult.confirmationCode,
                  verificationCode: scanResult.confirmationCode,
                  description: `Paquete ID ${scanResult.packageId}`,
                  recipientName: 'Cliente',
                  recipientPhone: '+54 11 1234-5678',
                  address: 'Dirección de entrega',
                  weight: '1.5 kg',
                  dimensions: '25x20x15 cm',
                  priority: 'MEDIA',
                  estimatedDelivery: new Date().toISOString(),
                  status: 'IN_PROGRESS',
                  scanned: true,
                  scannedAt: new Date().toISOString()
                };
                
                console.log('🎯 QRScanner - Navegando con paquete del backend:', packageData);
                
                // Quitar estados de loading
                setScanned(false);
                setIsValidating(false);
                
                // Navegar a PackageInfo con los datos del backend
                navigation.navigate('PackageInfo', {
                  packageData: packageData,
                  qrCode: data,
                  fromQRScan: true,
                  confirmationCode: scanResult.confirmationCode
                });
              }
            }
          ]
        );
      } else {
        // QR no válido
        Alert.alert(
          '❌ QR No Válido',
          scanResult.message || 'Este QR no corresponde a ningún paquete válido.',
          [
            {
              text: 'Entendido',
              onPress: () => {
                setScanned(false);
                setIsValidating(false);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error escaneando QR:', error);
      Alert.alert(
        'Error de Conexión',
        error.message || 'No se pudo escanear el código QR. Verifica tu conexión a internet.',
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
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
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
          
          {/* Instrucciones - Movidas más abajo */}
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionItem}>
              <MaterialIcons name="qr-code-scanner" size={24} color={COLORS.primary} />
              <Text style={styles.instructionText}>
                Apunta la cámara hacia el código QR del paquete
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
              <Text style={styles.instructionText}>
                Asegúrate de que el pedido esté en "Mis Pedidos"
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
  backButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  backButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default QRScannerScreen; 