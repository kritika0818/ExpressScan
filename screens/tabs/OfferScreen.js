import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

const OFFERS = [
  {
    id: '1',
    type: 'combo',
    title: 'Milk + Cornflakes Combo',
    description: 'Start your day right with this healthy breakfast combo!',
    image: require('../../assets/images/mil-corn.jpg'),
    price: 50,
    oldPrice: 70,
    discount: '29%',
    tag: 'Hot Deal',
    expiryDate: '2025-07-15',
    items: [
      { barcode: '123456789012', name: 'Milk', price: 30, quantity: 1 },
      { barcode: '000111222333', name: 'Cornflakes', price: 40, quantity: 1 },
    ],
  },
  {
    id: '2',
    type: 'discount',
    title: 'Parle-G Biscuits',
    description: "Everyone's favorite biscuit at an amazing price!",
    image: require('../../assets/images/parle-g.jpg'),
    price: 8,
    oldPrice: 10,
    discount: '20%',
    tag: 'New',
    expiryDate: '2025-07-09',
    items: [
      { barcode: '8901058842029', name: 'Parle-G Biscuits', price: 10, quantity: 1 },
    ],
  },
  {
    id: '3',
    type: 'combo',
    title: 'Bread + Jam Combo',
    description: 'Perfect breakfast deal for the whole family!',
    image: require('../../assets/images/jam-bread.jpg'),
    price: 45,
    oldPrice: 65,
    discount: '31%',
    tag: 'Limited Offer',
    expiryDate: '2025-07-18',
    items: [
      { barcode: '987654321098', name: 'Bread', price: 25, quantity: 1 },
      { barcode: '123123123123', name: 'Jam', price: 40, quantity: 1 },
    ],
  },
  {
    id: '4',
    type: 'threshold',
    title: '10% OFF on ₹500+',
    description: 'Save big on orders over ₹500!',
    price: 0,
    oldPrice: null,
    discount: '10%',
    discountPercent: 10,
    tag: 'Spend More, Save More',
    expiryDate: '2025-07-30',
    items: [],
    image: require('../../assets/images/500plus.jpg'),
  }
];

export default function OfferScreen() {
  const firestore = getFirestore();
  const [uid, setUid] = useState(null);
  const [addingIds, setAddingIds] = useState([]);

  useEffect(() => {
    const fetchUid = async () => {
      try {
        const storedPhone = await AsyncStorage.getItem('userPhone');
        if (storedPhone) {
          setUid(storedPhone);
        } else {
          Alert.alert('Not logged in', 'Please login first.');
        }
      } catch (e) {
        console.error('Error fetching userPhone:', e);
      }
    };
    fetchUid();
  }, []);

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const handleAddToCart = async (items, offer) => {
    if (!uid) {
      Alert.alert('Not logged in', 'Please login first.');
      return;
    }

    const today = new Date();
    const expiry = new Date(offer.expiryDate);
    if (expiry < today) {
      Alert.alert('Offer Expired', 'This offer is no longer valid.');
      return;
    }

    if (offer.type === 'threshold') {
      Alert.alert('Auto Applied!', 'This offer will be applied at checkout if your cart total exceeds ₹500.');
      return;
    }

    setAddingIds((prev) => [...prev, offer.id]);

    try {
      const discountRate = offer.oldPrice && offer.oldPrice > offer.price
        ? (offer.oldPrice - offer.price) / offer.oldPrice
        : 0;

      for (const item of items) {
        const itemRef = doc(firestore, `users/${uid}/cart/${item.barcode}`);
        const snap = await getDoc(itemRef);
        const existing = snap.exists() ? snap.data() : {};
        const prevOfferQty = existing.offerQuantity || 0;
        const newOfferQty = prevOfferQty + item.quantity;
        const newTotalQty = (existing.quantity || 0) + item.quantity;

        await setDoc(
          itemRef,
          {
            name: item.name,
            price: item.price,
            quantity: newTotalQty,
            offerQuantity: newOfferQty,
            barcode: item.barcode,
            appliedOfferId: offer.id,
            discountRate: discountRate, 
            comboPrice: offer.type === 'combo' ? offer.price / offer.items.length : undefined, // ✅
          },
          { merge: true }
        );
      }

      showToast(`✅ ${items.length} item(s) added with offer`);
    } catch (err) {
      console.error('Add to cart failed:', err);
      Alert.alert('❌ Error', 'Failed to add items. Try again.');
    } finally {
      setAddingIds((prev) => prev.filter((id) => id !== offer.id));
    }
  };

  const renderOffer = ({ item }) => {
    const isAdding = addingIds.includes(item.id);
    const isCombo = item.type === 'combo';

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
            style={styles.image}
          />
          <View style={[styles.badge, isCombo ? styles.comboBadge : styles.discountBadge]}>
            <Text style={styles.badgeText}>
              {isCombo ? 'COMBO' : `${item.discount} OFF`}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.offerTag}>{item.tag}</Text>
            <Text style={styles.expiryText}>Expires: {item.expiryDate}</Text>
          </View>

          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>
                {item.price ? `₹${item.price}` : 'Special Condition'}
              </Text>
              {item.oldPrice && (
                <Text style={styles.oldPrice}>₹{item.oldPrice}</Text>
              )}
            </View>
            {item.oldPrice && (
              <Text style={styles.savings}>
                Save ₹{item.oldPrice - item.price}
              </Text>
            )}
          </View>

          {item.items.length > 0 && (
            <View style={styles.itemsList}>
              <Text style={styles.itemsLabel}>Includes:</Text>
              {item.items.map((product, index) => (
                <Text key={index} style={styles.itemText}>
                  • {product.quantity}x {product.name}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.addButton, isAdding || item.type === 'threshold' ? styles.addButtonDisabled : null]}
            onPress={() => handleAddToCart(item.items, item)}
            disabled={isAdding || item.type === 'threshold'}
          >
            {isAdding ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.addButtonText}>Adding...</Text>
              </View>
            ) : (
              <Text style={styles.addButtonText}>
                {item.type === 'threshold' ? 'Auto Apply on ₹500+' : 'Apply Offer'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Special Offers</Text>
          <Text style={styles.headerSubtitle}>Great deals just for you!</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={OFFERS.filter((offer) => new Date(offer.expiryDate) >= new Date())}
        keyExtractor={(item) => item.id}
        renderItem={renderOffer}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    paddingTop: StatusBar.currentHeight || 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { alignItems: 'center', marginTop: 10 },
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
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  comboBadge: { backgroundColor: '#e67e22' },
  discountBadge: { backgroundColor: '#27ae60' },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: { padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  offerTag: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  expiryText: {
    fontSize: 12,
    color: '#555',
  },
  priceContainer: { marginBottom: 16 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  oldPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#999',
    marginLeft: 12,
  },
  savings: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  itemsList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  addButton: {
    backgroundColor: '#0071CE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
