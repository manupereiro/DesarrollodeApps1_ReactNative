import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const RouteDetailsScreen = ({ route, navigation }) => {
  const { routeData } = route.params || {};

  const handleOpenMaps = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  // Si no hay datos de la ruta, mostrar mensaje de error
  if (!routeData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles de la Ruta</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#666" />
          <Text style={styles.errorText}>No se encontraron datos de la ruta</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de la Ruta</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado y Fecha */}
        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Completada</Text>
          </View>
          <Text style={styles.dateText}>
            {routeData.completedAt || routeData.updatedAt ? 
              new Date(routeData.completedAt || routeData.updatedAt).toLocaleDateString() : 
              'Fecha no disponible'
            }
          </Text>
          <Text style={styles.timeText}>
            {routeData.completedAt || routeData.updatedAt ? 
              new Date(routeData.completedAt || routeData.updatedAt).toLocaleTimeString() : 
              'Hora no disponible'
            }
          </Text>
        </View>

        {/* Origen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Origen</Text>
          <TouchableOpacity 
            style={styles.addressCard}
            onPress={() => handleOpenMaps(routeData.origin)}
          >
            <View style={styles.addressHeader}>
              <Ionicons name="location" size={24} color="#2196F3" />
              <Text style={styles.addressText}>{routeData.origin || 'Origen no disponible'}</Text>
            </View>
            <Text style={styles.openMapsText}>Abrir en Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Destino */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destino</Text>
          <TouchableOpacity 
            style={styles.addressCard}
            onPress={() => handleOpenMaps(routeData.destination)}
          >
            <View style={styles.addressHeader}>
              <Ionicons name="flag" size={24} color="#2196F3" />
              <Text style={styles.addressText}>{routeData.destination || 'Destino no disponible'}</Text>
            </View>
            <Text style={styles.openMapsText}>Abrir en Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Detalles de la Ruta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles de la Ruta</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={24} color="#666" />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Distancia</Text>
                  <Text style={styles.detailValue}>{routeData.distance || 'N/A'} km</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={24} color="#666" />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Duración Estimada</Text>
                  <Text style={styles.detailValue}>
                    {routeData.estimatedDuration ? `${routeData.estimatedDuration} mins` : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {routeData.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notas:</Text>
                <Text style={styles.notesText}>{routeData.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Información Adicional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Adicional</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.infoText}>
                Fecha de asignación: {routeData.createdAt ? 
                  new Date(routeData.createdAt).toLocaleDateString() : 
                  'No disponible'
                }
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={20} color="#666" />
              <Text style={styles.infoText}>
                Estado: {routeData.status || 'No disponible'}
              </Text>
            </View>
            {routeData.completedAt && (
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-done-circle" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Completada: {new Date(routeData.completedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
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
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  openMapsText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailTextContainer: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  notesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  notesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  goBackButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RouteDetailsScreen; 