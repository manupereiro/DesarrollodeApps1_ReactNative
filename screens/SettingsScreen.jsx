import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
      style={[styles.optionButton, isDestructive && styles.destructiveButton]} 
      onPress={onPress}
    >
      <View style={styles.optionContent}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={isDestructive ? '#f44336' : '#2196F3'} 
        />
        <Text style={[styles.optionText, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={isDestructive ? '#f44336' : '#666'} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          {renderOption('notifications-outline', 'Notificaciones', handleNotificationSettings)}
          {renderOption('shield-outline', 'Privacidad', handlePrivacySettings)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          {renderOption('help-circle-outline', 'Ayuda y Soporte', handleHelp)}
          {renderOption('information-circle-outline', 'Acerca de', handleAbout)}
        </View>

        <View style={styles.section}>
          {renderOption('log-out-outline', 'Cerrar Sesión', handleLogout, true)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2196F3',
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
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  destructiveButton: {
    backgroundColor: '#fff',
  },
  destructiveText: {
    color: '#f44336',
  },
});

export default SettingsScreen; 