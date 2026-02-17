import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GhostButton } from './GhostButton';
import { useColors } from '../../hooks/useColors';

const ErrorFallback = ({ errorMessage, onReset }) => {
  const c = useColors();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.textPrimary }]}>Something went wrong</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        {errorMessage || 'The app encountered an unexpected error. Please try again.'}
      </Text>
      <GhostButton title="Try Again" onPress={onReset} />
    </View>
  );
};

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
        <ErrorFallback
          errorMessage={this.state.errorMessage}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
