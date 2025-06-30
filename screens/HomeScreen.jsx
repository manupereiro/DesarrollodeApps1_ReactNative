import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  const { logout, user } = useAuth(); 
  const navigation = useNavigation();

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#86CDE2', '#055A85']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>De Remate</Text>
            <View style={styles.headerRightButtons}>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>¡Bienvenido!</Text>
          
          <Text style={styles.subtitle}>
            Gestiona tus pedidos de manera eficiente
          </Text>

          {user && (
            <View style={styles.userInfoCard}>
              <LinearGradient
                colors={['#86CDE2', '#055A85']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.userInfoGradient}
              >
                <View style={styles.userInfoContent}>
                  <Ionicons name="person-circle" size={40} color="#fff" style={styles.userIcon} />
                  <View style={styles.userDetails}>
                    <Text style={styles.userInfoText}>Usuario: {user.username}</Text>
                    <Text style={styles.userInfoText}>Email: {user.email}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Estadísticas Rápidas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen del Día</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Entregados</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={24} color="#FF9800" />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>En Proceso</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trending-up-outline" size={24} color="#2196F3" />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Disponibles</Text>
              </View>
            </View>
          </View>

          {/* Información Útil */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Útil</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle-outline" size={20} color="#055A85" />
                <Text style={styles.infoText}>
                  Escanea códigos QR para crear nuevos pedidos
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>
                  Confirma entregas para actualizar tu historial
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="notifications-outline" size={20} color="#FF9800" />
                <Text style={styles.infoText}>
                  Próximamente: Notificaciones push
                </Text>
              </View>
            </View>
          </View>

          {/* Soporte Rápido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Necesitas Ayuda?</Text>
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <LinearGradient
                colors={['#86CDE2', '#055A85']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.helpButtonGradient}
              >
                <Ionicons name="help-circle-outline" size={24} color="#fff" />
                <Text style={styles.helpButtonText}>Ir a Configuración y Ayuda</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
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
  headerGradient: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 2,
  },
  settingsButton: {
    padding: 8,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 8,
    marginRight: 8,
  },
  logoutButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 8,
    color: '#445357',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
  },
  userInfoCard: {
    marginBottom: 25,
  },
  userInfoGradient: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userIcon: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userInfoText: {
    fontSize: 14,
    marginBottom: 3,
    color: '#fff',
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#445357',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#445357',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#445357',
    marginLeft: 12,
    flex: 1,
  },
  helpButton: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  helpButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
    marginLeft: 12,
  },
});

export default HomeScreen;