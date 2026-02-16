import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';

export const AffirmationHighlightText = ({
  tokens = [],
  activeToken = 0,
  style,
  wordStyle,
  spokenStyle,
  currentStyle,
  pendingStyle,
  showQuotes = false,
}) => {
  if (!tokens.length) return null;

  return (
    <Text style={[styles.base, style]}>
      {tokens.map((token, index) => {
        let stateStyle = styles.pending;
        if (index < activeToken) stateStyle = styles.spoken;
        if (index === activeToken) stateStyle = styles.current;

        return (
          <Text
            key={`${token}-${index}`}
            style={[styles.word, stateStyle, wordStyle, index < activeToken && spokenStyle, index === activeToken && currentStyle, index > activeToken && pendingStyle]}
          >
            {token}{index < tokens.length - 1 ? ' ' : ''}
          </Text>
        );
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif',
    fontStyle: 'italic',
    fontSize: 26,
    lineHeight: 38,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.3,
  },
  word: { color: 'rgba(255, 255, 255, 0.5)' },
  spoken: { color: 'rgba(255, 255, 255, 0.95)', fontWeight: '400' },
  current: { color: '#FFFFFF', fontWeight: '500' },
  pending: { color: 'rgba(255, 255, 255, 0.35)' },
});
