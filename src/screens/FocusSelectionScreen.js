import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FOCUS_AREAS } from '../constants/focusAreas';
import { focusService } from '../services/focus';
import { useFeatureGate } from '../components/pro/FeatureGate';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { textStyles, typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

export const FocusSelectionScreen = ({ navigation }) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [customFocus, setCustomFocus] = useState('');
  const { isPro, checkAccess, PaywallComponent } = useFeatureGate();
  const { selectionTap } = useHaptics();
  const c = useColors();

  const handleContinue = () => {
    if (!selectedArea && !customFocus.trim()) return;

    const focusArea = selectedArea
      ? FOCUS_AREAS.find(f => f.id === selectedArea)
      : { id: 'custom', label: customFocus.trim(), emoji: '\u2728', tagName: null };

    // Persist today's focus (fire-and-forget, only for preset areas)
    if (focusArea.id !== 'custom') {
      focusService.setTodaysFocus(focusArea.id).catch(console.error);
    }

    navigation.navigate('MoodCheckIn', {
      mode: 'pre-session',
      focusArea,
    });
  };

  const handleSelectArea = (id) => {
    selectionTap();
    setSelectedArea(id);
    setCustomFocus('');
    Keyboard.dismiss();
  };

  const handleCustomFocusChange = (text) => {
    setCustomFocus(text);
    if (text.trim()) {
      setSelectedArea(null);
    }
  };

  const handleCustomFocusPress = () => {
    if (!isPro) {
      checkAccess('custom_focus');
    }
  };

  const isValid = selectedArea || (isPro && customFocus.trim().length > 0);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="MIRRORCLE"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: c.textPrimary }]}>
          What shall we{'\n'}strengthen today?
        </Text>

        <View style={styles.grid}>
          {FOCUS_AREAS.map((area) => {
            const isSelected = selectedArea === area.id;
            return (
              <Pressable
                key={area.id}
                onPress={() => handleSelectArea(area.id)}
                accessibilityRole="button"
                accessibilityLabel={`${area.label} focus area`}
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.focusCard,
                  { backgroundColor: c.surface },
                  isSelected && { borderColor: c.accentRust },
                  pressed && styles.cardPressed,
                ]}
              >
                <Text style={styles.focusEmoji}>{area.emoji}</Text>
                <Text style={[
                  styles.focusLabel,
                  { color: c.textPrimary },
                  isSelected && { color: c.accentRust },
                ]}>
                  {area.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleCustomFocusPress}
          style={[styles.searchContainer, { backgroundColor: c.surface }]}
        >
          <Ionicons
            name={isPro ? 'search-outline' : 'lock-closed'}
            size={18}
            color={c.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: c.textPrimary }]}
            placeholder={isPro ? 'Or type your own focus...' : 'Type your own focus (Pro)'}
            placeholderTextColor={c.inputPlaceholder}
            value={customFocus}
            onChangeText={handleCustomFocusChange}
            editable={isPro}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          icon="arrow-forward"
          onPress={handleContinue}
          disabled={!isValid}
        />
      </View>

      <PaywallComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 16,
    marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  focusCard: {
    width: '47.5%',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  focusEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  focusLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 24,
    ...shadows.card,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
});
