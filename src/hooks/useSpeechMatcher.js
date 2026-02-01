import { useCallback, useEffect, useRef, useState } from 'react';
import { SessionSpeechMatcher } from '../utils/speech/SessionSpeechMatcher';

export const useSpeechMatcher = (text) => {
  const matcherRef = useRef(new SessionSpeechMatcher());
  const [displayTokens, setDisplayTokens] = useState([]);
  const [activeToken, setActiveToken] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const matcher = matcherRef.current;
    matcher.resetForText(text || '');
    setDisplayTokens(matcher.displayTokens);
    setActiveToken(matcher.activeToken);
    setIsComplete(matcher.isComplete);
  }, [text]);

  const updateWithSpeech = useCallback((spokenText, options = {}) => {
    const matcher = matcherRef.current;
    if (!spokenText) return false;

    const tokens = options.useTailWindow === false
      ? matcher.tokenizeSpeech(spokenText)
      : matcher.tokenizeSpeechForCurrent(spokenText);
    const changed = matcher.updateWithSpokenTokens(tokens);

    if (changed) {
      setActiveToken(matcher.activeToken);
      setIsComplete(matcher.isComplete);
    }

    return changed;
  }, []);

  return {
    displayTokens,
    activeToken,
    isComplete,
    updateWithSpeech,
  };
};
