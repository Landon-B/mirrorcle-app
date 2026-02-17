import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { shadows } from '../styles/spacing';
import { useColors } from '../hooks/useColors';

const AGREEMENTS = [
  {
    id: 'terms',
    title: 'Terms of Service',
    summary: 'By using Mirrorcle, you agree to our terms of service governing your use of the app.',
    url: 'https://mirrorcle.app/terms',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    summary: 'We collect minimal data to provide you with a personalized experience. Your camera feed is never recorded.',
    url: 'https://mirrorcle.app/privacy',
  },
];

export const LegalAgreementScreen = ({ navigation, route }) => {
  const { onAccept } = route.params || {};
  const c = useColors();
  const [accepted, setAccepted] = useState({});

  const allAccepted = AGREEMENTS.every(a => accepted[a.id]);

  const toggleAcceptance = (id) => {
    setAccepted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleContinue = () => {
    if (onAccept) {
      onAccept();
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="AGREEMENTS"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: c.textPrimary }]}>Before we begin</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Please review and accept the following to continue
        </Text>

        {AGREEMENTS.map((agreement) => {
          const isChecked = accepted[agreement.id];
          return (
            <Pressable
              key={agreement.id}
              onPress={() => toggleAcceptance(agreement.id)}
              style={[
                styles.agreementCard,
                { backgroundColor: c.surface, borderColor: 'transparent' },
                isChecked && { borderColor: c.accentRust },
              ]}
            >
              <View style={styles.agreementHeader}>
                <View style={[
                  styles.checkbox,
                  { borderColor: c.disabled },
                  isChecked && { backgroundColor: c.accentRust, borderColor: c.accentRust },
                ]}>
                  {isChecked && (
                    <Ionicons name="checkmark" size={14} color={c.textOnPrimary} />
                  )}
                </View>
                <Text style={[styles.agreementTitle, { color: c.textPrimary }]}>{agreement.title}</Text>
              </View>

              <Text style={[styles.agreementSummary, { color: c.textSecondary }]}>{agreement.summary}</Text>

              <Pressable
                onPress={() => Linking.openURL(agreement.url)}
                hitSlop={8}
              >
                <Text style={[styles.readMore, { color: c.accentRust }]}>Read full document</Text>
              </Pressable>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="I Agree & Continue"
          icon="checkmark-circle"
          onPress={handleContinue}
          disabled={!allAccepted}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 28,
  },
  agreementCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    ...shadows.card,
  },
  agreementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreementTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  agreementSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
});
