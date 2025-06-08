import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email, code } = route.params || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword, state } = useAuth();

  console.log('ResetPasswordScreen renderizada con:', { email, code });
  console.log('🔍 ResetPasswordScreen: isAuthenticated =', !!state.userToken);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres y contener al menos una letra');
      return;
    }

    // Verificar que tenga al menos una letra
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    if (!hasLetter) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres y contener al menos una letra');
      return;
    }

    if (!email || !code) {
      Alert.alert('Error', 'Información de verificación no encontrada');
      return;
    }

    try {
      console.log('🔄 ResetPasswordScreen: Restableciendo contraseña...');
      const response = await resetPassword({
        email,
        code,
        newPassword,
        confirmPassword,
      });
      console.log('✅ ResetPasswordScreen: Contraseña restablecida exitosamente:', response);
      
      Alert.alert(
        'Contraseña restablecida',
        'Tu contraseña ha sido cambiada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('🔄 ResetPasswordScreen: Navegando a LoginScreen');
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (error) {
      console.log('❌ ResetPasswordScreen: Error restableciendo contraseña:', error);
      Alert.alert('Error', error.error || 'Error al restablecer contraseña');
    }
  };

  // Si no hay email o código, mostrar error
  if (!email || !code) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Error</Text>
          <Text style={styles.subtitle}>
            Información de verificación no encontrada. Por favor intenta el proceso desde el inicio.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.buttonText}>Volver a Recuperar Contraseña</Text>
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Nueva Contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu nueva contraseña para la cuenta:
          </Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                editable={!state.isLoading}
              />
              <TouchableOpacity
                style={styles.showButton}
                onPress={() => setShowNewPassword((prev) => !prev)}
                disabled={state.isLoading}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!state.isLoading}
              />
              <TouchableOpacity
                style={styles.showButton}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                disabled={state.isLoading}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
            <Text style={styles.requirementText}>• Mínimo 8 caracteres</Text>
            <Text style={styles.requirementText}>• Debe coincidir en ambos campos</Text>
            <Text style={styles.requirementText}>• Debe contener al menos una letra</Text>
          </View>

          <LinearGradient
            colors={['#86CDE2', '#055A85']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, state.isLoading && styles.buttonDisabled]}
          >
            <TouchableOpacity
              style={styles.buttonInner}
              onPress={handleResetPassword}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cambiar Contraseña</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 15,
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
  passwordRequirements: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
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
  showButton: {
    padding: 5,
  },
});

export default ResetPasswordScreen;