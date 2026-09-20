/**
 * ErrorBoundary — catches unexpected render crashes and shows a recovery screen
 * instead of a blank/white app. Wrap the app root with it in production.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Keep console visibility for crash reporting during development
    if (__DEV__) console.warn('App crashed:', error);
  }

  reset = () => {
    if (Platform.OS === 'web') window.location.reload();
    else this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={st.container}>
        <Ionicons name="warning" size={36} color="#C9A96E" />
        <Text style={st.title}>Something went wrong</Text>
        <Text style={st.text}>
          The app hit an unexpected error. Reloading usually fixes it.
        </Text>
        <TouchableOpacity style={st.btn} onPress={this.reset} activeOpacity={0.7}>
          <Ionicons name="refresh" size={16} color="#FFF" />
          <Text style={st.btnText}>Reload App</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5', alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 20, fontWeight: '800', color: '#2D2418', marginTop: 16 },
  text: { fontSize: 14, color: '#7A6F63', textAlign: 'center', lineHeight: 20, marginTop: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#5D4E37', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8, marginTop: 24 },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});

export default ErrorBoundary;
