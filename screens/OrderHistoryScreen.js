import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    collection,
    doc,
    getDocs,
    getFirestore,
    increment,
    setDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);
  const firestore = getFirestore();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const storedPhone = await AsyncStorage.getItem('userPhone');
        if (!storedPhone) {
          Alert.alert('Not logged in', 'Please log in to view order history.');
          setLoading(false);
          return;
        }

        setUid(storedPhone);

        const snapshot = await getDocs(
          collection(firestore, `users/${storedPhone}/orders`)
        );

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(data.reverse()); // Newest first
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        Alert.alert('Error', 'Could not load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleReorder = async (order) => {
    if (!uid) {
      Alert.alert('Login Required', 'Please log in again.');
      return;
    }

    try {
      for (const item of order.cart) {
        const itemRef = doc(firestore, `users/${uid}/cart/${item.barcode}`);
        await setDoc(
          itemRef,
          {
            name: item.name,
            price: item.price,
            quantity: increment(item.quantity),
            barcode: item.barcode,
          },
          { merge: true }
        );
      }

      Alert.alert(' Reorder Successful', 'Items added to your cart.', [
        {
          text: 'Go to Cart',
          onPress: () => navigation.navigate('HomeTab', { screen: 'Cart' }),
        },
      ]);
    } catch (err) {
      console.error('Reorder failed:', err);
      Alert.alert(' Error', 'Failed to reorder. Try again.');
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Unknown Date'}
        </Text>
        <Text style={styles.orderTotal}>₹{item.total}</Text>
      </View>
      
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsLabel}>Items Ordered:</Text>
        {item.cart?.map((cartItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{cartItem.name}</Text>
            <Text style={styles.itemQuantity}>x {cartItem.quantity}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.reorderButton}
        onPress={() => handleReorder(item)}
      >
        <Text style={styles.reorderText}>🔄 Reorder</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start shopping to see your order history here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0071CE" />

      <LinearGradient
                    colors={['#0071CE', '#004A9F']}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order History</Text>
          <Text style={styles.headerSubtitle}>Track your previous orders</Text>
        </View>
      </LinearGradient> 

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0071CE" />
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: {
    backgroundColor: '#0071CE',
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: { 
    alignItems: 'center', 
    marginTop: 20 
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 20 
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0071CE',
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    marginRight: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0071CE',
  },
  reorderButton: {
    backgroundColor: '#0071CE',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0071CE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  reorderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});