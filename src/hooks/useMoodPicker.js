import { useState, useCallback } from 'react';
import { MOODS, getQuadrantById } from '../constants/feelings';

/**
 * State machine for the quadrant → bubble mood picker.
 *
 * States: 'quadrant' → 'bubbles' | 'unsure'
 *
 * Encapsulates all selection state and handlers so the consuming
 * screen only wires up navigation, confirm logic, and rendering.
 *
 * @param {{ breathingPulse?: Function, successPulse?: Function }} haptics
 */
export const useMoodPicker = ({ breathingPulse, successPulse } = {}) => {
  const [step, setStep] = useState('quadrant');
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);

  const handleQuadrantSelect = useCallback((quadrantId) => {
    setSelectedQuadrant(quadrantId);
    setSelectedEmotion(null);
    setStep('bubbles');
  }, []);

  const handleUnsure = useCallback(() => {
    breathingPulse?.();
    const unsureMood = MOODS.find(m => m.id === 'unsure');
    setSelectedEmotion(unsureMood);
    setSelectedQuadrant(null);
    setStep('unsure');
  }, [breathingPulse]);

  const handleBubbleSelect = useCallback((emotionId) => {
    breathingPulse?.();
    const mood = MOODS.find(m => m.id === emotionId);
    setSelectedEmotion(mood);
    setTimeout(() => successPulse?.(), 180);
  }, [breathingPulse, successPulse]);

  const handleBubbleDeselect = useCallback(() => {
    setSelectedEmotion(null);
  }, []);

  const handleSearchSelect = useCallback((emotionId) => {
    setSearchVisible(false);
    const mood = MOODS.find(m => m.id === emotionId);
    if (mood?.quadrant) {
      setSelectedQuadrant(mood.quadrant);
      setStep('bubbles');
      // Allow render to settle before selecting the bubble
      setTimeout(() => {
        breathingPulse?.();
        setSelectedEmotion(mood);
        setTimeout(() => successPulse?.(), 180);
      }, 150);
    }
  }, [breathingPulse, successPulse]);

  /**
   * Back navigation through the state machine.
   * Falls through to `navigationGoBack` when at the root (quadrant) step.
   */
  const handleBack = useCallback((navigationGoBack) => {
    if (step === 'unsure') {
      setStep('quadrant');
      setSelectedEmotion(null);
    } else if (step === 'bubbles') {
      setStep('quadrant');
      setSelectedQuadrant(null);
      setSelectedEmotion(null);
    } else {
      navigationGoBack();
    }
  }, [step]);

  const quadrant = selectedQuadrant ? getQuadrantById(selectedQuadrant) : null;

  return {
    // State
    step,
    selectedQuadrant,
    selectedEmotion,
    searchVisible,
    setSearchVisible,
    // Handlers
    handleQuadrantSelect,
    handleUnsure,
    handleBubbleSelect,
    handleBubbleDeselect,
    handleSearchSelect,
    handleBack,
    // Derived
    quadrant,
  };
};
