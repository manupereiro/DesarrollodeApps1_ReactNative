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
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email, code } = route.params || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
              navigation.navigate('LoginScreen');
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
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
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
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              editable={!state.isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!state.isLoading}
            />
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
            <Text style={styles.requirementText}>• Mínimo 8 caracteres</Text>
            <Text style={styles.requirementText}>• Debe coincidir en ambos campos</Text>
            <Text style={styles.requirementText}>• Debe contener al menos una letra</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, state.isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cambiar Contraseña</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
});

export default ResetPasswordScreen; 