import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { journeyService } from '../services/journey';

export const useJourney = () => {
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useApp();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await journeyService.getTimeline(user.id);
        if (!cancelled) {
          setTimeline(data);
        }
      } catch (error) {
        console.error('Error loading journey timeline:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const loadSummary = useCallback(async (period, date) => {
    if (!user?.id) return null;

    try {
      const data = await journeyService.getReflectionSummary(user.id, period, date);
      setSummary(data);
      return data;
    } catch (error) {
      console.error('Error loading reflection summary:', error);
      return null;
    }
  }, [user?.id]);

  return { timeline, summary, loading, loadSummary };
};
