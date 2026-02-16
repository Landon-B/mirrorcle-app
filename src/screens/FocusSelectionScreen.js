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
import { ScreenHeader, PrimaryButton } from '../components/common';
import { textStyles, typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

export const FocusSelectionScreen = ({ navigation }) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [customFocus, setCustomFocus] = useState('');

  const handleContinue = () => {
    if (!selectedArea && !customFocus.trim()) return;

    const focusArea = selectedArea
      ? FOCUS_AREAS.find(f => f.id === selectedArea)
      : { id: 'custom', label: customFocus.trim(), emoji: '\u2728', tagName: null };

    navigation.navigate('MoodCheckIn', {
      mode: 'pre-session',
      focusArea,
    });
  };

  const handleSelectArea = (id) => {
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

  const isValid = selectedArea || customFocus.trim().length > 0;

  return (
    <View style={styles.container}>
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
        <Text style={styles.heading}>
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
                  isSelected && styles.focusCardSelected,
                  pressed && styles.cardPressed,
                ]}
              >
                <Text style={styles.focusEmoji}>{area.emoji}</Text>
                <Text style={[
                  styles.focusLabel,
                  isSelected && styles.focusLabelSelected,
                ]}>
                  {area.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#B0AAA2"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Or type your own focus..."
            placeholderTextColor="#B0AAA2"
            value={customFocus}
            onChangeText={handleCustomFocusChange}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          icon="arrow-forward"
          onPress={handleContinue}
          disabled={!isValid}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EE',
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
    color: '#2D2A26',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  focusCardSelected: {
    borderColor: '#C17666',
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
    color: '#2D2A26',
    textAlign: 'center',
  },
  focusLabelSelected: {
    color: '#C17666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    color: '#2D2A26',
    paddingVertical: 16,
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
});
