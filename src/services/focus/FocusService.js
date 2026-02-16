import { supabase } from '../../config/supabase';
import { storageService } from '../storage';
import { getFocusAreaById } from '../../constants/focusAreas';
import { STORAGE_KEYS } from '../../constants';

const getLocalDate = () => new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

class FocusService {
  /**
   * Get today's focus area if one has been set today.
   * @returns {Promise<Object|null>} Focus area object or null
   */
  async getTodaysFocus() {
    const today = getLocalDate();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('daily_focus_id, daily_focus_date')
          .eq('id', user.id)
          .single();

        if (profile?.daily_focus_date === today && profile?.daily_focus_id) {
          return getFocusAreaById(profile.daily_focus_id) || null;
        }
        return null;
      }
    } catch (e) {
      // Fall through to AsyncStorage
    }

    // Unauthenticated: check AsyncStorage
    const stored = await storageService.get(STORAGE_KEYS.dailyFocus);
    if (stored?.date === today && stored?.focusId) {
      return getFocusAreaById(stored.focusId) || null;
    }
    return null;
  }

  /**
   * Save today's focus selection.
   * @param {string} focusId - Focus area ID (e.g. 'self-worth')
   * @returns {Promise<void>}
   */
  async setTodaysFocus(focusId) {
    const today = getLocalDate();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ daily_focus_id: focusId, daily_focus_date: today })
          .eq('id', user.id);
        return;
      }
    } catch (e) {
      // Fall through to AsyncStorage
    }

    await storageService.set(STORAGE_KEYS.dailyFocus, {
      focusId,
      date: today,
    });
  }
}

export const focusService = new FocusService();
