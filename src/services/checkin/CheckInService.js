import { supabase } from '../../config/supabase';
import { getMoodById, isPositiveMood } from '../../constants/feelings';

/**
 * Smart Check-In Service
 *
 * Decision engine for when to show full vs quick mood check-ins,
 * standalone check-in recording, streak tracking, and emotional
 * baseline computation.
 *
 * Design principle: collect rich data at strategic moments,
 * not every single session. Full check-ins on first-of-day and
 * after breaks; quick quadrant-only for repeat sessions.
 */
class CheckInService {
  // ── Decision Engine ──────────────────────────────────────

  /**
   * Determine which check-in type to show based on context.
   *
   * @param {'session_entry' | 'home_card'} trigger - What triggered the check-in decision
   * @returns {Promise<{ type: 'full' | 'quick' | 'none', reason: string }>}
   */
  async resolveCheckInType(trigger) {
    try {
      const status = await this.getCheckInStatus();

      if (trigger === 'session_entry') {
        return this._resolveSessionEntry(status);
      }

      if (trigger === 'home_card') {
        return this._resolveHomeCard(status);
      }

      return { type: 'none', reason: 'Unknown trigger' };
    } catch (error) {
      console.error('Error resolving check-in type:', error);
      // Default to full on error — better to collect data than skip
      return { type: 'full', reason: 'Fallback (error)' };
    }
  }

  /**
   * Decision tree for session entry.
   * - No full check-in today → full
   * - First session after 2+ day break → full
   * - Otherwise → quick (quadrant only)
   */
  _resolveSessionEntry(status) {
    if (!status.hasFullCheckInToday) {
      return { type: 'full', reason: 'First mood check of the day' };
    }

    if (status.daysSinceLastSession >= 2) {
      return { type: 'full', reason: 'Welcome back — how are you?' };
    }

    return { type: 'quick', reason: 'Quick start — tap how you feel' };
  }

  /**
   * Decision tree for HomeScreen card.
   * - No check-in today → full
   * - After 5pm, no evening check-in, 7+ day streak → full (evening)
   * - Otherwise → none (hide card)
   */
  _resolveHomeCard(status) {
    if (!status.hasCheckedInToday) {
      return { type: 'full', reason: 'How are you feeling right now?' };
    }

    const hour = new Date().getHours();
    if (hour >= 17 && !status.hasEveningCheckIn && status.checkinStreak >= 7) {
      return { type: 'full', reason: 'How did today go?' };
    }

    return { type: 'none', reason: 'Already checked in today' };
  }

  // ── Status ───────────────────────────────────────────────

  /**
   * Get current check-in status for the user.
   * @returns {Promise<Object>}
   */
  async getCheckInStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        hasCheckedInToday: false,
        hasFullCheckInToday: false,
        hasEveningCheckIn: false,
        checkinStreak: 0,
        lastFullCheckinAt: null,
        daysSinceLastSession: 999,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get today's mood history entries (all types)
    const { data: todayMoods } = await supabase
      .from('user_mood_history')
      .select('mood_type, feeling_id, quadrant_id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', todayISO)
      .order('created_at', { ascending: false });

    const moods = todayMoods || [];

    // Has any check-in today (any mood_type with feeling_id — full captures)
    const hasCheckedInToday = moods.length > 0;

    // Has a full check-in today (with specific feeling_id, not just quadrant)
    const hasFullCheckInToday = moods.some(m =>
      m.feeling_id && (m.mood_type === 'pre' || m.mood_type === 'checkin')
    );

    // Has evening check-in today
    const hasEveningCheckIn = moods.some(m => m.mood_type === 'evening');

    // Get profile for streak info + last session date
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('checkin_streak, last_full_checkin_at, last_checkin_date')
      .eq('id', user.id)
      .single();

    // Calculate days since last session
    const { data: lastSession } = await supabase
      .from('user_sessions')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let daysSinceLastSession = 999;
    if (lastSession) {
      const lastDate = new Date(lastSession.created_at);
      daysSinceLastSession = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      hasCheckedInToday,
      hasFullCheckInToday,
      hasEveningCheckIn,
      checkinStreak: profile?.checkin_streak || 0,
      lastFullCheckinAt: profile?.last_full_checkin_at || null,
      daysSinceLastSession,
    };
  }

  // ── Recording ────────────────────────────────────────────

  /**
   * Record a standalone mood check-in (not tied to a session).
   *
   * @param {string|null} feelingId - Specific emotion ID (for full check-ins)
   * @param {string|null} quadrantId - Quadrant ID (for quick check-ins)
   * @param {'checkin' | 'evening'} moodType - Type of check-in
   * @returns {Promise<Object>}
   */
  async recordCheckIn(feelingId = null, quadrantId = null, moodType = 'checkin') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Insert mood history record (session_id = null for standalone)
    const insertData = {
      user_id: user.id,
      feeling_id: feelingId,
      session_id: null,
      intensity: null,
      mood_type: moodType,
      quadrant_id: quadrantId,
    };

    const { data, error } = await supabase
      .from('user_mood_history')
      .insert(insertData)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Update check-in streak + last_full_checkin_at
    await this._updateCheckInProfile(user.id, feelingId ? true : false);

    return data;
  }

  /**
   * Update user profile with check-in tracking data.
   * @private
   */
  async _updateCheckInProfile(userId, isFullCheckIn) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('checkin_streak, longest_checkin_streak, last_checkin_date')
      .eq('id', userId)
      .single();

    if (!profile) return;

    let newStreak = profile.checkin_streak || 0;
    const lastDate = profile.last_checkin_date;

    // Calculate new streak
    if (lastDate === today) {
      // Already checked in today — streak unchanged
    } else if (lastDate === yesterday) {
      // Consecutive day — increment
      newStreak += 1;
    } else {
      // Gap — reset to 1 (today counts)
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, profile.longest_checkin_streak || 0);

    const updates = {
      checkin_streak: newStreak,
      longest_checkin_streak: newLongest,
      last_checkin_date: today,
    };

    if (isFullCheckIn) {
      updates.last_full_checkin_at = new Date().toISOString();
    }

    await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);
  }

  // ── Emotional Baseline ──────────────────────────────────

  /**
   * Compute rolling emotional baseline — the core analytics method.
   *
   * Aggregates ALL mood data (pre, post, checkin, evening) into
   * weekly valence scores. Valence = % of moods in positive quadrants
   * (bright + tender) vs negative (charged + deep).
   *
   * @param {number} weeks - How many weeks to look back (default 12)
   * @returns {Promise<Object>} - { weeks: [...], current, previous, delta, trend }
   */
  async computeEmotionalBaseline(weeks = 12) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return this._emptyBaseline();

    const since = new Date();
    since.setDate(since.getDate() - (weeks * 7));

    // Get all mood history entries in range
    const { data: moods, error } = await supabase
      .from('user_mood_history')
      .select('feeling_id, quadrant_id, mood_type, created_at')
      .eq('user_id', user.id)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error || !moods || moods.length === 0) {
      return this._emptyBaseline();
    }

    // Group by ISO week and compute valence
    const weekBuckets = {};

    for (const mood of moods) {
      const date = new Date(mood.created_at);
      const weekKey = this._getISOWeek(date);

      if (!weekBuckets[weekKey]) {
        weekBuckets[weekKey] = { positive: 0, negative: 0, total: 0, date };
      }

      const bucket = weekBuckets[weekKey];
      bucket.total += 1;

      // Determine sentiment from feeling_id or quadrant_id
      const isPositive = this._isMoodPositive(mood.feeling_id, mood.quadrant_id);
      if (isPositive === true) {
        bucket.positive += 1;
      } else if (isPositive === false) {
        bucket.negative += 1;
      }
      // null = unsure/unknown, counted in total but not positive or negative
    }

    // Convert to array sorted by week
    const weeklyData = Object.entries(weekBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => ({
        week,
        valence: data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0,
        positive: data.positive,
        negative: data.negative,
        total: data.total,
        date: data.date,
      }));

    // Current and previous week
    const currentWeek = weeklyData[weeklyData.length - 1] || null;
    const previousWeek = weeklyData[weeklyData.length - 2] || null;

    // Delta calculation
    let delta = 0;
    let trend = 'stable';
    if (currentWeek && previousWeek) {
      delta = currentWeek.valence - previousWeek.valence;
      if (delta > 5) trend = 'rising';
      else if (delta < -5) trend = 'dipping';
      else trend = 'stable';
    }

    // Longer-term trend (last 4 weeks avg vs prior 4 weeks avg)
    let monthTrend = 'stable';
    let monthDelta = 0;
    if (weeklyData.length >= 4) {
      const recentFour = weeklyData.slice(-4);
      const recentAvg = recentFour.reduce((sum, w) => sum + w.valence, 0) / recentFour.length;

      if (weeklyData.length >= 8) {
        const priorFour = weeklyData.slice(-8, -4);
        const priorAvg = priorFour.reduce((sum, w) => sum + w.valence, 0) / priorFour.length;
        monthDelta = Math.round(recentAvg - priorAvg);
        if (monthDelta > 5) monthTrend = 'rising';
        else if (monthDelta < -5) monthTrend = 'dipping';
      }
    }

    return {
      weeks: weeklyData,
      current: currentWeek,
      previous: previousWeek,
      delta,
      trend,
      monthDelta,
      monthTrend,
      totalDataPoints: moods.length,
      hasEnoughData: weeklyData.length >= 2 && moods.length >= 5,
    };
  }

  /**
   * Compute quadrant distribution over time for trajectory charts.
   *
   * @param {number} weeks - How many weeks to look back
   * @returns {Promise<Array>} - [{ week, bright, charged, tender, deep, total }]
   */
  async computeQuadrantTrajectory(weeks = 12) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const since = new Date();
    since.setDate(since.getDate() - (weeks * 7));

    const { data: moods, error } = await supabase
      .from('user_mood_history')
      .select('feeling_id, quadrant_id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error || !moods || moods.length === 0) return [];

    const weekBuckets = {};

    for (const mood of moods) {
      const weekKey = this._getISOWeek(new Date(mood.created_at));

      if (!weekBuckets[weekKey]) {
        weekBuckets[weekKey] = { bright: 0, charged: 0, tender: 0, deep: 0, total: 0 };
      }

      const bucket = weekBuckets[weekKey];
      const quadrant = this._getQuadrant(mood.feeling_id, mood.quadrant_id);
      if (quadrant && bucket[quadrant] !== undefined) {
        bucket[quadrant] += 1;
      }
      bucket.total += 1;
    }

    return Object.entries(weekBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => ({
        week,
        ...data,
        // Percentages for stacked chart
        brightPct: data.total > 0 ? Math.round((data.bright / data.total) * 100) : 0,
        chargedPct: data.total > 0 ? Math.round((data.charged / data.total) * 100) : 0,
        tenderPct: data.total > 0 ? Math.round((data.tender / data.total) * 100) : 0,
        deepPct: data.total > 0 ? Math.round((data.deep / data.total) * 100) : 0,
      }));
  }

  // ── Helpers ──────────────────────────────────────────────

  /**
   * Determine if a mood is positive from feeling_id or quadrant_id.
   * @returns {boolean|null} - true=positive, false=negative, null=unknown
   */
  _isMoodPositive(feelingId, quadrantId) {
    if (feelingId) {
      if (isPositiveMood(feelingId)) return true;
      const mood = getMoodById(feelingId);
      if (mood?.quadrant === 'charged' || mood?.quadrant === 'deep') return false;
      return null; // unsure or unknown
    }

    if (quadrantId) {
      if (quadrantId === 'bright' || quadrantId === 'tender') return true;
      if (quadrantId === 'charged' || quadrantId === 'deep') return false;
    }

    return null;
  }

  /**
   * Get quadrant ID from feeling_id or quadrant_id.
   */
  _getQuadrant(feelingId, quadrantId) {
    if (quadrantId) return quadrantId;
    if (feelingId) {
      const mood = getMoodById(feelingId);
      return mood?.quadrant || null;
    }
    return null;
  }

  /**
   * Get ISO week string (YYYY-WNN) for grouping.
   */
  _getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  _emptyBaseline() {
    return {
      weeks: [],
      current: null,
      previous: null,
      delta: 0,
      trend: 'stable',
      monthDelta: 0,
      monthTrend: 'stable',
      totalDataPoints: 0,
      hasEnoughData: false,
    };
  }
}

export const checkInService = new CheckInService();
