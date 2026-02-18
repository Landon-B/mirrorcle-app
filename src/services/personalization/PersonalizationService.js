import { supabase } from '../../config/supabase';
import { getMoodLabel, getMoodById, QUADRANTS } from '../../constants/feelings';

const MILESTONE_DEFINITIONS = {
  first_session: { title: 'First Steps', description: 'Completed your first mirror session' },
  ten_sessions: { title: 'Building Momentum', description: 'Completed 10 mirror sessions' },
  fifty_sessions: { title: 'Dedicated Practitioner', description: 'Completed 50 mirror sessions' },
  hundred_affirmations: { title: 'Voice of Power', description: 'Spoken 100 affirmations aloud' },
  seven_day_streak: { title: 'Week Warrior', description: 'Maintained a 7-day streak' },
  thirty_day_streak: { title: 'Mirror Master', description: 'Maintained a 30-day streak' },
  first_favorite: { title: 'Found a Favorite', description: 'Saved your first affirmation' },
  all_feelings_explored: { title: 'Full Spectrum', description: 'Explored all four emotional quadrants' },
  custom_affirmation_created: { title: 'Your Words', description: 'Created a custom affirmation' },
};

class PersonalizationService {
  /**
   * Get resonance scores based on engagement history
   * Returns Map<affirmationId, 0-1 score>
   */
  async getResonanceScores(userId) {
    const { data: history, error } = await supabase
      .from('user_affirmation_history')
      .select('affirmation_id, engaged')
      .eq('user_id', userId);

    if (error) throw error;

    const { data: favorites } = await supabase
      .from('user_favorites')
      .select('affirmation_id')
      .eq('user_id', userId);

    const favoriteSet = new Set(favorites?.map(f => f.affirmation_id) || []);
    const engagementCounts = new Map();

    for (const h of history || []) {
      const count = engagementCounts.get(h.affirmation_id) || { total: 0, engaged: 0 };
      count.total++;
      if (h.engaged) count.engaged++;
      engagementCounts.set(h.affirmation_id, count);
    }

    const maxEngaged = Math.max(1, ...Array.from(engagementCounts.values()).map(c => c.engaged));
    const scores = new Map();

    for (const [id, counts] of engagementCounts) {
      let score = counts.engaged / maxEngaged * 0.7; // engagement weight
      if (favoriteSet.has(id)) score += 0.3; // favorite boost
      scores.set(id, Math.min(1, score));
    }

    // Add favorite-only scores
    for (const id of favoriteSet) {
      if (!scores.has(id)) {
        scores.set(id, 0.3);
      }
    }

    return scores;
  }

  /**
   * Determine difficulty level based on session count
   * Returns { level, maxLength }
   */
  getDifficultyLevel(totalSessions) {
    if (totalSessions < 10) {
      return { level: 'beginner', maxLength: 60 };
    } else if (totalSessions < 50) {
      return { level: 'intermediate', maxLength: 100 };
    }
    return { level: 'advanced', maxLength: Infinity };
  }

  /**
   * Get time of day category
   */
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour <= 11) return 'morning';
    if (hour >= 12 && hour <= 16) return 'afternoon';
    if (hour >= 17 && hour <= 20) return 'evening';
    return 'night';
  }

  /**
   * Get streak-aware encouragement message
   */
  getStreakEncouragement(streak, totalSessions) {
    if (totalSessions === 0) {
      return "Welcome to your first mirror session";
    }
    if (streak === 0) {
      return "Life happens. What matters is you came back";
    }
    if (streak === 1) {
      return "A new day, a new beginning. You showed up";
    }
    if (streak < 7) {
      return `${streak} days flowing. You're building a rhythm`;
    }
    if (streak < 14) {
      return `${streak} days of steady practice. This is becoming yours`;
    }
    if (streak < 30) {
      return `${streak} days of presence. Your dedication inspires`;
    }
    return `${streak} days. Self-reflection is woven into who you are`;
  }

  /**
   * Check for newly achieved milestones
   */
  async checkMilestones(userId) {
    const [profile, history, favorites, sessions, customAffirmations, feelings, existingMilestones] = await Promise.all([
      supabase.from('user_profiles').select('total_sessions, current_streak').eq('id', userId).single(),
      supabase.from('user_affirmation_history').select('id').eq('user_id', userId).eq('engaged', true),
      supabase.from('user_favorites').select('id').eq('user_id', userId),
      supabase.from('user_sessions').select('feeling_id').eq('user_id', userId),
      supabase.from('user_custom_affirmations').select('id').eq('user_id', userId),
      supabase.from('feelings').select('id'),
      supabase.from('user_milestones').select('milestone_key').eq('user_id', userId),
    ]);

    const existingKeys = new Set(existingMilestones.data?.map(m => m.milestone_key) || []);
    const newMilestones = [];

    const totalSessions = profile.data?.total_sessions || 0;
    const streak = profile.data?.current_streak || 0;
    const engagedCount = history.data?.length || 0;
    const favoritesCount = favorites.data?.length || 0;
    const customCount = customAffirmations.data?.length || 0;
    const uniqueFeelings = new Set(sessions.data?.map(s => s.feeling_id).filter(Boolean) || []);
    // Count unique quadrants explored (using client-side mood data)
    const exploredQuadrants = new Set();
    for (const feelingId of uniqueFeelings) {
      const mood = getMoodById(feelingId);
      if (mood?.quadrant) exploredQuadrants.add(mood.quadrant);
    }
    const totalQuadrants = QUADRANTS.length; // 4

    const checks = [
      { key: 'first_session', condition: totalSessions >= 1 },
      { key: 'ten_sessions', condition: totalSessions >= 10 },
      { key: 'fifty_sessions', condition: totalSessions >= 50 },
      { key: 'hundred_affirmations', condition: engagedCount >= 100 },
      { key: 'seven_day_streak', condition: streak >= 7 },
      { key: 'thirty_day_streak', condition: streak >= 30 },
      { key: 'first_favorite', condition: favoritesCount >= 1 },
      { key: 'all_feelings_explored', condition: exploredQuadrants.size >= totalQuadrants },
      { key: 'custom_affirmation_created', condition: customCount >= 1 },
    ];

    const qualified = checks.filter(({ key, condition }) => condition && !existingKeys.has(key));

    if (qualified.length > 0) {
      const { error } = await supabase
        .from('user_milestones')
        .insert(qualified.map(({ key }) => ({ user_id: userId, milestone_key: key })));

      if (!error) {
        for (const { key } of qualified) {
          newMilestones.push({ key, ...MILESTONE_DEFINITIONS[key] });
        }
      }
    }

    return newMilestones;
  }

  /**
   * Get undismissed milestones
   */
  async getUndismissedMilestones(userId) {
    const { data, error } = await supabase
      .from('user_milestones')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('achieved_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(m => ({
      id: m.id,
      key: m.milestone_key,
      achievedAt: m.achieved_at,
      ...MILESTONE_DEFINITIONS[m.milestone_key],
    }));
  }

  /**
   * Dismiss a milestone
   */
  async dismissMilestone(userId, milestoneKey) {
    const { error } = await supabase
      .from('user_milestones')
      .update({ dismissed: true })
      .eq('user_id', userId)
      .eq('milestone_key', milestoneKey);

    if (error) throw error;
  }

  /**
   * Get the top 3 unachieved milestones closest to completion.
   * Returns array of { key, title, current, target, percentage }
   */
  async getNextMilestones(userId) {
    const [profileRes, historyRes, favoritesRes, sessionsRes, customRes, feelingsRes, existingRes] = await Promise.all([
      supabase.from('user_profiles').select('total_sessions, current_streak').eq('id', userId).single(),
      supabase.from('user_affirmation_history').select('id').eq('user_id', userId).eq('engaged', true),
      supabase.from('user_favorites').select('id').eq('user_id', userId),
      supabase.from('user_sessions').select('feeling_id').eq('user_id', userId),
      supabase.from('user_custom_affirmations').select('id').eq('user_id', userId),
      supabase.from('feelings').select('id'),
      supabase.from('user_milestones').select('milestone_key').eq('user_id', userId),
    ]);

    const existingKeys = new Set(existingRes.data?.map(m => m.milestone_key) || []);
    const totalSessions = profileRes.data?.total_sessions || 0;
    const streak = profileRes.data?.current_streak || 0;
    const engagedCount = historyRes.data?.length || 0;
    const favoritesCount = favoritesRes.data?.length || 0;
    const customCount = customRes.data?.length || 0;
    const uniqueFeelings = new Set(sessionsRes.data?.map(s => s.feeling_id).filter(Boolean) || []);
    const exploredQuadrants = new Set();
    for (const feelingId of uniqueFeelings) {
      const mood = getMoodById(feelingId);
      if (mood?.quadrant) exploredQuadrants.add(mood.quadrant);
    }
    const totalQuadrants = QUADRANTS.length;

    const milestones = [
      { key: 'first_session', title: 'First Session', current: totalSessions, target: 1 },
      { key: 'ten_sessions', title: 'Building Momentum', current: totalSessions, target: 10 },
      { key: 'fifty_sessions', title: 'Dedicated Practitioner', current: totalSessions, target: 50 },
      { key: 'hundred_affirmations', title: 'Words of Power', current: engagedCount, target: 100 },
      { key: 'seven_day_streak', title: 'One Week Flow', current: streak, target: 7 },
      { key: 'thirty_day_streak', title: 'Monthly Rhythm', current: streak, target: 30 },
      { key: 'first_favorite', title: 'Found Your Words', current: favoritesCount, target: 1 },
      { key: 'all_feelings_explored', title: 'Emotional Explorer', current: exploredQuadrants.size, target: totalQuadrants },
      { key: 'custom_affirmation_created', title: 'Your Own Words', current: customCount, target: 1 },
    ];

    return milestones
      .filter(m => !existingKeys.has(m.key))
      .map(m => ({
        ...m,
        percentage: Math.min(100, Math.round((m.current / m.target) * 100)),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }

  /**
   * Get the user's most-spoken/most-favorited affirmation
   */
  async getPowerPhrase(userId) {
    const { data, error } = await supabase
      .from('user_affirmation_history')
      .select(`
        affirmation_id,
        affirmations (id, text, gradient_start, gradient_end)
      `)
      .eq('user_id', userId)
      .eq('engaged', true);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Count engagements per affirmation
    const counts = new Map();
    for (const h of data) {
      const id = h.affirmation_id;
      counts.set(id, {
        count: (counts.get(id)?.count || 0) + 1,
        affirmation: h.affirmations,
      });
    }

    // Find the most-spoken
    let best = null;
    let bestCount = 0;
    for (const [, val] of counts) {
      if (val.count > bestCount && val.affirmation) {
        bestCount = val.count;
        best = val;
      }
    }

    if (!best || bestCount < 2) return null; // Only show if spoken at least twice

    return {
      text: best.affirmation.text,
      count: best.count,
      colors: [best.affirmation.gradient_start, best.affirmation.gradient_end],
    };
  }

  /**
   * Analyze mood patterns and return a contextual nudge
   */
  async getGrowthNudge(userId) {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: moods, error } = await supabase
      .from('user_mood_history')
      .select('feeling_id, created_at')
      .eq('user_id', userId)
      .gte('created_at', fourteenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!moods || moods.length < 3) return null;

    // Check feeling diversity
    const feelingCounts = {};
    for (const m of moods) {
      feelingCounts[m.feeling_id] = (feelingCounts[m.feeling_id] || 0) + 1;
    }
    const totalMoods = moods.length;
    const sortedFeelings = Object.entries(feelingCounts).sort((a, b) => b[1] - a[1]);

    // Feeling diversity nudge: >80% same feeling
    if (sortedFeelings[0] && sortedFeelings[0][1] / totalMoods > 0.8) {
      return {
        type: 'feeling_diversity',
        message: `You've been drawn to the same feeling lately. Consider exploring something new — growth often hides in unfamiliar places.`,
      };
    }

    // New feeling celebration
    const recentFeeling = moods[moods.length - 1].feeling_id;
    const olderMoods = moods.slice(0, -1);
    const isNewFeeling = !olderMoods.some(m => m.feeling_id === recentFeeling);
    if (isNewFeeling && moods.length > 3) {
      return {
        type: 'new_feeling',
        message: `First time choosing "${getMoodLabel(recentFeeling)}" \u2014 it takes courage to sit with something new.`,
      };
    }

    // Consistency acknowledgment (5+ sessions in 14 days)
    if (moods.length >= 5) {
      return {
        type: 'consistency',
        message: `${moods.length} sessions in two weeks. Regular practice leads to real transformation.`,
      };
    }

    return null;
  }

  /**
   * Compare current session to user's average
   */
  async getSessionComparison(userId, duration) {
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('duration_seconds, prompts_completed')
      .eq('user_id', userId);

    if (error) throw error;
    if (!sessions || sessions.length < 2) return null;

    const avgDuration = sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / sessions.length;
    const avgPrompts = sessions.reduce((sum, s) => sum + s.prompts_completed, 0) / sessions.length;

    return {
      avgDuration: Math.round(avgDuration),
      avgPrompts: Math.round(avgPrompts * 10) / 10,
      currentDuration: duration,
      durationDiff: Math.round(duration - avgDuration),
    };
  }

  /**
   * Update voice pacing with exponential moving average
   */
  async updateVoicePacing(userId, wordCount, seconds) {
    if (wordCount <= 0 || seconds <= 0) return;

    const wpm = (wordCount / seconds) * 60;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('avg_speech_speed_wpm')
      .eq('id', userId)
      .single();

    const currentAvg = profile?.avg_speech_speed_wpm;
    const newAvg = currentAvg ? (0.8 * currentAvg + 0.2 * wpm) : wpm;

    await supabase
      .from('user_profiles')
      .update({ avg_speech_speed_wpm: newAvg })
      .eq('id', userId);

    return newAvg;
  }

  /**
   * Check theme unlocks based on milestones
   */
  async checkThemeUnlocks(userId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('current_streak, total_sessions')
      .eq('id', userId)
      .single();

    if (!profile) return [];

    const unlocks = [];
    if (profile.current_streak >= 7) unlocks.push('sunset-glow');
    if (profile.current_streak >= 30) unlocks.push('rose-garden');
    if (profile.total_sessions >= 100) unlocks.push('midnight-blue');

    return unlocks;
  }

  /**
   * Update experience level based on total sessions
   */
  async updateExperienceLevel(userId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_sessions, experience_level')
      .eq('id', userId)
      .single();

    if (!profile) return 0;

    let newLevel = 0;
    if (profile.total_sessions >= 50) newLevel = 2;
    else if (profile.total_sessions >= 10) newLevel = 1;

    if (newLevel !== profile.experience_level) {
      await supabase
        .from('user_profiles')
        .update({ experience_level: newLevel })
        .eq('id', userId);
    }

    return newLevel;
  }
}

export const personalizationService = new PersonalizationService();
export { MILESTONE_DEFINITIONS };
