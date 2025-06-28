import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';
import { routesService } from '../services/routesService';

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (loading) return; // Evitar múltiples escaneos
    
    setScanned(true);
    setLoading(true);
    
    console.log('📱 QR Code escaneado:', data);
    
    try {
      // Llamar al backend para validar el QR
      const packageInfo = await routesService.scanQR(data);
      
      console.log('✅ QR válido - Información del paquete:', packageInfo);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        '✅ Pedido en Curso',
        `QR escaneado exitosamente.\n\nPaquete: ${packageInfo.description}\nUbicación: ${packageInfo.location}\n\nEl pedido ha sido activado y está listo para entrega.`,
        [
          {
            text: 'Ver Detalles',
            onPress: () => {
              // Navegar a la pantalla de información del paquete
              navigation.navigate('PackageInfo', { 
                qrCode: data,
                packageInfo: packageInfo 
              });
            }
          },
          {
            text: 'Continuar',
            style: 'cancel',
            onPress: () => setScanned(false)
          }
        ]
      );
      
    } catch (error) {
      console.log('❌ Error al escanear QR:', error);
      
      // Determinar el tipo de error
      let errorMessage = 'Error al procesar el código QR';
      
      if (error.response?.status === 404) {
        errorMessage = 'Este pedido no está en mis rutas';
      } else if (error.response?.status === 400) {
        errorMessage = 'QR inválido o ya procesado';
      } else if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para este pedido';
      }
      
      Alert.alert(
        '❌ QR No Válido',
        errorMessage,
        [
          {
            text: 'Intentar de nuevo',
            onPress: () => setScanned(false)
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.centerText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.centerText}>Sin acceso a la cámara</Text>
        <Text style={styles.centerSubtext}>Necesitas permitir el acceso a la cámara para escanear códigos QR</Text>
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
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}>
            <View style={styles.focusedContainer}>
              <Text style={styles.text}>Apunta la cámara al código QR del paquete</Text>
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#00ff00" />
                  <Text style={styles.loadingText}>Procesando...</Text>
                </View>
              )}
            </View>
          </View>
          
          {scanned && !loading && (
            <View style={styles.buttonContainer}>
              <Button
                title={'Escanear nuevamente'}
                onPress={() => setScanned(false)}
              />
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
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
  },
  focusedContainer: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00ff00',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  centerSubtext: {
    color: '#fff',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QRScannerScreen; 