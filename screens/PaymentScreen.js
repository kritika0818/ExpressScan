import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [uid, setUid] = useState(null);

  const firestore = getFirestore();

  useEffect(() => {
    const init = async () => {
      const storedPhone = await AsyncStorage.getItem('userPhone');
      if (storedPhone) {
        setUid(storedPhone);
      } else {
        Alert.alert('Not logged in', 'Please login again.');
      }
    };
    init();
  }, []);

  useEffect(() => {
    const cartFromParams = route.params?.cart || [];
    setCart(cartFromParams);
    const calculatedTotal = cartFromParams.reduce((sum, item) => sum + (item.finalPrice ?? item.quantity * item.price), 0);
    setTotal(calculatedTotal);
  }, [route.params]);

  const handlePayViaUPI = async () => {
    const upiId = 'yourupiid@paytm';
    const name = encodeURIComponent('ExpressScan Store');
    const amount = total.toFixed(2);

    const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

    const supported = await Linking.canOpenURL(upiUrl);
    if (supported) {
      Linking.openURL(upiUrl);
      setPaid(true);
    } else {
      Alert.alert('UPI App not found', 'Please install a UPI app like GPay, Paytm, or PhonePe.');
    }
  };

  const confirmPayment = async () => {
    if (!uid) {
      Alert.alert('User not authenticated');
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(firestore, `users/${uid}/orders`), {
        cart,
        total,
        createdAt: new Date().toISOString(),
        status: 'paid',
        method: 'upi',
      });

      for (const item of cart) {
        const itemRef = doc(firestore, `users/${uid}/cart/${item.barcode}`);
        await deleteDoc(itemRef);
      }

      Alert.alert('✅ Order Placed', 'Your payment and order were successful.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ]);
    } catch (e) {
      console.error('Order saving failed:', e);
      Alert.alert('❌ Payment Failed', 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>Qty: {item.quantity} × ₹{item.price}</Text>
        {item.discount && (
          <Text style={styles.discountText}>Offer Applied: -₹{item.discount.toFixed(2)}</Text>
        )}
      </View>
      <View style={styles.itemPriceContainer}>
        <Text style={styles.itemPrice}>₹{(item.finalPrice ?? item.price * item.quantity).toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0071CE" />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>ExpressScan</Text>
          <Text style={styles.tagline}>Payment Summary</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.title}>Order Summary</Text>
              <Text style={styles.subtitle}>
                {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
              </Text>

              <View style={styles.cartContainer}>
                {cart.length > 0 ? (
                  <FlatList
                    data={cart}
                    keyExtractor={(item) => item.barcode}
                    renderItem={renderCartItem}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                  />
                ) : (
                  <View style={styles.emptyCart}>
                    <Text style={styles.emptyCartText}>No items in cart</Text>
                  </View>
                )}
              </View>

              <View style={styles.totalContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
                </View>
              </View>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0071CE" />
                  <Text style={styles.loadingText}>Processing payment...</Text>
                </View>
              )}

              {!loading && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.payButton, cart.length === 0 && styles.disabledButton]}
                    onPress={handlePayViaUPI}
                    disabled={cart.length === 0}
                  >
                    <Text style={styles.payButtonText}>💳 Pay via UPI</Text>
                  </TouchableOpacity>

                  {paid && (
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={confirmPayment}
                    >
                      <Text style={styles.confirmButtonText}>✅ Confirm Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Secure payment powered by UPI. Your transaction is protected.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  keyboardContainer: { flex: 1 },
  scrollContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
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
  logoContainer: { alignItems: 'center', marginTop: 20 },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  content: { paddingHorizontal: 20, paddingTop: 30, flex: 1 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  cartContainer: {
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  discountText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 4,
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0071CE',
  },
  separator: {
    height: 8,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  totalContainer: {
    borderTopWidth: 2,
    borderTopColor: '#e1e8ed',
    paddingTop: 20,
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0071CE',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 30,
  },
  payButton: {
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
  payButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
});