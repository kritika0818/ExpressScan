// CartScreen.js (Final: All Offers Applied Correctly)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ... (imports remain the same)

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState([]);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const firestore = getFirestore();

  useEffect(() => {
    AsyncStorage.getItem('userPhone').then((phone) => {
      if (phone) setUid(phone);
    });
  }, []);

  const ITEM_DB = {
    '123456789012': { name: 'Milk', price: 30 },
    '987654321098': { name: 'Bread', price: 25 },
    '111122223333': { name: 'Eggs (Dozen)', price: 70 },
    '8901058842029': { name: 'Parle-G Biscuits', price: 10 },
    '000111222333': { name: 'Cornflakes', price: 40 },
    '123123123123': { name: 'Jam', price: 40 },
  };

  const handleDeepLink = async (url) => {
    const barcode = new URL(url).searchParams.get('barcode');
    if (!barcode || !uid) return;

    const item = ITEM_DB[barcode];
    if (!item) {
      Alert.alert('Item not found', `No product found for barcode ${barcode}`);
      return;
    }

    const itemRef = doc(firestore, `users/${uid}/cart/${barcode}`);
    await setDoc(
      itemRef,
      {
        ...item,
        barcode,
        quantity: increment(1),
      },
      { merge: true }
    );
  };

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });
    const sub = Linking.addEventListener('url', (e) => handleDeepLink(e.url));
    return () => sub.remove();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(collection(firestore, `users/${uid}/cart`), (snapshot) => {
      const rawItems = snapshot.docs.map((doc) => ({ ...doc.data(), barcode: doc.id }));

     const subtotal = rawItems.reduce((sum, item) => {
  const offerQty = item.offerQuantity || 0;
  const manualQty = item.quantity - offerQty;

  const comboPart = item.comboPrice && offerQty > 0
    ? item.comboPrice * offerQty
    : item.price * offerQty;

  return sum + comboPart + item.price * manualQty;
}, 0);

const hasThreshold = subtotal >= 500;


      const updatedItems = rawItems.map((item) => {
        const offerQty = item.offerQuantity || 0;
        const manualQty = item.quantity - offerQty;
        const comboPrice = item.comboPrice || item.price;

        let discount = 0;

        // Combo or individual offer discount
        if (item.discountRate && offerQty > 0) {
          discount += item.price * offerQty * item.discountRate;
        } else if (item.comboPrice && offerQty > 0) {
          discount += (item.price * offerQty) - (comboPrice * offerQty);
        }

        // Threshold discount (only on non-offer quantity)
        if (hasThreshold && manualQty > 0) {
          discount += item.price * manualQty * 0.10;
        }

        const finalPrice = item.price * item.quantity - discount;

        return {
          ...item,
          discount,
          finalPrice,
        };
      });

      setCart(updatedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const updateQuantity = async (barcode, delta) => {
    const item = cart.find((i) => i.barcode === barcode);
    if (!item || !uid) return;

    const newQty = item.quantity + delta;
    const itemRef = doc(firestore, `users/${uid}/cart/${barcode}`);

    setUpdating(barcode);
    try {
      if (newQty <= 0) {
        await deleteDoc(itemRef);
      } else {
        await updateDoc(itemRef, { quantity: newQty });
      }
    } catch (err) {
      console.error('Quantity update error:', err);
      Alert.alert('Error', 'Could not update quantity.');
    } finally {
      setUpdating(null);
    }
  };

  const deleteItem = async (barcode) => {
    Alert.alert('Remove Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const ref = doc(firestore, `users/${uid}/cart/${barcode}`);
            await deleteDoc(ref);
          } catch (err) {
            console.error('Delete error:', err);
            Alert.alert('Error', 'Failed to delete item.');
          }
        },
      },
    ]);
  };

  const total = cart.reduce((sum, i) => sum + (i.finalPrice || i.price * i.quantity), 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const renderItem = ({ item }) => {
    const subtotal = item.finalPrice ?? item.price * item.quantity;
    const isLoading = updating === item.barcode;

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <TouchableOpacity onPress={() => deleteItem(item.barcode)} style={styles.deleteButton}>
            <Text style={styles.deleteIcon}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemPrice}>
          ₹{item.price} × {item.quantity}
          {item.offerQuantity ? ` (${item.offerQuantity} offer)` : ''}
        </Text>
        {item.discount ? (
          <Text style={styles.discountText}>Discount: ₹{item.discount.toFixed(2)}</Text>
        ) : null}
        <View style={styles.quantityRow}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.barcode, -1)}
              style={[styles.quantityButton, isLoading && styles.quantityButtonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.quantityDisplay}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#0071CE" />
              ) : (
                <Text style={styles.quantityText}>{item.quantity}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => updateQuantity(item.barcode, 1)}
              style={[styles.quantityButton, isLoading && styles.quantityButtonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtotal}>₹{subtotal.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0071CE" />
      <LinearGradient colors={['#0071CE', '#004A9F']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>
            {itemCount ? `${itemCount} item${itemCount > 1 ? 's' : ''}` : 'No items yet'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => Linking.openURL('https://kritika0818.github.io/scan-page/')}
        >
          <Text style={styles.scanIcon}>📱</Text>
          <Text style={styles.scanText}>Scan Barcode</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0071CE" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={cart}
            keyExtractor={(item) => item.barcode}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 40 }}>🛒 Your cart is empty</Text>
            }
          />
        )}
      </View>

      {!!cart.length && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({itemCount} items)</Text>
              <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
            </View>
            <Text style={styles.taxNote}>Inclusive of all taxes</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Payment', { cart })}
          >
            <Text style={styles.checkoutText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// 📌 Keep using your existing styles from above (unchanged)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  discountText: {
    color: '#27ae60',
    fontSize: 13,
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 10,
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
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#0071CE',
  },
  scanIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  scanText: {
    color: '#0071CE',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  cartItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
    borderWidth: 1,
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteIcon: {
    fontSize: 18,
    color: '#e53e3e',
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    backgroundColor: '#0071CE',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  quantityButtonDisabled: {
    backgroundColor: '#cbd5e0',
  },
  quantityButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  subtotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  totalContainer: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  taxNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#0071CE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0071CE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

