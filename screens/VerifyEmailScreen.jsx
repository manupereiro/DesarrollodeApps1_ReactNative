import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const VerifyEmailScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [verificationCode, setVerificationCode] = useState('');
  const { verifyAccount, resendCode, state } = useAuth();

  console.log('VerifyEmailScreen renderizada con email:', email);
  console.log('🔍 VerifyEmailScreen: isAuthenticated =', !!state.userToken);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email no encontrado');
      return;
    }

    try {
      console.log('🔄 Enviando verificación con:', { email, verificationCode });
      const response = await verifyAccount({ email, verificationCode });
      console.log('✅ Respuesta de verificación:', response);
      
      // Si la verificación incluye token, se loguea automáticamente
      if (response.token) {
        Alert.alert(
          'Verificación exitosa',
          'Tu cuenta ha sido verificada y has iniciado sesión correctamente',
          [
            {
              text: 'OK',
              onPress: () => {
                // La navegación será manejada por el AuthContext automáticamente
                console.log('🎯 Usuario logueado automáticamente después de verificación');
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Verificación exitosa',
          'Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('LoginScreen'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error en verificación:', error);
      const errorMessage = error.error || error.message || 'Código de verificación inválido';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Email no encontrado');
      return;
    }

    try {
      await resendCode({ email, codeType: 'verification' });
      Alert.alert('Código reenviado', 'Se ha enviado un nuevo código a tu email');
    } catch (error) {
      const errorMessage = error.error || error.message || 'Error al reenviar código';
      Alert.alert('Error', errorMessage);
    }
  };

  // Si no hay email, mostrar error
  if (!email) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Error</Text>
          <Text style={styles.subtitle}>
            No se encontró el email. Por favor regresa al registro.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('RegisterScreen')}
          >
            <Text style={styles.buttonText}>Volver al Registro</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verificar Email</Text>
        
        <Text style={styles.subtitle}>
          Hemos enviado un código de verificación a:
        </Text>
        <Text style={styles.email}>{email}</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Código de verificación"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="numeric"
            maxLength={6}
            editable={!state.isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, state.isLoading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verificar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleResendCode}
          disabled={state.isLoading}
        >
          <Text style={styles.linkText}>Reenviar código</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2196F3',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    paddingVertical: 10,
  },
  linkText: {
    color: '#2196F3',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default VerifyEmailScreen; 