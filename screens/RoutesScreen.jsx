import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const RoutesScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Gestión de Rutas</Text>
          <View style={styles.buttonsContainer}>
          <LinearGradient
            colors={['#86CDE2', '#055A85']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <TouchableOpacity
              style={styles.buttonInner}
              onPress={() => navigation.navigate('AvailableRoutes')}
            >
              <MaterialIcons name="local-shipping" size={32} color="#fff" />
              <Text style={styles.buttonText}>Rutas Disponibles</Text>
              <Text style={styles.buttonSubtext}>Ver y seleccionar nuevas rutas</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#86CDE2', '#055A85']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <TouchableOpacity
              style={styles.buttonInner}
              onPress={() => navigation.navigate('MyRoutes')}
            >
              <MaterialIcons name="assignment" size={32} color="#fff" />
              <Text style={styles.buttonText}>Mis Rutas</Text>
              <Text style={styles.buttonSubtext}>Gestionar rutas asignadas</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  buttonsContainer: {
    gap: 20,
  },  button: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonInner: {
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
});

export default RoutesScreen; 