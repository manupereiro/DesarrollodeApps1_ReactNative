import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { state } = useAuth();
  const { user } = state;

  // Datos de ejemplo para el historial de pedidos
  const orderHistory = [
    {
      id: '1',
      date: '2024-03-15',
      status: 'Entregado',
      items: 3,
      total: '$150.00',
      address: 'Av. Principal 123, Ciudad',
    },
    {
      id: '2',
      date: '2024-03-10',
      status: 'En tránsito',
      items: 2,
      total: '$95.00',
      address: 'Calle Secundaria 456, Ciudad',
    },
    {
      id: '3',
      date: '2024-03-05',
      status: 'Entregado',
      items: 4,
      total: '$200.00',
      address: 'Av. Principal 123, Ciudad',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Entregado':
        return '#4CAF50';
      case 'En tránsito':
        return '#FFA000';
      case 'Cancelado':
        return '#F44336';
      default:
        return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Ionicons name="person-circle" size={100} color="#2196F3" />
          </View>
          <Text style={styles.username}>{user?.username || 'Usuario'}</Text>
          <Text style={styles.email}>{user?.email || 'email@ejemplo.com'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={24} color="#666" />
              <Text style={styles.infoText}>Nombre completo</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={24} color="#666" />
              <Text style={styles.infoText}>Correo electrónico</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="phone-portrait-outline" size={24} color="#666" />
              <Text style={styles.infoText}>Teléfono</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Pedidos</Text>
          {orderHistory.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderDate}>{order.date}</Text>
                  <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                    {order.status}
                  </Text>
                </View>
                <Text style={styles.orderTotal}>{order.total}</Text>
              </View>
              
              <View style={styles.orderDetails}>
                <View style={styles.orderDetailRow}>
                  <Ionicons name="cube-outline" size={20} color="#666" />
                  <Text style={styles.orderDetailText}>{order.items} artículos</Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.orderDetailText}>{order.address}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>Ver detalles</Text>
                <Ionicons name="chevron-forward" size={20} color="#2196F3" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginBottom: 10,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderDetailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  viewDetailsText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
});

export default ProfileScreen; 