import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const OrderHistoryScreen = ({ navigation }) => {
  // Datos hardcodeados para el historial completo
  const [orders] = useState([
    {
      id: 1,
      date: '2024-03-15',
      status: 'Entregado',
      address: 'Av. Siempreviva 742, Springfield',
      items: 3,
      total: 1500.00
    },
    {
      id: 2,
      date: '2024-03-10',
      status: 'En Proceso',
      address: 'Calle Falsa 123, Springfield',
      items: 2,
      total: 850.50
    },
    {
      id: 3,
      date: '2024-03-05',
      status: 'Entregado',
      address: 'Av. Principal 456, Springfield',
      items: 4,
      total: 2300.75
    },
    {
      id: 4,
      date: '2024-02-28',
      status: 'Entregado',
      address: 'Calle Secundaria 789, Springfield',
      items: 1,
      total: 450.00
    },
    {
      id: 5,
      date: '2024-02-20',
      status: 'Entregado',
      address: 'Av. Siempreviva 742, Springfield',
      items: 2,
      total: 1200.00
    }
  ]);

  const handleOrderPress = (orderId) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Pedidos</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay pedidos en el historial</Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity 
              key={order.id} 
              style={styles.orderCard}
              onPress={() => handleOrderPress(order.id)}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNumber}>Pedido #{order.id}</Text>
                  <Text style={styles.orderDate}>{new Date(order.date).toLocaleDateString()}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: order.status === 'Entregado' ? '#E8F5E9' : '#FFF3E0' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: order.status === 'Entregado' ? '#2E7D32' : '#EF6C00' }
                  ]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.detailText} numberOfLines={1}>{order.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cube-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{order.items} items</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>${order.total.toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => handleOrderPress(order.id)}
              >
                <Text style={styles.detailsButtonText}>Ver Detalles</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
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
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  detailsButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default OrderHistoryScreen; 