import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const storedAvatar = await AsyncStorage.getItem('userAvatar');
      if (storedPhone) setPhone(storedPhone);
      if (storedAvatar) setAvatar(storedAvatar);
    };
    loadData();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      await AsyncStorage.setItem('userAvatar', result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    // Remove +91 prefix and format as +91 XXXXX XXXXX
    const cleaned = phoneNumber.replace('+91', '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phoneNumber;
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
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>ExpressScan</Text>
          <Text style={styles.tagline}>Your Profile</Text>
        </View>
      </LinearGradient>

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
              <Text style={styles.title}>My Profile</Text>
              <Text style={styles.subtitle}>
                Manage your account information and preferences
              </Text>

              <View style={styles.avatarSection}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                  <Image
                    source={
                      avatar
                        ? { uri: avatar }
                        : require('../../assets/images/avatar.png') // fallback
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.avatarOverlay}>
                    <Text style={styles.cameraIcon}>📸</Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.changeText}>Tap to change avatar</Text>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>📱 Phone Number</Text>
                  <Text style={styles.infoValue}>{formatPhoneNumber(phone)}</Text>
                </View>
              </View>

              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={styles.historyButton}
                  onPress={() => navigation.navigate('OrderHistory')}
                >
                  <Text style={styles.historyButtonText}>🧾 View Order History</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Account Actions</Text>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}> Logout</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                ExpressScan by Walmart - Making shopping effortless
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  keyboardContainer: { 
    flex: 1 
  },
  scrollContainer: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: 20 
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
  logoContainer: { 
    alignItems: 'center', 
    marginTop: 20 
  },
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
  content: { 
    paddingHorizontal: 20, 
    paddingTop: 30, 
    flex: 1 
  },
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#0071CE',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0071CE',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  cameraIcon: {
    fontSize: 16,
  },
  changeText: {
    fontSize: 14,
    color: '#0071CE',
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0071CE',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: 10,
  },
  historyButton: {
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
  historyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  dangerZone: {
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
  dangerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
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