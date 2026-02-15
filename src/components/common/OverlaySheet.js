import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './PrimaryButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const OverlaySheet = ({ visible, title, subtitle, items, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlayBackdrop}>
      <Pressable style={styles.overlayBackdropPress} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close overlay" />
      <View style={styles.overlaySheet}>
        <View style={styles.overlayHeader}>
          <View>
            <Text style={styles.overlayTitle}>{title}</Text>
            <Text style={styles.overlaySubtitle}>{subtitle}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.overlayCloseButton} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.overlayContent}>
          {items.map((item) => (
            <Pressable key={item.label} onPress={item.onPress} style={styles.overlayItem} accessibilityRole="button" accessibilityLabel={item.label}>
              <LinearGradient colors={item.colors} style={styles.overlayIconWrap}>
                <Ionicons name={item.icon} size={20} color="#fff" />
              </LinearGradient>
              <View style={styles.overlayTextWrap}>
                <Text style={styles.overlayItemTitle}>{item.label}</Text>
                <Text style={styles.overlayItemSubtitle}>{item.subtitle}</Text>
              </View>
              {item.rightIcon && (
                <Ionicons name={item.rightIcon} size={20} color="#94A3B8" />
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

const styles = StyleSheet.create({
  overlayBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  overlayBackdropPress: { flex: 1 },
  overlaySheet: {
    backgroundColor: '#0F172A',
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
    borderBottomColor: 'rgba(71, 85, 105, 0.5)',
  },
  overlayTitle: { color: '#fff', fontSize: 22, fontWeight: '600' },
  overlaySubtitle: { color: '#94A3B8', marginTop: 4 },
  overlayCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: { padding: 20, gap: 14 },
  overlayItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
  },
  overlayIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTextWrap: { flex: 1 },
  overlayItemTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  overlayItemSubtitle: { color: '#94A3B8', marginTop: 4, fontSize: 12 },
  overlayFooter: { padding: 20 },
});
