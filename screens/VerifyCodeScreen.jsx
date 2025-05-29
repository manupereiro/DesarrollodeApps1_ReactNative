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

const VerifyCodeScreen = ({ navigation, route }) => {
  const { email, codeType } = route.params || {};
  const [code, setCode] = useState('');
  const { verifyResetCode, resendCode, state } = useAuth();

  console.log('VerifyCodeScreen renderizada con:', { email, codeType });
  console.log('🔍 VerifyCodeScreen: isAuthenticated =', !!state.userToken);

  const isPasswordReset = codeType === 'passwordReset';

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email no encontrado');
      return;
    }

    try {
      console.log('🔄 VerifyCodeScreen: Verificando código...');
      if (isPasswordReset) {
        const response = await verifyResetCode({ email, code });
        console.log('✅ VerifyCodeScreen: Código verificado exitosamente:', response);
        
        // Navegación directa e inmediata
        console.log('🔄 VerifyCodeScreen: Navegando a ResetPasswordScreen con email:', email);
        navigation.navigate('ResetPasswordScreen', { email, code });
        console.log('✅ VerifyCodeScreen: Navegación ejecutada correctamente');
      }
    } catch (error) {
      console.log('❌ VerifyCodeScreen: Error verificando código:', error);
      Alert.alert('Error', error.error || 'Código inválido');
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Email no encontrado');
      return;
    }

    try {
      console.log('🔄 VerifyCodeScreen: Reenviando código...');
      await resendCode({ email, codeType });
      console.log('✅ VerifyCodeScreen: Código reenviado exitosamente');
      Alert.alert('Código reenviado', 'Se ha enviado un nuevo código a tu email');
    } catch (error) {
      console.log('❌ VerifyCodeScreen: Error reenviando código:', error);
      Alert.alert('Error', error.error || 'Error al reenviar código');
    }
  };

  const getTitle = () => {
    return isPasswordReset ? 'Verificar Código' : 'Verificar Email';
  };

  const getSubtitle = () => {
    return isPasswordReset 
      ? 'Ingresa el código de recuperación que enviamos a tu email'
      : 'Ingresa el código de verificación que enviamos a tu email';
  };

  // Si no hay email, mostrar error
  if (!email) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Error</Text>
          <Text style={styles.subtitle}>
            No se encontró el email. Por favor regresa e intenta nuevamente.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
          >
            <Text style={styles.buttonText}>Volver</Text>
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
        <Text style={styles.title}>{getTitle()}</Text>
        
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
        <Text style={styles.email}>{email}</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Código de 6 dígitos"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
            editable={!state.isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, state.isLoading && styles.buttonDisabled]}
          onPress={handleVerifyCode}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verificar Código</Text>
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

export default VerifyCodeScreen; 