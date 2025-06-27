import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { BarcodeScanningResult, CameraView } from 'expo-camera';

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    
    // Mostrar QR code por consola
    console.log('📱 QR Code escaneado:', data);
    
    try {
      // Aquí haríamos la llamada al backend
      // Por ahora simularemos con códigos de prueba
      if (data === 'PKG001' || data === 'PKG002' || data === 'PKG003') {
        Alert.alert(
          '✅ QR Code válido',
          `Código: ${data}\nRevisa la consola para ver la información del paquete.`,
          [
            {
              text: 'Ver Ruta',
              onPress: () => {
                // Navegar a la pantalla de información del paquete
                navigation.navigate('PackageInfo', { qrCode: data });
              }
            },
            {
              text: 'Escanear otro',
              onPress: () => setScanned(false)
            }
          ]
        );
      } else {
        Alert.alert(
          '❌ QR Code no válido',
          'Códigos de prueba disponibles: PKG001, PKG002, PKG003',
          [
            {
              text: 'Intentar de nuevo',
              onPress: () => setScanned(false)
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar el código QR');
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permisos de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara</Text>;
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
            </View>
          </View>
          
          {scanned && (
            <Button
              title={'Presiona para escanear nuevamente'}
              onPress={() => setScanned(false)}
            />
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
});

export default QRScannerScreen; 