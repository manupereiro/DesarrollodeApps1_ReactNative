import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, state } = useAuth();
  
  // Referencias para animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);

  useEffect(() => {
    // Animación de fade-in al cargar la pantalla
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      console.log('🔄 Intentando login con username:', username);
      const credentials = { username: username.trim(), password: password.trim() };
      await login(credentials);
      console.log('✅ Login exitoso');
    } catch (error) {
      console.log('❌ Error en login:', error);
      if (error.error === 'Account not verified' || error.message === 'Account not verified') {
        Alert.alert(
          'Cuenta no verificada',
          'Tu cuenta no ha sido verificada. Para verificar necesitas tu email.',
          [{ text: 'OK' }]
        );
      } else {
        const errorMessage = error.error || error.message || 'Error al iniciar sesión';
        Alert.alert('Error', errorMessage);
      }
    }
  };

  return state.isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Iniciando sesión...</Text>
    </View>
  ) : (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Animación Lottie */}
        <View style={styles.animationContainer}>
          <LottieView
            ref={lottieRef}
            source={require('../assets/animations/truck.json')}
            style={styles.animation}
            autoPlay={true}
            loop={true}
            speed={state.isLoading ? 1.5 : 1}
            resizeMode="contain"
            renderMode="HARDWARE"
            cacheComposition={true}
            hardwareAccelerationAndroid={true}
            colorFilters={[]}
          />
        </View>
        
        <Text style={styles.title}>De Remate</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!state.isLoading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!state.isLoading}
            />
            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowPassword((prev) => !prev)}
              disabled={state.isLoading}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={state.isLoading}
        >
          <Text style={styles.forgotPasswordText}>Recuperar contraseña</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={['#86CDE2', '#055A85']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.loginButton, state.isLoading && styles.buttonDisabled]}
        >
          <TouchableOpacity
            style={styles.loginButtonInner}
            onPress={handleLogin}
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.signUpContainer}>
          <Text style={styles.orSignUpText}>¿No tienes cuenta?</Text>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate('Register')}
            disabled={state.isLoading}
          >
            <Text style={styles.signUpButtonText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
  animationContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  animation: {
    width: 280,
    height: 280,
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 60,
    color: '#445357',
    letterSpacing: 2,
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
  },
  showButton: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
  forgotPasswordText: {
    color: '#999',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 30,
    marginBottom: 60,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonInner: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpContainer: {
    alignItems: 'center',
  },
  orSignUpText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 15,
  },
  signUpButton: {
    paddingVertical: 10,
  },
  signUpButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
});

export default LoginScreen;
