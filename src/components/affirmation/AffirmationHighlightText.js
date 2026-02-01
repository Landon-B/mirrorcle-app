import React from 'react';
import { Text, StyleSheet } from 'react-native';

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
      {showQuotes ? '"' : ''}
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
      {showQuotes ? '"' : ''}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 30,
    color: '#E2E8F0',
  },
  word: { color: '#E2E8F0' },
  spoken: { color: '#34D399' },
  current: { color: '#C084FC', fontWeight: '700' },
  pending: { color: '#E2E8F0' },
});
