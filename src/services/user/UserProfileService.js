import { supabase } from '../../config/supabase';

/**
 * Service for managing user profiles, notification settings, and favorites.
 * All data is synced to Supabase for cross-device access.
 */
class UserProfileService {
  /**
   * Get the current user's profile
   * @returns {Promise<Object|null>}
   */
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this._transformProfile(data);
  }

  /**
   * Ensure a profile row exists for the current user.
   * Creates one with defaults if the signup trigger didn't fire.
   * @returns {Promise<void>}
   */
  async ensureProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true });

    if (error) throw error;
  }

  /**
   * Update the current user's profile
   * @param {Object} updates - Profile fields to update
   * @returns {Promise<Object>}
   */
  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.isPro !== undefined) dbUpdates.is_pro = updates.isPro;
    if (updates.themeId !== undefined) dbUpdates.theme_id = updates.themeId;
    if (updates.preferredSessionLength !== undefined) dbUpdates.preferred_session_length = updates.preferredSessionLength;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return this._transformProfile(data);
  }

  /**
   * Update last login timestamp
   * @returns {Promise<void>}
   */
  async updateLastLogin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
  }

  /**
   * Get notification settings
   * @returns {Promise<Object|null>}
   */
  async getNotificationSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this._transformNotificationSettings(data);
  }

  /**
   * Update notification settings
   * @param {Object} settings - Settings to update
   * @returns {Promise<Object>}
   */
  async updateNotificationSettings(settings) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dbUpdates = { user_id: user.id };
    if (settings.enabled !== undefined) dbUpdates.enabled = settings.enabled;
    if (settings.time !== undefined) dbUpdates.time = settings.time;
    if (settings.timezone !== undefined) dbUpdates.timezone = settings.timezone;

    const { data, error } = await supabase
      .from('user_notification_settings')
      .upsert(dbUpdates, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return this._transformNotificationSettings(data);
  }

  /**
   * Get user's favorite affirmations
   * @returns {Promise<Array>}
   */
  async getFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        created_at,
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
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(fav => ({
      favoriteId: fav.id,
      favoritedAt: fav.created_at,
      ...this._transformAffirmation(fav.affirmations),
    })) || [];
  }

  /**
   * Check if an affirmation is favorited
   * @param {string} affirmationId - Affirmation UUID
   * @returns {Promise<boolean>}
   */
  async isFavorite(affirmationId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('affirmation_id', affirmationId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  /**
   * Add an affirmation to favorites
   * @param {string} affirmationId - Affirmation UUID
   * @returns {Promise<Object>}
   */
  async addFavorite(affirmationId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        affirmation_id: affirmationId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Already favorited, return existing
        const existing = await this.getFavoriteByAffirmationId(affirmationId);
        return existing;
      }
      throw error;
    }
    return data;
  }

  /**
   * Remove an affirmation from favorites
   * @param {string} affirmationId - Affirmation UUID
   * @returns {Promise<void>}
   */
  async removeFavorite(affirmationId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('affirmation_id', affirmationId);

    if (error) throw error;
  }

  /**
   * Toggle favorite status
   * @param {string} affirmationId - Affirmation UUID
   * @returns {Promise<boolean>} - New favorite status
   */
  async toggleFavorite(affirmationId) {
    const isFav = await this.isFavorite(affirmationId);
    if (isFav) {
      await this.removeFavorite(affirmationId);
      return false;
    } else {
      await this.addFavorite(affirmationId);
      return true;
    }
  }

  /**
   * Get favorite by affirmation ID
   * @param {string} affirmationId - Affirmation UUID
   * @returns {Promise<Object|null>}
   */
  async getFavoriteByAffirmationId(affirmationId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('affirmation_id', affirmationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Get user stats summary
   * @returns {Promise<Object>}
   */
  async getStats() {
    const profile = await this.getProfile();
    if (!profile) {
      return {
        totalSessions: 0,
        totalTimeSeconds: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    return {
      totalSessions: profile.totalSessions,
      totalTimeSeconds: profile.totalTimeSeconds,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
    };
  }

  // Transform database format to app format
  _transformProfile(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      isPro: row.is_pro,
      themeId: row.theme_id,
      lastLogin: row.last_login,
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      totalSessions: row.total_sessions,
      totalTimeSeconds: row.total_time_seconds,
      preferredSessionLength: row.preferred_session_length || 3,
      experienceLevel: row.experience_level || 0,
      avgSpeechSpeedWpm: row.avg_speech_speed_wpm,
      trialStartedAt: row.trial_started_at,
      trialEndedAt: row.trial_ended_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  _transformNotificationSettings(row) {
    if (!row) return null;
    return {
      userId: row.user_id,
      enabled: row.enabled,
      time: row.time,
      timezone: row.timezone,
      updatedAt: row.updated_at,
    };
  }

  _transformAffirmation(row) {
    if (!row) return null;
    return {
      id: row.id,
      text: row.text,
      colors: [row.gradient_start, row.gradient_end],
      isPrompt: row.is_prompt,
      isPremium: row.is_premium,
    };
  }
}

export const userProfileService = new UserProfileService();
