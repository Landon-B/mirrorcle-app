import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MOODS } from '../constants/feelings';
import { useApp } from '../context/AppContext';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { textStyles, typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

export const MoodCheckInScreen = ({ navigation, route }) => {
  const { mode = 'pre-session', focusArea, ...sessionData } = route.params || {};
  const { user } = useApp();
  const [selectedMood, setSelectedMood] = useState(null);

  const isPost = mode === 'post-session';
  const userName = user?.user_metadata?.name || 'Friend';

  const handleNext = () => {
    if (!selectedMood) return;

    const mood = MOODS.find(m => m.id === selectedMood);

    if (isPost) {
      navigation.navigate('SuccessCelebration', {
        ...sessionData,
        postMood: mood,
      });
    } else {
      navigation.navigate('BreathingPrep', {
        focusArea,
        mood,
      });
    }
  };

  const heading = isPost
    ? 'And how do you\nfeel now?'
    : `${userName}, how are\nyou feeling right now?`;

  const buttonTitle = isPost ? 'Complete Ritual' : 'Next';

  // Progress dots: pre-session = step 2 of 3, post-session = step 1 of 2
  const totalDots = isPost ? 2 : 3;
  const activeDot = isPost ? 0 : 1;

  return (
    <View style={styles.container}>
      <ScreenHeader
        label={isPost ? 'POST-SESSION' : 'MIRRORCLE'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.subtitle}>Select your current mood</Text>

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
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={buttonTitle}
          icon="arrow-forward"
          onPress={handleNext}
          disabled={!selectedMood}
        />

        <View style={styles.dots}>
          {Array.from({ length: totalDots }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeDot && styles.dotActive,
              ]}
            />
          ))}
        </View>
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
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4CFC9',
  },
  dotActive: {
    backgroundColor: '#C17666',
    width: 24,
    borderRadius: 4,
  },
});
