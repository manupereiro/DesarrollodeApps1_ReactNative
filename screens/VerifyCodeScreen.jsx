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
  const { verifyResetCode, resendCode, isLoading } = useAuth();

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
      if (isPasswordReset) {
        await verifyResetCode({ email, code });
        Alert.alert(
          'Código verificado',
          'Ahora puedes cambiar tu contraseña',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ResetPassword', { email, code }),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.error || 'Código inválido');
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Email no encontrado');
      return;
    }

    try {
      await resendCode({ email, codeType });
      Alert.alert('Código reenviado', 'Se ha enviado un nuevo código a tu email');
    } catch (error) {
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
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerifyCode}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verificar Código</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleResendCode}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>Reenviar código</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>Volver al login</Text>
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