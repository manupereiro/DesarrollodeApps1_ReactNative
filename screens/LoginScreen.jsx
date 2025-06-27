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
  View,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ELEVATION } from '../config/constants';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, state } = useAuth();
  
  // Referencias para animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);

  // Responsive sizing based on screen height
  const isSmallScreen = height < 700;
  const animationSize = isSmallScreen ? 180 : 240;
  const titleSize = isSmallScreen ? FONT_SIZES.xxxl : 48;

  // Estilos dinámicos basados en el tamaño de pantalla
  const dynamicStyles = {
    animationContainer: {
      alignItems: 'center',
      marginBottom: isSmallScreen ? SPACING.md : SPACING.xl,
    },
    title: {
      fontWeight: '300',
      textAlign: 'center',
      marginBottom: isSmallScreen ? SPACING.xl : SPACING.xxl * 1.5,
      color: COLORS.primaryDark,
      letterSpacing: 2,
    },
  };

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
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Iniciando sesión...</Text>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Animación Lottie */}
          <View style={dynamicStyles.animationContainer}>
            <LottieView
              ref={lottieRef}
              source={require('../assets/animations/truck.json')}
              style={[styles.animation, { width: animationSize, height: animationSize }]}
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
          
          <Text style={[dynamicStyles.title, { fontSize: titleSize }]}>De Remate</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Usuario"
                placeholderTextColor={COLORS.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!state.isLoading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={COLORS.textSecondary}
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
                  color={COLORS.textSecondary} 
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
            colors={['#86CDE2', COLORS.primary]}
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
                <ActivityIndicator color={COLORS.textOnPrimary} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  animation: {
    // Tamaño dinámico basado en el tamaño de pantalla
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.xs,
  },
  showButton: {
    padding: SPACING.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  loginButton: {
    borderRadius: BORDER_RADIUS.xl * 2,
    marginBottom: SPACING.lg,
    ...ELEVATION.medium,
  },
  loginButtonInner: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpContainer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  orSignUpText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
  signUpButton: {
    paddingVertical: SPACING.sm,
  },
  signUpButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});

export default LoginScreen;
