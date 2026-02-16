import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { usePersonalization } from './usePersonalization';
import { affirmationService } from '../services/affirmations';
import { focusService } from '../services/focus';
import { getMoodById } from '../constants/feelings';
import { AFFIRMATIONS, FALLBACK_AFFIRMATIONS } from '../constants';

/**
 * Composes emotional context data for the HomeScreen.
 * Pulls from existing services and context to provide mood-aware greetings,
 * personalized daily intentions, resonance content, and evolving CTA text.
 */
export const useEmotionalContext = () => {
  const { stats, sessions, preferences, user, favorites } = useApp();
  const { powerPhrase, streakEncouragement, timeOfDay, isLoaded: personalizationLoaded } = usePersonalization();

  const [dailyIntention, setDailyIntention] = useState(null);
  const [intentionContext, setIntentionContext] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // --- Greeting ---
  const { greeting, greetingName } = useMemo(() => {
    const name = user?.user_metadata?.name || preferences?.name || null;

    // New user
    if (stats.totalSessions < 3) {
      return {
        greeting: stats.totalSessions === 0
          ? "You showed up. That's where every transformation begins."
          : "You've already begun. Keep going.",
        greetingName: name,
      };
    }

    // Returning user — streak broken
    if (stats.currentStreak === 0 && stats.totalSessions > 0) {
      return {
        greeting: 'Life happens. What matters is you came back.',
        greetingName: name,
      };
    }

    // Returning user — has recent session with mood context
    if (sessions && sessions.length > 0) {
      const lastSession = sessions[0]; // sorted DESC by created_at
      const mood = getMoodById(lastSession.feeling);
      if (mood) {
        return {
          greeting: `Last time you arrived ${mood.label.toLowerCase()} and showed up anyway.`,
          greetingName: name,
        };
      }
    }

    // Fallback: use compassionate streak encouragement
    return {
      greeting: streakEncouragement || 'Welcome back.',
      greetingName: name,
    };
  }, [stats, sessions, user, preferences, streakEncouragement]);

  // --- Resonance Content ---
  const resonanceContent = useMemo(() => {
    // Power phrase takes priority (user has spoken it 2+ times)
    if (powerPhrase) {
      return {
        type: 'powerPhrase',
        text: powerPhrase.text,
        count: powerPhrase.count,
        colors: powerPhrase.colors,
        favoritedAt: null,
      };
    }

    // Fall back to most recent favorite
    if (favorites && favorites.length > 0) {
      const recentFav = favorites[0]; // sorted DESC
      if (recentFav?.text) {
        return {
          type: 'recentFavorite',
          text: recentFav.text,
          count: null,
          colors: recentFav.colors || null,
          favoritedAt: recentFav.favoritedAt || recentFav.createdAt || null,
        };
      }
    }

    return null;
  }, [powerPhrase, favorites]);

  // --- CTA Text ---
  const ctaText = useMemo(() => {
    if (stats.totalSessions < 3) return 'Continue Your Journey';
    if (stats.totalSessions <= 30) return "Begin Today's Ritual";
    if (stats.totalSessions <= 100) return 'Your Mirror Awaits';
    return 'Return to Your Practice';
  }, [stats.totalSessions]);

  // --- Daily Intention (async) ---
  useEffect(() => {
    let cancelled = false;
    loadDailyIntention(cancelled);

    return () => { cancelled = true; };
  }, [user?.id, preferences?.isPro, timeOfDay]);

  const loadDailyIntention = async (cancelled) => {
    try {
      // Get today's focus for context
      const focus = await focusService.getTodaysFocus();

      if (user?.id) {
        // Personalized intention via scoring pipeline
        const results = await affirmationService.getPersonalizedForSession(
          null, // no mood filter — score by focus + resonance + time-of-day
          {
            isPro: preferences?.isPro || false,
            userId: user.id,
            count: 1,
            timeOfDay,
            focusAreaId: focus?.id || null,
          }
        );

        if (!cancelled && results && results.length > 0) {
          setDailyIntention({ text: results[0].text, id: results[0].id });
          setIntentionContext(
            focus ? `Based on your focus on ${focus.label}` : `For your ${timeOfDay} practice`
          );
          setIsReady(true);
          return;
        }
      }

      // Fallback: date-seeded affirmation (unauthenticated or error)
      if (!cancelled) {
        const fallbackText = getDateSeededAffirmation();
        setDailyIntention({ text: fallbackText, id: null });
        setIntentionContext(null);
        setIsReady(true);
      }
    } catch (error) {
      // Graceful fallback on any error
      if (!cancelled) {
        const fallbackText = getDateSeededAffirmation();
        setDailyIntention({ text: fallbackText, id: null });
        setIntentionContext(null);
        setIsReady(true);
      }
    }
  };

  return {
    greeting,
    greetingName,
    streakEncouragement,
    resonanceContent,
    dailyIntention,
    intentionContext,
    ctaText,
    isReady: isReady && personalizationLoaded,
  };
};

// --- Helpers ---

function getDateSeededAffirmation() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const allAffirmations = AFFIRMATIONS.length > 0 ? AFFIRMATIONS : [];
  if (allAffirmations.length > 0) {
    return allAffirmations[seed % allAffirmations.length].text;
  }
  return FALLBACK_AFFIRMATIONS[seed % FALLBACK_AFFIRMATIONS.length];
}
