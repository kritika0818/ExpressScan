// screens/LoginScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const validatePhoneNumber = (phone) => /^\+91[6-9]\d{9}$/.test(phone);

  const sendOtp = async () => {
    setPhoneError('');
    const fullPhone = '+91' + phoneNumber;

    if (!validatePhoneNumber(fullPhone)) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    const generatedOtp = generateOtp();
    setOtp(generatedOtp);
    setLoading(true);

    try {
      await setDoc(doc(db, 'loginOtps', fullPhone), {
        otp: generatedOtp,
        createdAt: Timestamp.now(),
        used: false,
      });
      setStep(2);
      setCountdown(120);
      setCanResend(false);
      Alert.alert('OTP Sent', `Your login OTP is: ${generatedOtp}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError('');
    const fullPhone = '+91' + phoneNumber;

    if (enteredOtp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'loginOtps', fullPhone);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        Alert.alert('Error', 'OTP not found. Please request again.');
        setStep(1);
        return;
      }

      const { otp: storedOtp, createdAt, used } = docSnap.data();
      const now = Timestamp.now().seconds;
      const created = createdAt.seconds;
      const elapsed = now - created;

      if (used) {
        Alert.alert('Invalid OTP', 'This OTP has already been used.');
        setStep(1);
        return;
      }

      if (elapsed > 120) {
        Alert.alert('Expired OTP', 'Please request a new OTP.');
        setStep(1);
        return;
      }

      if (enteredOtp === storedOtp) {
        await AsyncStorage.setItem('userPhone', fullPhone);
        await updateDoc(docRef, { used: true });
        Alert.alert('Login Success', 'Welcome!');
        navigation.replace('Home');
      } else {
        setOtpError('Invalid OTP. Please check and try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const goBackToPhone = () => {
    setStep(1);
    setEnteredOtp('');
    setOtpError('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0071CE" />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>ExpressScan</Text>
          <Text style={styles.tagline}>by Walmart</Text>
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
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.title}>
                {step === 1 ? 'Welcome Back!' : 'Verify Your Identity'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1
                  ? 'Enter your phone number to continue'
                  : `We sent a 6-digit code to +91${phoneNumber}`}
              </Text>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0071CE" />
                  <Text style={styles.loadingText}>
                    {step === 1 ? 'Sending OTP...' : 'Verifying...'}
                  </Text>
                </View>
              )}

              {!loading && step === 1 && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.phoneInputRow}>
                    <Text style={styles.prefix}>+91</Text>
                    <TextInput
                      placeholder="Enter 10-digit mobile"
                      value={phoneNumber}
                      onChangeText={(text) => {
                        setPhoneNumber(text.replace(/[^0-9]/g, '').slice(0, 10));
                        setPhoneError('');
                      }}
                      keyboardType="number-pad"
                      style={[styles.inputFlex, phoneError ? styles.inputError : null]}
                      maxLength={10}
                      autoFocus
                    />
                  </View>
                  {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                  <TouchableOpacity
                    onPress={sendOtp}
                    style={styles.primaryButton}
                    disabled={loading}
                  >
                    <Text style={styles.primaryButtonText}>Send OTP</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!loading && step === 2 && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Enter OTP</Text>
                  <TextInput
                    placeholder="6-digit code"
                    value={enteredOtp}
                    onChangeText={(text) => {
                      setEnteredOtp(text);
                      setOtpError('');
                    }}
                    keyboardType="number-pad"
                    style={[
                      styles.input,
                      styles.otpInput,
                      otpError ? styles.inputError : null,
                    ]}
                    maxLength={6}
                    autoFocus
                    textAlign="center"
                  />
                  {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

                  <TouchableOpacity
                    onPress={verifyOtp}
                    style={styles.primaryButton}
                    disabled={loading}
                  >
                    <Text style={styles.primaryButtonText}>Verify & Login</Text>
                  </TouchableOpacity>

                  {canResend ? (
                    <TouchableOpacity onPress={sendOtp} style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>Resend OTP</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ textAlign: 'center', marginTop: 12, color: '#555' }}>
                      Resend available in {countdown}s
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={goBackToPhone}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>Change Phone Number</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
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
  inputContainer: { width: '100%' },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 16,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#0071CE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#0071CE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#0071CE',
    fontSize: 16,
    fontWeight: '500',
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
