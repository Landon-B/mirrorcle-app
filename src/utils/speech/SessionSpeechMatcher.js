export class SessionSpeechMatcher {
  constructor() {
    this.tokens = [];
    this.displayTokens = [];
    this.activeToken = 0;

    this._heardTokens = [];
    this._lastResultTokens = [];
    this._heardIndex = 0;

    this._maxFuzzyDistance = 1;
    this._minLenForFuzzy = 4;
  }

  resetForText(text) {
    this.tokens = this._tokenizeNormalized(text);
    this.displayTokens = this._tokenizeDisplay(text);
    this.activeToken = 0;

    this._heardTokens = [];
    this._lastResultTokens = [];
    this._heardIndex = 0;
  }

  get isComplete() {
    return this.tokens.length > 0 && this.activeToken >= this.tokens.length;
  }

  tokenizeSpeech(text) {
    return this._tokenizeNormalized(text);
  }

  tokenizeSpeechForCurrent(text) {
    const all = this._tokenizeNormalized(text);
    if (!this.tokens.length || !all.length) return all;
    const windowSize = this.tokens.length + 2;
    if (all.length <= windowSize) return all;
    return all.slice(all.length - windowSize);
  }

  updateWithSpokenTokens(spokenTokens) {
    if (!this.tokens.length || !spokenTokens.length) return false;

    const newTokens = this._diffTokens(spokenTokens);
    if (newTokens.length) {
      this._heardTokens = [...this._heardTokens, ...newTokens];
    }

    const prevActive = this.activeToken;
    const prevHeardIndex = this._heardIndex;

    while (this.activeToken < this.tokens.length) {
      const target = this.tokens[this.activeToken];
      const found = this._indexOfFromFuzzy(this._heardTokens, target, this._heardIndex);
      if (found === -1) break;

      this._heardIndex = found + 1;
      this.activeToken += 1;
    }

    return prevActive !== this.activeToken || prevHeardIndex !== this._heardIndex;
  }

  _tokenizeNormalized(text) {
    const cleaned = (text || '')
      .toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/'/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) return [];
    return cleaned.split(' ');
  }

  _tokenizeDisplay(text) {
    const cleaned = (text || '')
      .replace(/[’‘`´]/g, "'")
      .replace(/'/g, '')
      .replace(/[^A-Za-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) return [];
    const parts = cleaned.split(' ');
    if (parts.length) parts[0] = this._capitalizeFirst(parts[0]);
    return parts;
  }

  _capitalizeFirst(text) {
    return text ? text[0].toUpperCase() + text.slice(1) : text;
  }

  _diffTokens(current) {
    if (!this._lastResultTokens.length) {
      this._lastResultTokens = current;
      return current;
    }

    if (this._startsWith(current, this._lastResultTokens)) {
      const diff = current.slice(this._lastResultTokens.length);
      this._lastResultTokens = current;
      return diff;
    }

    if (this._startsWith(this._lastResultTokens, current)) {
      this._lastResultTokens = current;
      return [];
    }

    this._lastResultTokens = current;
    return current;
  }

  _startsWith(list, prefix) {
    if (prefix.length > list.length) return false;
    for (let i = 0; i < prefix.length; i += 1) {
      if (list[i] !== prefix[i]) return false;
    }
    return true;
  }

  _indexOfFromFuzzy(list, target, start) {
    for (let i = start; i < list.length; i += 1) {
      if (this._tokenEquals(list[i], target)) return i;
    }
    return -1;
  }

  _tokenEquals(a, b) {
    if (a === b) return true;

    const as = this._stripSuffix(a);
    const bs = this._stripSuffix(b);
    if (as === bs) return true;

    if (a.length >= this._minLenForFuzzy && b.length >= this._minLenForFuzzy) {
      const dist = this._levenshtein(a, b, { maxDist: this._maxFuzzyDistance });
      return dist <= this._maxFuzzyDistance;
    }

    return false;
  }

  _stripSuffix(text) {
    if (text.endsWith('ing') && text.length > 5) return text.slice(0, -3);
    if (text.endsWith('ed') && text.length > 4) return text.slice(0, -2);
    if (text.endsWith('s') && text.length > 3) return text.slice(0, -1);
    return text;
  }

  _levenshtein(source, target, { maxDist }) {
    const n = source.length;
    const m = target.length;

    if (Math.abs(n - m) > maxDist) return maxDist + 1;
    if (!n) return m;
    if (!m) return n;

    let prev = Array.from({ length: m + 1 }, (_, j) => j);
    let curr = new Array(m + 1).fill(0);

    for (let i = 1; i <= n; i += 1) {
      curr[0] = i;
      let rowMin = curr[0];
      const si = source.charCodeAt(i - 1);

      for (let j = 1; j <= m; j += 1) {
        const cost = si === target.charCodeAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(
          Math.min(curr[j - 1] + 1, prev[j] + 1),
          prev[j - 1] + cost,
        );
        rowMin = Math.min(rowMin, curr[j]);
      }

      if (rowMin > maxDist) return maxDist + 1;

      const temp = prev;
      prev = curr;
      curr = temp;
    }

    return prev[m];
  }
}
