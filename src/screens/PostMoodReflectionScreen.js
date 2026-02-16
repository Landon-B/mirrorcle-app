import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MOODS } from '../constants/feelings';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

export const PostMoodReflectionScreen = ({ navigation, route }) => {
  const {
    completedPrompts = 0,
    duration = 0,
    feeling,
    preMood,
  } = route.params || {};

  const [selectedMood, setSelectedMood] = useState(null);
  const [reflection, setReflection] = useState('');

  const handleContinue = () => {
    const postMood = MOODS.find(m => m.id === selectedMood);
    navigation.navigate('SuccessCelebration', {
      completedPrompts,
      duration,
      feeling,
      preMood,
      postMood,
      reflection: reflection.trim() || null,
    });
  };

  const handleSkip = () => {
    navigation.navigate('SuccessCelebration', {
      completedPrompts,
      duration,
      feeling,
      preMood,
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader label="REFLECTION" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>And how do you{'\n'}feel now?</Text>
        <Text style={styles.subtitle}>Notice any shifts after your practice</Text>

        <View style={styles.grid}>
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <Pressable
                key={mood.id}
                onPress={() => setSelectedMood(mood.id)}
                accessibilityRole="button"
                accessibilityLabel={`${mood.label} mood`}
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.moodCard,
                  isSelected && styles.moodCardSelected,
                  pressed && styles.cardPressed,
                ]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  isSelected && styles.moodLabelSelected,
                ]}>
                  {mood.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Optional reflection note */}
        <View style={styles.reflectionSection}>
          <Text style={styles.reflectionLabel}>JOURNAL NOTE (OPTIONAL)</Text>
          <View style={styles.reflectionInputWrapper}>
            <TextInput
              style={styles.reflectionInput}
              placeholder="What came up for you during your session?"
              placeholderTextColor="#B0AAA2"
              multiline
              maxLength={500}
              value={reflection}
              onChangeText={setReflection}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Complete Ritual"
          icon="sparkles"
          onPress={handleContinue}
          disabled={!selectedMood}
        />

        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>SKIP FOR NOW</Text>
        </Pressable>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A756E',
    marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  moodCard: {
    width: '47.5%',
    backgroundColor: '#EDE4DC',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodCardSelected: {
    borderColor: '#C17666',
    backgroundColor: '#F5EDE8',
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  moodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2A26',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#C17666',
  },
  reflectionSection: {
    marginTop: 28,
  },
  reflectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#B0AAA2',
    marginBottom: 10,
  },
  reflectionInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    ...shadows.card,
  },
  reflectionInput: {
    minHeight: 100,
    padding: 16,
    fontSize: 15,
    color: '#2D2A26',
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: 'center',
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#C17666',
  },
});
