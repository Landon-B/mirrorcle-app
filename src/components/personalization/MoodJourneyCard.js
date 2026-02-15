import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common';
import { sessionService } from '../../services/session';
import { useApp } from '../../context/AppContext';
import { getFeelingColor } from '../../constants/feelings';

export const MoodJourneyCard = () => {
  const { user } = useApp();
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    if (user?.id) loadMoods();
  }, [user?.id]);

  const loadMoods = async () => {
    try {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const history = await sessionService.getMoodHistory({
        limit: 30,
        since: twoWeeksAgo,
      });
      setMoods(history);
    } catch (error) {
      console.log('Error loading mood history:', error);
    }
  };

  if (moods.length < 2) return null;

  const firstFeeling = moods[moods.length - 1]?.feeling?.label || 'reflective';
  const lastFeeling = moods[0]?.feeling?.label || 'reflective';
  const narrative = firstFeeling === lastFeeling
    ? `Your recent sessions have centered around feeling ${firstFeeling}.`
    : `Started the week feeling ${firstFeeling}, now feeling ${lastFeeling}.`;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="heart" size={18} color="#F472B6" />
        <Text style={styles.title}>Your Mood Journey</Text>
      </View>

      <View style={styles.timeline}>
        {moods.slice().reverse().slice(-14).map((mood, index) => {
          const feelingId = mood.feeling?.id || '';
          const color = getFeelingColor(feelingId);
          return (
            <View key={mood.id || index} style={styles.dotWrap}>
              <View style={[styles.dot, { backgroundColor: color }]} />
            </View>
          );
        })}
      </View>

      <Text style={styles.narrative}>{narrative}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  dotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  narrative: {
    color: '#CBD5F5',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
