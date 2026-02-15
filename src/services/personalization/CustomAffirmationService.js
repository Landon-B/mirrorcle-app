import { supabase } from '../../config/supabase';

class CustomAffirmationService {
  /**
   * Get all custom affirmations for a user
   */
  async getAll(userId) {
    const { data, error } = await supabase
      .from('user_custom_affirmations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this._transform);
  }

  /**
   * Get active custom affirmations for session use
   */
  async getActive(userId) {
    const { data, error } = await supabase
      .from('user_custom_affirmations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this._transform);
  }

  /**
   * Create a custom affirmation
   */
  async create(userId, text) {
    const trimmed = text?.trim();
    if (!trimmed || trimmed.length < 3) {
      throw new Error('Affirmation must be at least 3 characters');
    }
    if (trimmed.length > 500) {
      throw new Error('Affirmation must be 500 characters or less');
    }

    const { data, error } = await supabase
      .from('user_custom_affirmations')
      .insert({ user_id: userId, text: trimmed })
      .select()
      .single();

    if (error) throw error;
    return this._transform(data);
  }

  /**
   * Update a custom affirmation
   */
  async update(id, userId, updates) {
    const dbUpdates = {};
    if (updates.text !== undefined) {
      const trimmed = updates.text?.trim();
      if (!trimmed || trimmed.length < 3) {
        throw new Error('Affirmation must be at least 3 characters');
      }
      if (trimmed.length > 500) {
        throw new Error('Affirmation must be 500 characters or less');
      }
      dbUpdates.text = trimmed;
    }
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('user_custom_affirmations')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return this._transform(data);
  }

  /**
   * Delete a custom affirmation
   */
  async delete(id, userId) {
    const { error } = await supabase
      .from('user_custom_affirmations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Get count of user's custom affirmations
   */
  async getCount(userId) {
    const { count, error } = await supabase
      .from('user_custom_affirmations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  }

  _transform(row) {
    if (!row) return null;
    return {
      id: row.id,
      text: row.text,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }
}

export const customAffirmationService = new CustomAffirmationService();
