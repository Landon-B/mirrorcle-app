import { SessionSpeechMatcher } from '../src/utils/speech/SessionSpeechMatcher';

describe('SessionSpeechMatcher', () => {
  it('keeps a tail window for current prompt tokenization', () => {
    const matcher = new SessionSpeechMatcher();
    matcher.resetForText('I am enough');

    const tokens = matcher.tokenizeSpeechForCurrent(
      'alpha beta gamma delta epsilon zeta eta theta'
    );

    expect(tokens).toEqual(['delta', 'epsilon', 'zeta', 'eta', 'theta']);
  });

  it('does not advance past the current prompt when speech includes extra words', () => {
    const matcher = new SessionSpeechMatcher();
    matcher.resetForText('I am enough');

    const tokens = matcher.tokenizeSpeechForCurrent('I am enough right now');
    matcher.updateWithSpokenTokens(tokens);

    expect(matcher.activeToken).toBe(matcher.tokens.length);
    expect(matcher.isComplete).toBe(true);
  });

  it('advances incrementally with partial results', () => {
    const matcher = new SessionSpeechMatcher();
    matcher.resetForText('I am enough');

    matcher.updateWithSpokenTokens(matcher.tokenizeSpeechForCurrent('I'));
    expect(matcher.activeToken).toBe(1);

    matcher.updateWithSpokenTokens(matcher.tokenizeSpeechForCurrent('I am'));
    expect(matcher.activeToken).toBe(2);

    matcher.updateWithSpokenTokens(matcher.tokenizeSpeechForCurrent('I am enough'));
    expect(matcher.activeToken).toBe(3);
  });
});
