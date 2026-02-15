import { supabase } from '../../config/supabase';

/**
 * Service for fetching inspirational quotes from Supabase.
 * Supports filtering by screen and premium status.
 */
class QuotesService {
  /**
   * Get all quotes
   * @param {Object} options
   * @param {boolean} options.isPro - User's pro status (filters premium content)
   * @returns {Promise<Array>}
   */
  async getAll({ isPro = false } = {}) {
    let query = supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: true });

    if (!isPro) {
      query = query.eq('is_premium', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return this._transformQuotes(data);
  }

  /**
   * Get a random quote
   * @param {Object} options
   * @param {string} options.screen - Optional screen filter
   * @param {boolean} options.isPro - User's pro status
   * @returns {Promise<Object|null>}
   */
  async getRandom({ screen = null, isPro = false } = {}) {
    const quotes = await this.getForScreen({ screen, isPro });
    if (quotes.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }

  /**
   * Get quotes for a specific screen
   * @param {Object} options
   * @param {string} options.screen - Screen name (null for any screen)
   * @param {boolean} options.isPro - User's pro status
   * @returns {Promise<Array>}
   */
  async getForScreen({ screen = null, isPro = false } = {}) {
    let query = supabase
      .from('quotes')
      .select('*');

    // If screen is specified, get quotes for that screen OR quotes with no screen (universal)
    if (screen) {
      query = query.or(`screen.eq.${screen},screen.is.null`);
    }

    if (!isPro) {
      query = query.eq('is_premium', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return this._transformQuotes(data);
  }

  /**
   * Get a quote by ID
   * @param {string} id - Quote UUID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this._transformQuote(data);
  }

  /**
   * Get a random quote for a specific screen with caching to avoid repetition
   * @param {Object} options
   * @param {string} options.screen - Screen name
   * @param {boolean} options.isPro - User's pro status
   * @param {Array} options.excludeIds - Quote IDs to exclude (recently shown)
   * @returns {Promise<Object|null>}
   */
  async getRandomForScreen({ screen, isPro = false, excludeIds = [] } = {}) {
    const quotes = await this.getForScreen({ screen, isPro });

    // Filter out excluded quotes
    const availableQuotes = quotes.filter(q => !excludeIds.includes(q.id));

    // If all quotes are excluded, reset and use all quotes
    const quotesToUse = availableQuotes.length > 0 ? availableQuotes : quotes;

    if (quotesToUse.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * quotesToUse.length);
    return quotesToUse[randomIndex];
  }

  // Transform database format to app format
  _transformQuote(row) {
    if (!row) return null;
    return {
      id: row.id,
      text: row.text,
      author: row.author,
      screen: row.screen,
      isPremium: row.is_premium,
    };
  }

  _transformQuotes(rows) {
    return rows?.map(row => this._transformQuote(row)) || [];
  }
}

export const quotesService = new QuotesService();
