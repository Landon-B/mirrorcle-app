import { supabase } from '../../config/supabase';
import { getMoodLabel, getMoodEmoji } from '../../constants/feelings';
import { getFocusAreaById } from '../../constants/focusAreas';

/**
 * Aggregates data from sessions, milestones, and moods
 * into a narrative transformation timeline.
 */
class JourneyService {
  /**
   * Get the user's full transformation timeline.
   * Returns sorted array of timeline events:
   * - milestone events (from user_milestones)
   * - week summaries with narrative text
   * - mood shift highlights
   * - streak markers
   */
  async getTimeline(userId) {
    const [milestonesRes, sessionsRes, moodsRes] = await Promise.all([
      supabase
        .from('user_milestones')
        .select('milestone_key, achieved_at')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: true }),
      supabase
        .from('user_sessions')
        .select('id, feeling_id, duration_seconds, prompts_completed, focus_area_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('user_mood_history')
        .select('feeling_id, session_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
    ]);

    const milestones = milestonesRes.data || [];
    const sessions = sessionsRes.data || [];
    const moods = moodsRes.data || [];

    if (sessions.length === 0) return [];

    const events = [];

    // --- Milestone events ---
    for (const m of milestones) {
      events.push({
        type: 'milestone',
        key: m.milestone_key,
        date: m.achieved_at,
        narrative: this._getMilestoneNarrative(m.milestone_key),
      });
    }

    // --- Week summaries ---
    const weekBuckets = this._bucketByWeek(sessions);
    const totalWeeks = weekBuckets.length;

    for (let i = 0; i < weekBuckets.length; i++) {
      const week = weekBuckets[i];
      const weekMoods = moods.filter(m => {
        const d = new Date(m.created_at);
        return d >= week.start && d < week.end;
      });

      events.push({
        type: 'week_summary',
        weekNumber: i + 1,
        date: week.start.toISOString(),
        narrative: this._generateWeekNarrative(week, weekMoods, i, totalWeeks),
        stats: {
          sessions: week.sessions.length,
          totalMinutes: Math.round(week.sessions.reduce((s, x) => s + x.duration_seconds, 0) / 60),
          affirmations: week.sessions.reduce((s, x) => s + x.prompts_completed, 0),
        },
      });
    }

    // --- Streak markers (7-day and 30-day milestones) ---
    // Already covered by milestones, but add streak recovery events
    const streakBreaks = this._findStreakBreaks(sessions);
    for (const recovery of streakBreaks) {
      events.push({
        type: 'streak_recovery',
        date: recovery.date,
        daysAway: recovery.daysAway,
        narrative: recovery.daysAway > 7
          ? 'You were away, but you came back. That takes courage.'
          : 'Life paused, and you returned. That matters.',
      });
    }

    // Sort all events chronologically
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return events;
  }

  /**
   * Get monthly or yearly reflection summary.
   * @param {string} userId
   * @param {'month'|'year'} period
   * @param {Date} date - The month/year to summarize
   */
  async getReflectionSummary(userId, period, date) {
    const start = new Date(date);
    const end = new Date(date);

    if (period === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(1);
      end.setHours(0, 0, 0, 0);
    } else {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(end.getFullYear() + 1);
      end.setMonth(0, 1);
      end.setHours(0, 0, 0, 0);
    }

    const [sessionsRes, moodsRes, milestonesRes, historyRes] = await Promise.all([
      supabase
        .from('user_sessions')
        .select('id, feeling_id, duration_seconds, prompts_completed, focus_area_id, created_at')
        .eq('user_id', userId)
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString()),
      supabase
        .from('user_mood_history')
        .select('feeling_id, session_id, created_at')
        .eq('user_id', userId)
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString()),
      supabase
        .from('user_milestones')
        .select('milestone_key, achieved_at')
        .eq('user_id', userId)
        .gte('achieved_at', start.toISOString())
        .lt('achieved_at', end.toISOString()),
      supabase
        .from('user_affirmation_history')
        .select('affirmation_id, engaged, created_at')
        .eq('user_id', userId)
        .eq('engaged', true)
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString()),
    ]);

    const sessions = sessionsRes.data || [];
    const moods = moodsRes.data || [];
    const milestones = milestonesRes.data || [];
    const affirmationHistory = historyRes.data || [];

    // Total affirmations spoken
    const totalAffirmations = affirmationHistory.length;

    // Total sessions and time
    const totalSessions = sessions.length;
    const totalSeconds = sessions.reduce((s, x) => s + x.duration_seconds, 0);

    // Most common focus area
    const focusCounts = {};
    for (const s of sessions) {
      if (s.focus_area_id) {
        focusCounts[s.focus_area_id] = (focusCounts[s.focus_area_id] || 0) + 1;
      }
    }
    const topFocusId = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topFocus = topFocusId ? getFocusAreaById(topFocusId) : null;

    // Mood shift patterns: count negative-to-positive transitions
    // (using session pre/post moods)
    const positiveMoods = new Set(['calm', 'confident', 'energized', 'grateful', 'content', 'hopeful']);
    const negativeMoods = new Set(['anxious', 'sad', 'overwhelmed', 'lonely', 'vulnerable', 'frustrated', 'ashamed', 'numb', 'disconnected', 'drained']);
    let moodShiftCount = 0;
    // Pair moods by session_id (pre and post)
    const moodsBySession = {};
    for (const m of moods) {
      if (!moodsBySession[m.session_id]) {
        moodsBySession[m.session_id] = [];
      }
      moodsBySession[m.session_id].push(m);
    }
    for (const sessionMoods of Object.values(moodsBySession)) {
      if (sessionMoods.length >= 2) {
        const pre = sessionMoods[0].feeling_id;
        const post = sessionMoods[sessionMoods.length - 1].feeling_id;
        if (negativeMoods.has(pre) && positiveMoods.has(post)) {
          moodShiftCount++;
        }
      }
    }

    // Active days
    const uniqueDays = new Set(sessions.map(s => s.created_at.split('T')[0]));
    const activeDays = uniqueDays.size;
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    return {
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalAffirmations,
      totalSessions,
      totalSeconds,
      totalMinutes: Math.round(totalSeconds / 60),
      activeDays,
      totalDays,
      topFocus,
      moodShiftCount,
      milestones: milestones.map(m => m.milestone_key),
    };
  }

  // --- Private helpers ---

  _bucketByWeek(sessions) {
    if (sessions.length === 0) return [];

    const firstDate = new Date(sessions[0].created_at);
    const lastDate = new Date(sessions[sessions.length - 1].created_at);

    // Find the Monday of the first session's week
    const startMonday = new Date(firstDate);
    const day = startMonday.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    startMonday.setDate(startMonday.getDate() + mondayOffset);
    startMonday.setHours(0, 0, 0, 0);

    const weeks = [];
    let weekStart = new Date(startMonday);

    while (weekStart <= lastDate) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekSessions = sessions.filter(s => {
        const d = new Date(s.created_at);
        return d >= weekStart && d < weekEnd;
      });

      if (weekSessions.length > 0) {
        weeks.push({
          start: new Date(weekStart),
          end: new Date(weekEnd),
          sessions: weekSessions,
        });
      }

      weekStart = new Date(weekEnd);
    }

    return weeks;
  }

  _generateWeekNarrative(week, weekMoods, weekIndex, totalWeeks) {
    const sessionCount = week.sessions.length;
    const moodIds = weekMoods.map(m => m.feeling_id);
    const uniqueMoods = new Set(moodIds);
    const hasFocus = week.sessions.some(s => s.focus_area_id);

    // First week narratives
    if (weekIndex === 0) {
      if (sessionCount <= 2) return 'You were finding your voice.';
      return 'You dove right in. That takes courage.';
    }

    // Check for mood patterns
    const anxiousCount = moodIds.filter(m => m === 'anxious' || m === 'overwhelmed' || m === 'frustrated' || m === 'ashamed' || m === 'numb' || m === 'disconnected' || m === 'drained').length;
    const calmCount = moodIds.filter(m => m === 'calm' || m === 'confident' || m === 'content' || m === 'grateful' || m === 'hopeful').length;

    if (calmCount > anxiousCount && calmCount >= 3) {
      return 'You started discovering your calm.';
    }

    if (uniqueMoods.size >= 4) {
      return 'You explored the full spectrum of how you feel.';
    }

    // High engagement
    if (sessionCount >= 5) {
      return 'You showed up every day. This practice is yours now.';
    }

    // Middle weeks
    if (weekIndex > 0 && weekIndex < totalWeeks - 1) {
      if (sessionCount >= 3) return 'You started believing it.';
      return 'Even small steps carry you forward.';
    }

    // Recent week
    if (weekIndex === totalWeeks - 1) {
      return 'You\u2019re still here. That says everything.';
    }

    return 'Another week of choosing yourself.';
  }

  _findStreakBreaks(sessions) {
    const recoveries = [];
    if (sessions.length < 2) return recoveries;

    const dates = sessions.map(s => {
      const d = new Date(s.created_at);
      d.setHours(0, 0, 0, 0);
      return d;
    });

    // Deduplicate by date
    const uniqueDates = [...new Set(dates.map(d => d.getTime()))].map(t => new Date(t));
    uniqueDates.sort((a, b) => a - b);

    for (let i = 1; i < uniqueDates.length; i++) {
      const gap = Math.round((uniqueDates[i] - uniqueDates[i - 1]) / (1000 * 60 * 60 * 24));
      if (gap > 2) {
        recoveries.push({
          date: uniqueDates[i].toISOString(),
          daysAway: gap,
        });
      }
    }

    return recoveries;
  }

  _getMilestoneNarrative(key) {
    const narratives = {
      first_session: 'Your journey began here.',
      ten_sessions: 'You weren\u2019t just trying anymore \u2014 you were practicing.',
      fifty_sessions: 'Fifty times you chose yourself.',
      hundred_affirmations: 'One hundred truths spoken aloud.',
      seven_day_streak: 'Seven days of choosing yourself.',
      thirty_day_streak: 'A month of unwavering presence.',
      first_favorite: 'You found words that moved you.',
      all_feelings_explored: 'You met every part of yourself.',
      custom_affirmation_created: 'You found your own words.',
    };
    return narratives[key] || 'A new chapter in your journey.';
  }
}

export const journeyService = new JourneyService();
