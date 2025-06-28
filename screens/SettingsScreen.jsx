import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleNotificationSettings = () => {
    // TODO: Implementar configuración de notificaciones
    Alert.alert('Próximamente', 'Configuración de notificaciones en desarrollo');
  };

  const handlePrivacySettings = () => {
    // TODO: Implementar configuración de privacidad
    Alert.alert('Próximamente', 'Configuración de privacidad en desarrollo');
  };

  const handleHelp = () => {
    // TODO: Implementar sección de ayuda
    Alert.alert('Próximamente', 'Sección de ayuda en desarrollo');
  };

  const handleAbout = () => {
    // TODO: Implementar sección de acerca de
    Alert.alert('Acerca de', 'Versión 1.0.0\nDesarrollado con ❤️');
  };
  const renderOption = (icon, title, onPress, isDestructive = false) => (
    <TouchableOpacity 
      style={styles.optionButton} 
      onPress={onPress}
    >
      <View style={styles.optionContent}>
        <View style={[styles.iconContainer, isDestructive && styles.destructiveIconContainer]}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={isDestructive ? '#f44336' : '#055A85'} 
          />
        </View>
        <Text style={[styles.optionText, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color="#999" 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <LinearGradient
        colors={['#86CDE2', '#055A85']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Configuración</Text>
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding}>
          <Text style={styles.pageTitle}>Configuración</Text>
          <Text style={styles.pageSubtitle}>Gestiona las preferencias de tu cuenta</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cuenta</Text>
            <View style={styles.optionsContainer}>
              {renderOption('notifications-outline', 'Notificaciones', handleNotificationSettings)}
              {renderOption('shield-outline', 'Privacidad', handlePrivacySettings)}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Soporte</Text>
            <View style={styles.optionsContainer}>
              {renderOption('help-circle-outline', 'Ayuda y Soporte', handleHelp)}
              {renderOption('information-circle-outline', 'Acerca de', handleAbout)}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.optionsContainer}>
              {renderOption('log-out-outline', 'Cerrar Sesión', handleLogout, true)}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentPadding: {
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 10,
    color: '#445357',
    letterSpacing: 2,
  },
  pageSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#445357',
    marginBottom: 20,
    letterSpacing: 1,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(134, 205, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  destructiveIconContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  optionText: {
    fontSize: 16,
    color: '#445357',
    fontWeight: '500',
    flex: 1,
  },
  destructiveText: {
    color: '#f44336',
  },
});

export default SettingsScreen; 