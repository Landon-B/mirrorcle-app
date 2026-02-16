import { supabase } from '../../config/supabase';

/**
 * Service for managing trial experience orchestration.
 * Tracks trial day progress and provides day-specific content.
 */

const TRIAL_DURATION_DAYS = 7;

const TRIAL_DAY_CONTENT = {
  1: {
    title: 'Welcome to Your Practice',
    message: 'Today you begin a journey of self-discovery. Each session is a conversation with yourself.',
    icon: 'sparkles',
    cta: 'Start Your First Session',
  },
  2: {
    title: 'Building Your Foundation',
    message: 'Returning is the hardest part — and you did it. Let today\'s session go a little deeper.',
    icon: 'layers-outline',
    cta: 'Continue Your Practice',
  },
  3: {
    title: 'Your Mood Story',
    message: 'With a few sessions behind you, patterns start to emerge. Premium shows you the full picture.',
    icon: 'pulse-outline',
    cta: 'See Your Mood Patterns',
    feature: 'mood_analytics',
  },
  4: {
    title: 'Finding Your Voice',
    message: 'You\'ve been speaking truths about yourself. Premium lets you write your own.',
    icon: 'create-outline',
    cta: 'Create Custom Affirmations',
    feature: 'custom_affirmations',
  },
  5: {
    title: 'Five Days Strong',
    message: 'Five days of showing up for yourself. That\'s not a habit — it\'s a commitment.',
    icon: 'trophy-outline',
    cta: 'Keep Going',
  },
  6: {
    title: 'Your Transformation',
    message: 'Tomorrow is your last free day. Unlock everything to keep this practice growing.',
    icon: 'heart-outline',
    cta: 'See What\'s Next',
    feature: 'default',
  },
  7: {
    title: 'Your Trial Ends Today',
    message: 'You\'ve spent 7 days learning to see yourself differently. Keep the mirror.',
    icon: 'scan-outline',
    cta: 'Deepen Your Practice',
    feature: 'default',
    isRetention: true,
  },
};

class TrialService {
  /**
   * Start a new trial for the user (called on first session or signup).
   * @returns {Promise<Date>} trial start date
   */
  async startTrial() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('user_profiles')
      .update({ trial_started_at: now })
      .eq('id', user.id)
      .is('trial_started_at', null); // Only set if not already started

    if (error) throw error;
    return new Date(now);
  }

  /**
   * End the trial (user converted or trial expired).
   * @returns {Promise<void>}
   */
  async endTrial() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .update({ trial_ended_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
  }

  /**
   * Get trial status for the current user.
   * @returns {Promise<Object>} { isInTrial, trialDay, daysRemaining, trialStartedAt, trialEndedAt, hasExpired }
   */
  async getTrialStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return this._defaultStatus();

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('trial_started_at, trial_ended_at, is_pro')
      .eq('id', user.id)
      .single();

    if (error || !profile) return this._defaultStatus();

    // Pro users are not in trial
    if (profile.is_pro) {
      return {
        isInTrial: false,
        trialDay: 0,
        daysRemaining: 0,
        trialStartedAt: profile.trial_started_at,
        trialEndedAt: profile.trial_ended_at,
        hasExpired: false,
        isPro: true,
      };
    }

    // No trial started yet
    if (!profile.trial_started_at) {
      return {
        isInTrial: false,
        trialDay: 0,
        daysRemaining: TRIAL_DURATION_DAYS,
        trialStartedAt: null,
        trialEndedAt: null,
        hasExpired: false,
        isPro: false,
      };
    }

    // Trial was explicitly ended
    if (profile.trial_ended_at) {
      return {
        isInTrial: false,
        trialDay: 0,
        daysRemaining: 0,
        trialStartedAt: profile.trial_started_at,
        trialEndedAt: profile.trial_ended_at,
        hasExpired: true,
        isPro: false,
      };
    }

    // Calculate trial day
    const startDate = new Date(profile.trial_started_at);
    const now = new Date();
    const diffMs = now - startDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const trialDay = diffDays + 1; // Day 1 = first day
    const daysRemaining = Math.max(0, TRIAL_DURATION_DAYS - diffDays);
    const hasExpired = trialDay > TRIAL_DURATION_DAYS;

    return {
      isInTrial: !hasExpired,
      trialDay: Math.min(trialDay, TRIAL_DURATION_DAYS),
      daysRemaining,
      trialStartedAt: profile.trial_started_at,
      trialEndedAt: null,
      hasExpired,
      isPro: false,
    };
  }

  /**
   * Get content for the current trial day.
   * @param {number} trialDay
   * @returns {Object|null} { title, message, icon, cta, feature?, isRetention? }
   */
  getTrialDayContent(trialDay) {
    if (trialDay < 1 || trialDay > TRIAL_DURATION_DAYS) return null;
    return TRIAL_DAY_CONTENT[trialDay] || null;
  }

  _defaultStatus() {
    return {
      isInTrial: false,
      trialDay: 0,
      daysRemaining: TRIAL_DURATION_DAYS,
      trialStartedAt: null,
      trialEndedAt: null,
      hasExpired: false,
      isPro: false,
    };
  }
}

export const trialService = new TrialService();
