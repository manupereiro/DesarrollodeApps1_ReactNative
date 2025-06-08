import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
        navigation.navigate('ResetPassword', { email, code });
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
            onPress={() => navigation.navigate('ForgotPassword')}
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
          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Código de 6 dígitos"
              placeholderTextColor="#999"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              maxLength={6}
              editable={!state.isLoading}
            />
          </View>
        </View>
        <LinearGradient
          colors={['#86CDE2', '#055A85']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, state.isLoading && styles.buttonDisabled]}
        >
          <TouchableOpacity
            style={styles.buttonInner}
            onPress={handleVerifyCode}
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verificar Código</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.signInContainer}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleResendCode}
            disabled={state.isLoading}
          >
            <Text style={styles.signInButtonText}>Reenviar código</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 10,
    color: '#445357',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 5,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    borderRadius: 30,
    marginBottom: 60,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonInner: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInContainer: {
    alignItems: 'center',
  },
  signInButton: {
    paddingVertical: 10,
  },
  signInButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default VerifyCodeScreen;