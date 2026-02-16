import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GhostButton } from './GhostButton';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || String(error) };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            {this.state.errorMessage || 'The app encountered an unexpected error. Please try again.'}
          </Text>
          <GhostButton title="Try Again" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    color: '#2D2A26',
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    color: '#7A756E',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
