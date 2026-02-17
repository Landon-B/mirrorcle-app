import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './PrimaryButton';
import { useColors } from '../../hooks/useColors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const OverlaySheet = ({ visible, title, subtitle, items, onClose }) => {
  const c = useColors();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlayBackdrop, { backgroundColor: c.overlay }]}>
        <Pressable style={styles.overlayBackdropPress} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close overlay" />
        <View style={[styles.overlaySheet, { backgroundColor: c.surface }]}>
          <View style={[styles.overlayHeader, { borderBottomColor: c.border }]}>
            <View>
              <Text style={[styles.overlayTitle, { color: c.textPrimary }]}>{title}</Text>
              <Text style={[styles.overlaySubtitle, { color: c.textSecondary }]}>{subtitle}</Text>
            </View>
            <Pressable onPress={onClose} style={[styles.overlayCloseButton, { backgroundColor: c.surfaceTertiary }]} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={20} color={c.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={styles.overlayContent}>
            {items.map((item) => (
              <Pressable key={item.label} onPress={item.onPress} style={[styles.overlayItem, { backgroundColor: c.surfaceSecondary, borderColor: c.border }]} accessibilityRole="button" accessibilityLabel={item.label}>
                <View style={[styles.overlayIconWrap, { backgroundColor: item.bgColor || c.accentPeach }]}>
                  <Ionicons name={item.icon} size={20} color={c.accentRust} />
                </View>
                <View style={styles.overlayTextWrap}>
                  <Text style={[styles.overlayItemTitle, { color: c.textPrimary }]}>{item.label}</Text>
                  <Text style={[styles.overlayItemSubtitle, { color: c.textSecondary }]}>{item.subtitle}</Text>
                </View>
                {item.rightIcon && (
                  <Ionicons name={item.rightIcon} size={20} color={c.textMuted} />
                )}
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.overlayFooter}>
            <PrimaryButton title="Close" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayBackdrop: { flex: 1, justifyContent: 'flex-end' },
  overlayBackdropPress: { flex: 1 },
  overlaySheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  overlayTitle: { fontSize: 22, fontWeight: '600' },
  overlaySubtitle: { marginTop: 4 },
  overlayCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: { padding: 20, gap: 14 },
  overlayItem: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
  },
  overlayIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTextWrap: { flex: 1 },
  overlayItemTitle: { fontSize: 16, fontWeight: '600' },
  overlayItemSubtitle: { marginTop: 4, fontSize: 12 },
  overlayFooter: { padding: 20 },
});
