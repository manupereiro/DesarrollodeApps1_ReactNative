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
  };  return (
    <View style={styles.container}>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>¡Bienvenido!</Text>
          
          <Text style={styles.subtitle}>
            Has iniciado sesión correctamente
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

          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Próximas funcionalidades</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="location-outline" size={20} color="#055A85" />
                <Text style={styles.featureText}>Gestión de rutas</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="qr-code-outline" size={20} color="#055A85" />
                <Text style={styles.featureText}>Escaneo de códigos QR</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="map-outline" size={20} color="#055A85" />
                <Text style={styles.featureText}>Navegación con Google Maps</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time-outline" size={20} color="#055A85" />
                <Text style={styles.featureText}>Historial de entregas</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="notifications-outline" size={20} color="#055A85" />
                <Text style={styles.featureText}>Notificaciones push</Text>
              </View>
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
    backgroundColor: '#055A85',
  },
  safeArea: {
    backgroundColor: '#055A85',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#055A85',
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
  },  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
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
    marginBottom: 40,
    color: '#666',
  },
  userInfoCard: {
    marginBottom: 30,
  },
  userInfoGradient: {
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  userIcon: {
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
    fontWeight: '500',
  },
  featuresCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#445357',
    textAlign: 'center',
    letterSpacing: 1,
  },
  featuresList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#86CDE2',
  },
  featureText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#445357',
    fontWeight: '500',
  },
});

export default HomeScreen; 