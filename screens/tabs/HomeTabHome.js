import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { height, width } = Dimensions.get('window');

export default function HomeTabHomeScreen() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#004A9F" />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0071CE', '#004A9F', '#003875']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>ExpressScan</Text>
              <View style={styles.titleAccent} />
            </View>
            <Text style={styles.subtitle}>Your smart in-store self-checkout assistant</Text>
          </View>
        </LinearGradient>

        <View style={styles.webContainer}>
          <View style={styles.webviewWrapper}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>🛒 3D Store Preview</Text>
              <View style={styles.previewSubtitle}>
                <Text style={styles.previewSubtitleText}>Interactive store layout</Text>
              </View>
            </View>
            <WebView
  source={{ uri: `https://kritika0818.github.io/expressscan-store-map/?t=${Date.now()}` }}
  style={styles.webview}
  originWhitelist={['*']}
  javaScriptEnabled
  domStorageEnabled
  startInLoadingState
  showsVerticalScrollIndicator={false}
  showsHorizontalScrollIndicator={false}
  bounces={false}
/>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    // Add shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleAccent: {
    width: 80,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginTop: 6,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e8f4ff',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.5,
    opacity: 0.95,
  },
  webContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  webviewWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    // Add shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    // Add border for definition
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  previewHeader: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewSubtitle: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewSubtitleText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
    minHeight: height * 0.60,
  },
});