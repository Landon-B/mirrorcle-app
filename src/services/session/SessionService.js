import { supabase } from '../../config/supabase';
import { userProfileService } from '../user/UserProfileService';

/**
 * Service for recording and retrieving session data, mood history,
 * and affirmation engagement history.
 */
class SessionService {
  /**
   * Create a new session record
   * @param {Object} sessionData
   * @param {string} sessionData.feelingId - Mood at session start
   * @param {number} sessionData.durationSeconds - Session length
   * @param {number} sessionData.promptsCompleted - Number of prompts spoken
   * @returns {Promise<Object>}
   */
  async createSession({ feelingId, durationSeconds = 0, promptsCompleted = 0, timeOfDay = null, focusAreaId = null, moodIntensity = null }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Ensure profile exists (handles missing trigger case)
    try {
      await userProfileService.ensureProfile();
    } catch (profileError) {
      console.error('Error ensuring profile exists:', profileError);
      throw profileError;
    }

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        feeling_id: feelingId,
        duration_seconds: durationSeconds,
        prompts_completed: promptsCompleted,
        time_of_day: timeOfDay,
        focus_area_id: focusAreaId,
        mood_intensity: moodIntensity,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Record mood history (non-blocking — session is already saved)
    if (feelingId) {
      try {
        await this.recordMood(feelingId, session.id, moodIntensity, 'pre');
      } catch (moodError) {
        console.error('Error recording mood for session:', moodError);
      }
    }

    // Update user profile stats (non-blocking — session is already saved)
    try {
      await this._updateProfileStats(durationSeconds);
    } catch (statsError) {
      console.error('Error updating profile stats:', statsError);
    }

    return this._transformSession(session);
  }

  /**
   * Update an existing session
   * @param {string} sessionId - Session UUID
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateSession(sessionId, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dbUpdates = {};
    if (updates.durationSeconds !== undefined) dbUpdates.duration_seconds = updates.durationSeconds;
    if (updates.promptsCompleted !== undefined) dbUpdates.prompts_completed = updates.promptsCompleted;

    const { data, error } = await supabase
      .from('user_sessions')
      .update(dbUpdates)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return this._transformSession(data);
  }

  /**
   * Get user's session history
   * @param {Object} options
   * @param {number} options.limit - Max sessions to return
   * @param {Date} options.since - Only sessions after this date
   * @returns {Promise<Array>}
   */
  async getSessions({ limit = 50, since = null } = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('user_sessions')
      .select(`
        *,
        feelings (
          id,
          label,
          icon,
          gradient_start,
          gradient_end
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (since) {
      query = query.gte('created_at', since.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return data?.map(s => ({
      ...this._transformSession(s),
      feeling: s.feelings ? {
        id: s.feelings.id,
        label: s.feelings.label,
        icon: s.feelings.icon,
        colors: [s.feelings.gradient_start, s.feelings.gradient_end],
      } : null,
    })) || [];
  }

  /**
   * Get sessions for a specific date range (for trends)
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Array>}
   */
  async getSessionsInRange(startDate, endDate) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data?.map(s => this._transformSession(s)) || [];
  }

  /**
   * Record an affirmation view/engagement
   * @param {string} affirmationId - Affirmation UUID
   * @param {boolean} engaged - Whether user spoke it aloud
   * @param {string} sessionId - Optional session UUID
   * @returns {Promise<Object>}
   */
  async recordAffirmationEngagement(affirmationId, engaged = false, sessionId = null, completionTimeSeconds = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_affirmation_history')
      .insert({
        user_id: user.id,
        affirmation_id: affirmationId,
        engaged,
        session_id: sessionId,
        completion_time_seconds: completionTimeSeconds,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Record multiple affirmation engagements (batch)
   * @param {Array} engagements - Array of { affirmationId, engaged }
   * @param {string} sessionId - Optional session UUID
   * @returns {Promise<Array>}
   */
  async recordAffirmationEngagements(engagements, sessionId = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const records = engagements.map(e => ({
      user_id: user.id,
      affirmation_id: e.affirmationId,
      engaged: e.engaged || false,
      session_id: sessionId,
    }));

    const { data, error } = await supabase
      .from('user_affirmation_history')
      .insert(records)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's affirmation engagement history
   * @param {Object} options
   * @param {boolean} options.engagedOnly - Only return engaged (spoken) affirmations
   * @param {number} options.limit - Max records to return
   * @returns {Promise<Array>}
   */
  async getAffirmationHistory({ engagedOnly = false, limit = 100 } = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('user_affirmation_history')
      .select(`
        *,
        affirmations (
          id,
          text,
          gradient_start,
          gradient_end,
          is_prompt,
          is_premium
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (engagedOnly) {
      query = query.eq('engaged', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data?.map(h => ({
      id: h.id,
      engaged: h.engaged,
      sessionId: h.session_id,
      createdAt: h.created_at,
      affirmation: h.affirmations ? {
        id: h.affirmations.id,
        text: h.affirmations.text,
        colors: [h.affirmations.gradient_start, h.affirmations.gradient_end],
        isPrompt: h.affirmations.is_prompt,
        isPremium: h.affirmations.is_premium,
      } : null,
    })) || [];
  }

  /**
   * Record a mood entry
   * @param {string} feelingId - Feeling ID
   * @param {string} sessionId - Optional session UUID
   * @param {number|null} intensity - Mood intensity (1=mild, 2=moderate, 3=strong)
   * @param {string} moodType - 'pre' or 'post'
   * @returns {Promise<Object>}
   */
  async recordMood(feelingId, sessionId = null, intensity = null, moodType = 'pre') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_mood_history')
      .insert({
        user_id: user.id,
        feeling_id: feelingId,
        session_id: sessionId,
        intensity,
        mood_type: moodType,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Record a post-session mood shift
   * Updates the session's post_mood_id and records in mood history.
   * @param {string} sessionId - Session UUID
   * @param {string} postMoodId - Post-session feeling ID
   * @param {number|null} intensity - Mood intensity (1=mild, 2=moderate, 3=strong)
   * @returns {Promise<Object>}
   */
  async recordMoodShift(sessionId, postMoodId, intensity = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Update the session's post-mood columns
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        post_mood_id: postMoodId,
        post_mood_intensity: intensity,
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Also record in mood history for journey/trend tracking
    try {
      await this.recordMood(postMoodId, sessionId, intensity, 'post');
    } catch (moodError) {
      console.error('Error recording post-session mood history:', moodError);
    }

    return this._transformSession(data);
  }

  /**
   * Save a session reflection
   * @param {string} sessionId - Session UUID
   * @param {string} text - Reflection text
   * @returns {Promise<Object>}
   */
  async saveReflection(sessionId, text) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_sessions')
      .update({ reflection_text: text })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return this._transformSession(data);
  }

  /**
   * Get user's mood history
   * @param {Object} options
   * @param {number} options.limit - Max records to return
   * @param {Date} options.since - Only moods after this date
   * @returns {Promise<Array>}
   */
  async getMoodHistory({ limit = 100, since = null } = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('user_mood_history')
      .select(`
        *,
        feelings (
          id,
          label,
          icon,
          gradient_start,
          gradient_end
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (since) {
      query = query.gte('created_at', since.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return data?.map(m => ({
      id: m.id,
      sessionId: m.session_id,
      createdAt: m.created_at,
      feeling: m.feelings ? {
        id: m.feelings.id,
        label: m.feelings.label,
        icon: m.feelings.icon,
        colors: [m.feelings.gradient_start, m.feelings.gradient_end],
      } : null,
    })) || [];
  }

  /**
   * Get mood trends for a date range
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>} - { byFeeling: { feelingId: count }, byDate: [{ date, feelingId }] }
   */
  async getMoodTrends(startDate, endDate) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { byFeeling: {}, byDate: [] };

    const { data, error } = await supabase
      .from('user_mood_history')
      .select('feeling_id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const byFeeling = {};
    const byDate = [];

    for (const mood of data || []) {
      byFeeling[mood.feeling_id] = (byFeeling[mood.feeling_id] || 0) + 1;
      byDate.push({
        date: mood.created_at,
        feelingId: mood.feeling_id,
      });
    }

    return { byFeeling, byDate };
  }

  /**
   * Calculate and update streak
   * @returns {Promise<Object>} - { currentStreak, longestStreak }
   */
  async updateStreak() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get all session dates for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (sessionsError) throw sessionsError;

    if (!sessions || sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique dates (in user's local date format)
    const uniqueDates = [...new Set(
      sessions.map(s => new Date(s.created_at).toISOString().split('T')[0])
    )].sort().reverse();

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if there's a session today or yesterday to start the streak
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;
      let expectedDate = new Date(uniqueDates[0]);

      for (let i = 1; i < uniqueDates.length; i++) {
        expectedDate.setDate(expectedDate.getDate() - 1);
        const expected = expectedDate.toISOString().split('T')[0];

        if (uniqueDates[i] === expected) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.round((prevDate - currDate) / 86400000);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Update profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return { currentStreak, longestStreak };
  }

  /**
   * Update profile stats after completing a session
   * @private
   */
  async _updateProfileStats(durationSeconds) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('total_sessions, total_time_seconds')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Update totals
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        total_sessions: (profile.total_sessions || 0) + 1,
        total_time_seconds: (profile.total_time_seconds || 0) + durationSeconds,
        last_login: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Update streak
    await this.updateStreak();
  }

  _transformSession(row) {
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      feelingId: row.feeling_id,
      postMoodId: row.post_mood_id,
      durationSeconds: row.duration_seconds,
      promptsCompleted: row.prompts_completed,
      timeOfDay: row.time_of_day,
      focusAreaId: row.focus_area_id,
      moodIntensity: row.mood_intensity,
      postMoodIntensity: row.post_mood_intensity,
      reflectionText: row.reflection_text,
      createdAt: row.created_at,
    };
  }
}

export const sessionService = new SessionService();
