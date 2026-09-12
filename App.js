import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />
      <WebView 
        source={{ uri: backendUrl }} 
        style={styles.webview}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  webview: {
    flex: 1,
  },
});

