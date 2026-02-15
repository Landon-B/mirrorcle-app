import { supabase } from '../../config/supabase';
import { personalizationService } from '../personalization';

/**
 * Service for fetching affirmations from Supabase with support for:
 * - Feeling-based tag filtering
 * - Premium content filtering
 * - Excluding already-engaged affirmations
 */
class AffirmationService {
  /**
   * Get all affirmations (optionally filtered)
   * @param {Object} options
   * @param {boolean} options.isPrompt - Filter by prompt status
   * @param {boolean} options.isPro - User's pro status (filters premium content)
   * @param {boolean} options.shuffle - Randomize the order
   * @param {number} options.limit - Max number of affirmations to return
   * @returns {Promise<Array>}
   */
  async getAll({ isPrompt = null, isPro = false, shuffle = false, limit = null } = {}) {
    let query = supabase
      .from('affirmations')
      .select('*')
      .order('created_at', { ascending: true });

    if (isPrompt !== null) {
      query = query.eq('is_prompt', isPrompt);
    }

    if (!isPro) {
      query = query.eq('is_premium', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    let results = this._transformAffirmations(data);

    // Shuffle if requested
    if (shuffle) {
      results = this._shuffle(results);
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      results = results.slice(0, limit);
    }

    return results;
  }

  /**
   * Fisher-Yates shuffle algorithm for randomizing arrays
   * @private
   */
  _shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get a single affirmation by ID
   * @param {string} id - Affirmation UUID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('affirmations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this._transformAffirmation(data);
  }

  /**
   * Get affirmations by feeling using tag mappings
   * @param {string} feelingId - Feeling ID (e.g., 'happy', 'struggling')
   * @param {Object} options
   * @param {boolean} options.isPrompt - Filter for prompts only
   * @param {boolean} options.isPro - User's pro status
   * @param {string} options.userId - User ID to exclude already-engaged affirmations
   * @param {number} options.limit - Max number of affirmations to return
   * @param {boolean} options.shuffle - Randomize the order (default: true for variety)
   * @returns {Promise<Array>}
   */
  async getByFeeling(feelingId, { isPrompt = null, isPro = false, userId = null, limit = null, shuffle = true } = {}) {
    // First get the tags associated with this feeling, ordered by weight
    const { data: feelingTags, error: tagsError } = await supabase
      .from('feeling_tags')
      .select('tag_id, weight')
      .eq('feeling_id', feelingId)
      .order('weight', { ascending: false });

    if (tagsError) throw tagsError;

    if (!feelingTags || feelingTags.length === 0) {
      // No tags mapped to this feeling, return all affirmations
      return this.getAll({ isPrompt, isPro });
    }

    const tagIds = feelingTags.map(ft => ft.tag_id);

    // Get affirmations that have any of these tags
    let query = supabase
      .from('affirmation_tags')
      .select(`
        affirmation_id,
        tag_id,
        affirmations!inner (
          id,
          text,
          gradient_start,
          gradient_end,
          is_prompt,
          is_premium,
          created_at
        )
      `)
      .in('tag_id', tagIds);

    const { data: affirmationTags, error: affError } = await query;

    if (affError) throw affError;

    // Build a map of affirmation_id -> { affirmation, totalWeight }
    const affirmationMap = new Map();
    const tagWeightMap = new Map(feelingTags.map(ft => [ft.tag_id, ft.weight]));

    for (const at of affirmationTags) {
      const aff = at.affirmations;

      // Apply filters
      if (isPrompt !== null && aff.is_prompt !== isPrompt) continue;
      if (!isPro && aff.is_premium) continue;

      const existing = affirmationMap.get(aff.id);
      const tagWeight = tagWeightMap.get(at.tag_id) || 1;

      if (existing) {
        existing.totalWeight += tagWeight;
      } else {
        affirmationMap.set(aff.id, {
          affirmation: aff,
          totalWeight: tagWeight,
        });
      }
    }

    // If user is provided, exclude already-engaged affirmations
    if (userId) {
      const { data: history, error: histError } = await supabase
        .from('user_affirmation_history')
        .select('affirmation_id')
        .eq('user_id', userId)
        .eq('engaged', true);

      if (histError) throw histError;

      const engagedIds = new Set(history?.map(h => h.affirmation_id) || []);
      for (const id of engagedIds) {
        affirmationMap.delete(id);
      }
    }

    // Sort by total weight (descending), then by created_at
    let results = Array.from(affirmationMap.values())
      .sort((a, b) => {
        if (b.totalWeight !== a.totalWeight) {
          return b.totalWeight - a.totalWeight;
        }
        return new Date(a.affirmation.created_at) - new Date(b.affirmation.created_at);
      })
      .map(item => item.affirmation);

    // Shuffle for variety (while still preferring higher-weighted tags)
    // We shuffle within weight groups to maintain relevance while adding variety
    if (shuffle) {
      results = this._shuffle(results);
    }

    if (limit) {
      results = results.slice(0, limit);
    }

    return this._transformAffirmations(results);
  }

  /**
   * Get prompts for a camera session based on feeling
   * @param {string} feelingId - Feeling ID
   * @param {Object} options
   * @param {boolean} options.isPro - User's pro status
   * @param {string} options.userId - User ID to exclude engaged prompts
   * @param {number} options.count - Number of prompts to return
   * @returns {Promise<Array>}
   */
  async getPromptsForSession(feelingId, { isPro = false, userId = null, count = 5 } = {}) {
    return this.getByFeeling(feelingId, {
      isPrompt: true,
      isPro,
      userId,
      limit: count,
    });
  }

  /**
   * Get personalized prompts with resonance, difficulty, time-of-day, and custom affirmations
   * @param {string} feelingId - Feeling ID
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getPersonalizedForSession(feelingId, { isPro = false, userId = null, count = 5, timeOfDay = null } = {}) {
    // Get base candidates with tag weights
    const { data: feelingTags, error: tagsError } = await supabase
      .from('feeling_tags')
      .select('tag_id, weight')
      .eq('feeling_id', feelingId)
      .order('weight', { ascending: false });

    if (tagsError) throw tagsError;

    const tagIds = feelingTags?.map(ft => ft.tag_id) || [];
    const tagWeightMap = new Map(feelingTags?.map(ft => [ft.tag_id, ft.weight]) || []);

    // Get affirmations with tags + time affinity
    let query = supabase
      .from('affirmation_tags')
      .select(`
        affirmation_id,
        tag_id,
        affirmations!inner (
          id, text, gradient_start, gradient_end, is_prompt, is_premium, created_at
        ),
        tags!inner (
          time_affinity
        )
      `);

    if (tagIds.length > 0) {
      query = query.in('tag_id', tagIds);
    }

    const { data: affirmationTags, error: affError } = await query;
    if (affError) throw affError;

    // Fetch user-specific data in parallel
    let resonanceScores = new Map();
    let totalSessions = 0;
    const engagedIds = new Set();
    let customAffirmations = [];

    if (userId) {
      try {
        const [resonanceResult, profileResult, historyResult, customsResult] = await Promise.all([
          personalizationService.getResonanceScores(userId).catch(() => new Map()),
          supabase.from('user_profiles').select('total_sessions').eq('id', userId).single(),
          supabase.from('user_affirmation_history').select('affirmation_id').eq('user_id', userId).eq('engaged', true),
          supabase.from('user_custom_affirmations').select('*').eq('user_id', userId).eq('is_active', true),
        ]);

        resonanceScores = resonanceResult;
        totalSessions = profileResult.data?.total_sessions || 0;
        for (const h of historyResult.data || []) engagedIds.add(h.affirmation_id);
        customAffirmations = customsResult.data || [];
      } catch (e) {
        // Gracefully continue without personalization
      }
    }

    const { maxLength } = this._getDifficultyLevel(totalSessions);

    // Build scored candidates
    const affirmationMap = new Map();

    for (const at of affirmationTags || []) {
      const aff = at.affirmations;
      if (!aff.is_prompt) continue;
      if (!isPro && aff.is_premium) continue;
      if (engagedIds.has(aff.id)) continue;
      if (aff.text.length > maxLength) continue;

      const tagWeight = tagWeightMap.get(at.tag_id) || 1;
      const resonance = resonanceScores.get(aff.id) || 0;
      let score = tagWeight * (1 + resonance * 0.5);

      // Time-of-day boost
      const timeAffinity = at.tags?.time_affinity;
      if (timeOfDay && timeAffinity) {
        if ((timeOfDay === 'morning' && timeAffinity === 'morning') ||
            (timeOfDay === 'evening' && timeAffinity === 'evening') ||
            (timeOfDay === 'night' && timeAffinity === 'evening')) {
          score *= 1.3;
        }
      }

      const existing = affirmationMap.get(aff.id);
      if (existing) {
        existing.score += score;
      } else {
        affirmationMap.set(aff.id, { affirmation: aff, score });
      }
    }

    // Merge in custom affirmations (already fetched in parallel above)
    for (const custom of customAffirmations) {
      affirmationMap.set(`custom-${custom.id}`, {
        affirmation: {
          id: `custom-${custom.id}`,
          text: custom.text,
          gradient_start: '#A855F7',
          gradient_end: '#EC4899',
          is_prompt: true,
          is_premium: false,
        },
        score: (tagWeightMap.values().next().value || 3) + 0.3,
      });
    }

    // Weighted random sampling
    const candidates = Array.from(affirmationMap.values());
    const selected = this._weightedSample(candidates, count);

    return this._transformAffirmations(selected.map(c => c.affirmation));
  }

  /**
   * Weighted random sampling — selects items proportional to their score
   * @private
   */
  _weightedSample(candidates, count) {
    if (candidates.length <= count) return candidates;

    const selected = [];
    const remaining = [...candidates];

    for (let i = 0; i < count && remaining.length > 0; i++) {
      const totalWeight = remaining.reduce((sum, c) => sum + c.score, 0);
      let random = Math.random() * totalWeight;

      for (let j = 0; j < remaining.length; j++) {
        random -= remaining[j].score;
        if (random <= 0) {
          selected.push(remaining[j]);
          remaining.splice(j, 1);
          break;
        }
      }
    }

    return selected;
  }

  /**
   * @private
   */
  _getDifficultyLevel(totalSessions) {
    return personalizationService.getDifficultyLevel(totalSessions);
  }

  /**
   * Get all tags
   * @returns {Promise<Array>}
   */
  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  /**
   * Get tags for a specific affirmation
   * @param {string} affirmationId - Affirmation UUID
   * @returns {Promise<Array>}
   */
  async getTagsForAffirmation(affirmationId) {
    const { data, error } = await supabase
      .from('affirmation_tags')
      .select(`
        tags (
          id,
          name,
          description
        )
      `)
      .eq('affirmation_id', affirmationId);

    if (error) throw error;
    return data?.map(d => d.tags) || [];
  }

  /**
   * Get all feelings
   * @returns {Promise<Array>}
   */
  async getFeelings() {
    const { data, error } = await supabase
      .from('feelings')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return this._transformFeelings(data);
  }

  /**
   * Get a single feeling by ID
   * @param {string} id - Feeling ID (e.g., 'happy')
   * @returns {Promise<Object|null>}
   */
  async getFeelingById(id) {
    const { data, error } = await supabase
      .from('feelings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this._transformFeeling(data);
  }

  // Transform database format to app format
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

  _transformAffirmations(rows) {
    return rows?.map(row => this._transformAffirmation(row)) || [];
  }

  _transformFeeling(row) {
    if (!row) return null;
    return {
      id: row.id,
      label: row.label,
      icon: row.icon,
      colors: [row.gradient_start, row.gradient_end],
    };
  }

  _transformFeelings(rows) {
    return rows?.map(row => this._transformFeeling(row)) || [];
  }
}

export const affirmationService = new AffirmationService();
