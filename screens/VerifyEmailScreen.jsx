import { useState } from 'react';
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

const VerifyEmailScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [verificationCode, setVerificationCode] = useState('');
  const { verifyAccount, resendCode, state } = useAuth();

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
      const response = await verifyAccount({ email, verificationCode });
      if (response.token) {
        Alert.alert(
          'Verificación exitosa',
          'Tu cuenta ha sido verificada y has iniciado sesión correctamente',
          [
            {
              text: 'OK',
              onPress: () => {},
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
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
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
            onPress={() => navigation.navigate('Register')}
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
          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={20} color="#999" style={styles.inputIcon} />
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
        </View>

        <LinearGradient
          colors={['#86CDE2', '#055A85']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, state.isLoading && styles.buttonDisabled]}
        >
          <TouchableOpacity
            style={styles.buttonInner}
            onPress={handleVerify}
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verificar</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

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
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  button: {
    borderRadius: 30,
    marginBottom: 40,
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
