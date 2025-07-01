import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BORDER_RADIUS, COLORS, ELEVATION, FONT_SIZES, SPACING } from '../config/constants';
import { packagesService } from '../services/packagesService';

const ConfirmationCodeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { packageData, onDeliveryComplete } = route.params || {};
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleConfirmDelivery = async () => {
    // Validar código
    if (!code || code.length !== 6) {
      setErrors({ code: 'El código debe tener 6 dígitos' });
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: 'El código solo puede contener números' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await packagesService.confirmDelivery(packageData.id, code);
      
      if (result.success) {
        Alert.alert(
          '✅ Entrega Confirmada',
          result.message,
          [
            {
              text: 'Continuar',
              onPress: () => {
                if (onDeliveryComplete) {
                  onDeliveryComplete(result.packageInfo);
                }
                navigation.navigate('MyRoutes');
              }
            }
          ]
        );
      } else {
        Alert.alert('❌ Código Incorrecto', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.error || 'No se pudo confirmar la entrega');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text) => {
    // Solo permitir números y máximo 6 dígitos
    const numericText = text.replace(/[^0-9]/g, '').substring(0, 6);
    setCode(numericText);
    
    // Limpiar errores cuando el usuario escribe
    if (errors.code) {
      setErrors({});
    }
  };

  const getHintForPackage = () => {
    // Mostrar el código correcto como pista (solo para desarrollo)
    return `Código correcto: ${packageData?.confirmationCode || '123456'}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirmar Entrega</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Package Info Summary */}
          <View style={styles.packageSummary}>
            <MaterialIcons name="local-shipping" size={32} color={COLORS.primary} />
            <View style={styles.packageInfo}>
              <Text style={styles.packageCode}>{packageData?.qrCode}</Text>
              <Text style={styles.packageDesc}>{packageData?.description}</Text>
              <Text style={styles.recipientName}>{packageData?.recipientName}</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <MaterialIcons name="info-outline" size={24} color={COLORS.info} />
            <Text style={styles.instructions}>
              Solicita al cliente el código de confirmación de 6 dígitos para completar la entrega
            </Text>
          </View>

          {/* Expected Code Display (Development only) */}
          <View style={styles.hintContainer}>
            <MaterialIcons name="lightbulb-outline" size={20} color={COLORS.warning} />
            <Text style={styles.hint}>{getHintForPackage()}</Text>
          </View>

          {/* Code Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Código de Confirmación</Text>
            <TextInput
              style={[
                styles.codeInput,
                errors.code && styles.inputError
              ]}
              value={code}
              onChangeText={handleCodeChange}
              placeholder="000000"
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
              fontSize={24}
              letterSpacing={8}
              autoFocus
            />
            {errors.code && (
              <Text style={styles.errorText}>{errors.code}</Text>
            )}
            <Text style={styles.inputHint}>
              {code.length}/6 dígitos
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirmDelivery}
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textOnPrimary} />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={20} color={COLORS.textOnPrimary} />
                  <Text style={styles.buttonText}>Confirmar Entrega</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <MaterialIcons name="cancel" size={20} color={COLORS.textPrimary} />
              <Text style={[styles.buttonText, { color: COLORS.textPrimary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contact Customer */}
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => {
              Alert.alert(
                'Contactar Cliente',
                `¿Deseas llamar a ${packageData?.recipientName}?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Llamar', 
                    onPress: () => {
                      // Aquí podrías implementar la funcionalidad de llamada
                      Alert.alert('Funcionalidad no implementada', 'En una versión completa, esto abriría la aplicación de teléfono');
                    }
                  }
                ]
              );
            }}
          >
            <MaterialIcons name="phone" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>Contactar Cliente</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    ...ELEVATION.low,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  packageSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    ...ELEVATION.low,
  },
  packageInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  packageCode: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  packageDesc: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  recipientName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.lightGray,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  instructions: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}15`,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  hint: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  codeInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    ...ELEVATION.low,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  inputHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  buttonsContainer: {
    marginBottom: SPACING.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...ELEVATION.low,
  },
  confirmButton: {
    backgroundColor: COLORS.success,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
    marginLeft: SPACING.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  contactText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
});

export default ConfirmationCodeScreen; 