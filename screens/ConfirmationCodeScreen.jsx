import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { routesService } from '../services/routesService';

const ConfirmationCodeScreen = ({ route, navigation }) => {
  const { routeId, routeInfo } = route.params;
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Simular el código de confirmación (normalmente sería proporcionado por el comprador)
  const simulateCustomerCode = () => {
    const codes = ['123456', '789012', '345678'];
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    
    // Mostrar por consola como simulación del comprador
    console.log('=== CÓDIGO DE CONFIRMACIÓN DEL COMPRADOR ===');
    console.log('El comprador te proporciona el código:', randomCode);
    console.log('============================================');
    
    Alert.alert(
      '📱 Código del Comprador',
      `El comprador te ha proporcionado el código: ${randomCode}\n\n(Revisa la consola para ver la simulación)`,
      [
        {
          text: 'Usar este código',
          onPress: () => setConfirmationCode(randomCode)
        },
        {
          text: 'Ingresar manualmente',
          style: 'cancel'
        }
      ]
    );
  };

  const handleCompleteDelivery = async () => {
    if (!confirmationCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de confirmación');
      return;
    }

    if (!routeId) {
      Alert.alert('Error', 'No se encontró información de la ruta');
      return;
    }

    setLoading(true);
    try {
      // Llamar al backend para completar la entrega
      const completedRoute = await routesService.completeWithCode(routeId, confirmationCode);
      
      console.log('=== CÓDIGO DE CONFIRMACIÓN ===');
      console.log('El comprador proporciona el código:', confirmationCode);
      console.log('✅ Código verificado correctamente');
      console.log('🎉 Entrega completada exitosamente');
      console.log('Ruta completada:', completedRoute);
      console.log('==============================');

      Alert.alert(
        '🎉 Entrega Completada',
        'La entrega se ha completado exitosamente.',
        [
          {
            text: 'Ver mis rutas',
            onPress: () => navigation.navigate('MyRoutes')
          }
        ]
      );
    } catch (error) {
      console.log('❌ Error al completar entrega:', error);
      
      // Determinar el tipo de error
      let errorMessage = 'Error al completar la entrega';
      
      if (error.response?.status === 400) {
        errorMessage = 'Código de confirmación incorrecto';
      } else if (error.response?.status === 404) {
        errorMessage = 'Ruta no encontrada';
      } else if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para completar esta entrega';
      }
      
      Alert.alert(
        '❌ Error',
        errorMessage,
        [
          {
            text: 'Intentar de nuevo',
            style: 'cancel'
          },
          {
            text: 'Obtener nuevo código',
            onPress: simulateCustomerCode
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Código de Confirmación</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="verified" size={80} color="#4CAF50" />
        </View>

        <Text style={styles.title}>Completar Entrega</Text>
        <Text style={styles.subtitle}>
          Solicita al comprador el código de confirmación para completar la entrega
        </Text>

        {routeInfo && (
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Destino:</Text>
            <Text style={styles.routeText}>{routeInfo.destination}</Text>
          </View>
        )}

        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>Código de Confirmación</Text>
          <TextInput
            style={styles.codeInput}
            value={confirmationCode}
            onChangeText={setConfirmationCode}
            placeholder="Ingresa el código de 6 dígitos"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={styles.simulateButton}
          onPress={simulateCustomerCode}
        >
          <MaterialIcons name="phone" size={20} color="#2196F3" />
          <Text style={styles.simulateButtonText}>
            Simular código del comprador
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.completeButton, loading && styles.disabledButton]}
          onPress={handleCompleteDelivery}
          disabled={loading}
        >
          <MaterialIcons name="check-circle" size={24} color="#fff" />
          <Text style={styles.completeButtonText}>
            {loading ? 'Verificando...' : 'Completar Entrega'}
          </Text>
        </TouchableOpacity>

        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            💡 El comprador debe proporcionarte un código de 6 dígitos para confirmar la entrega
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  routeInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  codeSection: {
    width: '100%',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  codeInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  simulateButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  helpSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    width: '100%',
  },
  helpText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ConfirmationCodeScreen; 