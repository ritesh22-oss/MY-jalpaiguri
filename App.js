// App.js - Expo Mobile & Android Bundle Runner
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
  Platform,
  Alert
} from 'react-native';

export default function App() {
  const rawBackendUrl =
    (typeof process !== 'undefined' &&
      (process.env.EXPO_PUBLIC_API_URL ||
        process.env.EXPO_PUBLIC_BACKEND_URL ||
        process.env.VITE_API_URL)) ||
    'http://localhost:3000';

  // In Android emulators, localhost points to the emulator itself; 10.0.2.2 points to host PC
  const backendUrl =
    Platform.OS === 'android' && (rawBackendUrl.includes('localhost') || rawBackendUrl.includes('127.0.0.1'))
      ? rawBackendUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
      : rawBackendUrl;

  const handleOpenApp = () => {
    Linking.openURL(backendUrl).catch(() => {
      Alert.alert('Jalpaiguri Connect', 'Opening app in mobile browser...');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>EXPO ANDROID BUNDLE • ACTIVE</Text>
        </View>

        <Text style={styles.title}>Jalpaiguri Connect</Text>
        <Text style={styles.subtitle}>
          Smart Municipal Directory, Emergency SOS & Local Services for Jalpaiguri
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Android & Backend Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Package ID:</Text>
            <Text style={styles.infoValue}>com.jalpaiguri.connect</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>1.0.0 (v1)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Backend (.env):</Text>
            <Text style={styles.infoValueSmall} numberOfLines={1}>
              {backendUrl}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Target SDK:</Text>
            <Text style={styles.infoValue}>Android 14 (API 34)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build Format:</Text>
            <Text style={styles.infoValue}>APK / AAB Bundle</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleOpenApp}>
          <Text style={styles.buttonText}>Launch Jalpaiguri Connect</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Run in VS Code terminal:
          {'\n'}• npx expo start (Expo Go)
          {'\n'}• npx eas build --platform android (Generate APK)
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  infoValueSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    maxWidth: '65%',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
