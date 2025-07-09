// screens/HomeScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [userPhone, setUserPhone] = useState('');
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const getUserData = async () => {
      const phone = await AsyncStorage.getItem('userPhone');
      if (phone) {
        setUserPhone(phone);
      }
    };
    getUserData();
  }, []);

  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const logout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userPhone');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleOnlineShopping = () => {
    Alert.alert(
      'Coming Soon!',
      'Online shopping feature is currently under development. Stay tuned for updates!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0071CE" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{getGreeting()}!</Text>
          <Text style={styles.welcomeText}>Welcome to ExpressScan</Text>
          
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Choose Your Shopping Experience</Text>
          
          <TouchableOpacity
            style={[styles.featureCard, styles.primaryCard]}
            onPress={() => navigation.navigate('HomeTab')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>🛍️</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>In-Store Shopping</Text>
              <Text style={styles.cardDescription}>
                Scan products, compare prices, and enjoy seamless checkout
              </Text>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.featureCard, styles.secondaryCard]}
            onPress={handleOnlineShopping}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>📦</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Online Shopping</Text>
              <Text style={styles.cardDescription}>
                Browse products online and get them delivered to your door
              </Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.badgeText}>Coming Soon</Text>
            </View>
          </TouchableOpacity>
        </View>

       

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#0071CE',
    paddingTop: 20,
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
  },
  greeting: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
    marginTop: 20
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 0,
  },
  userInfo: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0071CE',
  },
  secondaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffa500',
    opacity: 0.7,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardArrow: {
    marginLeft: 16,
  },
  arrowText: {
    fontSize: 24,
    color: '#0071CE',
    fontWeight: 'bold',
  },
  cardBadge: {
    backgroundColor: '#ffa500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 16,
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSpace: {
    height: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  logoutButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 120,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});