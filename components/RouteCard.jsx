import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RouteCard = ({ route, onSelect, onCancel, onComplete, showActions = true }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return '#4CAF50';
      case 'ASSIGNED':
        return '#2196F3';
      case 'IN_PROGRESS':
        return '#FFC107';
      case 'COMPLETED':
        return '#9E9E9E';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'ASSIGNED':
        return 'Asignada';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'COMPLETED':
        return 'Completada';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(route.status) },
            ]}
          />
          <Text style={styles.statusText}>{getStatusText(route.status)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.routeInfo}>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={20} color="#757575" />
            <Text style={styles.locationText}>{route.origin}</Text>
          </View>
          <View style={styles.locationContainer}>
            <MaterialIcons name="flag" size={20} color="#757575" />
            <Text style={styles.locationText}>{route.destination}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MaterialIcons name="straighten" size={20} color="#757575" />
            <Text style={styles.detailText}>{route.distance} km</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="access-time" size={20} color="#757575" />
            <Text style={styles.detailText}>
              {route.estimatedDuration ? `${route.estimatedDuration} mins` : 'No disponible'}
            </Text>
          </View>
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          {route.status === 'AVAILABLE' ? (
            <TouchableOpacity
              style={[styles.button, styles.selectButton]}
              onPress={() => onSelect(route.id)}
            >
              <Text style={styles.buttonText}>Elegir Ruta</Text>
            </TouchableOpacity>
          ) : (route.status === 'ASSIGNED' || route.status === 'IN_PROGRESS') ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.completeButton]}
                onPress={() => onComplete(route.id)}
              >
                <Text style={styles.buttonText}>Completar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => onCancel(route.id)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#757575',
  },
  content: {
    marginBottom: 16,
  },
  routeInfo: {
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#212121',
    marginLeft: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
});

export default RouteCard; 