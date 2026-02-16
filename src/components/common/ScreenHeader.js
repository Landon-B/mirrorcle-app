import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { textStyles } from '../../styles/typography';

export const ScreenHeader = ({ label, title, subtitle, onBack, rightAction, style }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.left}>
        {onBack && (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color="#7A756E" />
          </Pressable>
        )}
      </View>
      {label && <Text style={[textStyles.labelSmall, styles.label]}>{label}</Text>}
      {title && (
        <View style={styles.titleCenter}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.right}>
        {rightAction || null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  left: {
    width: 42,
    alignItems: 'flex-start',
  },
  right: {
    width: 42,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0ECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    flex: 1,
  },
  titleCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D2A26',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#7A756E',
    textAlign: 'center',
    marginTop: 2,
  },
});
