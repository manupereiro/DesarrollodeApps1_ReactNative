import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ELEVATION, BUTTON_STYLES } from '../config/constants';

const RouteCard = ({ route, onSelect, onCancel, onComplete, onNavigateToCode, showActions = true }) => {
  // Debug: Log la ruta que recibe este componente
  console.log('🔍 RouteCard - Ruta recibida:', JSON.stringify(route, null, 2));
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return COLORS.success;
      case 'ASSIGNED':
        return COLORS.primary;
      case 'IN_PROGRESS':
        return COLORS.warning;
      case 'COMPLETED':
        return COLORS.gray;
      case 'CANCELLED':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
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
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: `${color}15`, // 15% opacity
      borderColor: color,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, getStatusBadgeStyle(route.status)]}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(route.status) },
            ]}
          />
          <Text style={[styles.statusText, { color: getStatusColor(route.status) }]}>
            {getStatusText(route.status)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.routeInfo}>
          <View style={styles.locationContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="location-on" size={18} color={COLORS.success} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Origen</Text>
              <Text style={styles.locationText} numberOfLines={1}>{route?.origin || 'Sin origen'}</Text>
            </View>
          </View>
          
          <View style={styles.routeArrow}>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.textSecondary} />
          </View>
          
          <View style={styles.locationContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="flag" size={18} color={COLORS.error} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Destino</Text>
              <Text style={styles.locationText} numberOfLines={1}>{route?.destination || 'Sin destino'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MaterialIcons name="straighten" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{route?.distance || 'N/A'} km</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="access-time" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {route.estimatedDuration ? `${route.estimatedDuration} min` : 'N/A'}
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
              <MaterialIcons name="add-road" size={16} color={COLORS.textOnPrimary} />
              <Text style={styles.buttonText}>Elegir Ruta</Text>
            </TouchableOpacity>
          ) : (route.status === 'ASSIGNED' || route.status === 'IN_PROGRESS') ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.completeButton]}
                onPress={() => onNavigateToCode ? onNavigateToCode(route) : onComplete(route.id)}
              >
                <MaterialIcons name="check-circle" size={16} color={COLORS.textOnPrimary} />
                <Text style={styles.buttonText}>Completar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => onCancel(route.id)}
              >
                <MaterialIcons name="cancel" size={16} color={COLORS.textOnPrimary} />
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
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    ...ELEVATION.low,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  content: {
    marginBottom: SPACING.md,
  },
  routeInfo: {
    marginBottom: SPACING.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
    fontWeight: '500',
  },
  locationText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  routeArrow: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  actions: {
    marginTop: SPACING.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 44, // Para mejor accesibilidad
    ...ELEVATION.low,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.success,
    flex: 1,
    marginRight: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    flex: 1,
    marginLeft: SPACING.xs,
  },
  buttonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
  },
});

export default RouteCard; 