/**
 * Smart emoji search: concept, color, and synonym matching with typo
 * tolerance and did-you-mean suggestions. Pure functions, no DOM, no
 * network. Runs in the browser and under Node's test runner.
 *
 * The intelligence comes from the data (each emoji carries Unicode CLDR
 * keywords plus a curated color and concept supplement) combined with a
 * ranked matcher: exact keyword beats prefix beats substring beats a
 * bounded edit-distance fuzzy match, so "hart" still finds the heart.
 */

/**
 * Damerau (optimal string alignment) distance with an early-exit cap, so
 * an adjacent transposition like "hte" -> "the" costs 1, not 2. Returns
 * cap + 1 when the true distance exceeds cap.
 */
export const MAX_QUERY_LENGTH = 256;

export function editDistance(a, b, cap = 2) {
  a = String(a ?? "");
  b = String(b ?? "");
  cap = Number.isInteger(cap) && cap >= 0 ? Math.min(cap, 32) : 2;
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prevPrev = null;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array(b.length + 1);
    cur[0] = i;
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prevPrev[j - 2] + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > cap) return cap + 1;
    prevPrev = prev;
    prev = cur;
  }
  return prev[b.length];
}

function fuzzyCap(len) {
  if (len <= 3) return 0;      // too short to fuzz safely
  if (len <= 5) return 1;
  return 2;
}

/**
 * Build a search index from the dataset categories.
 * Returns { items: [{char,name,keywords,category}], vocab: string[] }.
 */
export function normalizeCategories(categories) {
  if (!Array.isArray(categories)) return [];
  const normalized = [];
  for (const category of categories) {
    if (!category || typeof category.name !== "string" || !Array.isArray(category.emoji)) continue;
    const emoji = [];
    for (const entry of category.emoji) {
      const source = typeof entry === "string" ? { char: entry } : entry;
      if (!source || typeof source.char !== "string" || !source.char.trim()) continue;
      emoji.push({
        char: source.char,
        name: typeof source.name === "string" ? source.name : "",
        keywords: Array.isArray(source.keywords) ? source.keywords.filter(k => typeof k === "string") : []
      });
    }
    if (emoji.length) normalized.push({ name: category.name, emoji });
  }
  return normalized;
}

function words(value) {
  return String(value).normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

export function buildIndex(categories) {
  const items = [];
  const vocab = new Set();
  for (const cat of normalizeCategories(categories)) {
    for (const e of cat.emoji) {
      const { char } = e;
      const name = e.name.normalize("NFKC").toLowerCase();
      const keywords = e.keywords.map(k => k.normalize("NFKC").toLowerCase());
      for (const w of words(name)) vocab.add(w);
      for (const keyword of keywords) for (const w of words(keyword)) vocab.add(w);
      items.push({ char, name: name.toLowerCase(), keywords, category: cat.name });
    }
  }
  return { items, vocab: [...vocab] };
}

/** Score how well one query token matches one emoji. 0 means no match. */
function tokenScore(token, item) {
  // direct glyph paste
  if (token === item.char) return 100;

  let best = 0;
  const fields = [item.name, ...item.keywords];
  for (const field of fields) {
    if (!field) continue;
    for (const word of words(field)) {
      if (word === token) { best = Math.max(best, 10); continue; }
      if (word.startsWith(token) && token.length >= 2) { best = Math.max(best, 7); continue; }
      if (token.length >= 3 && word.includes(token)) { best = Math.max(best, 5); continue; }
    }
  }
  if (best === 0) {
    // typo tolerance against individual words
    const cap = fuzzyCap(token.length);
    if (cap > 0) {
      let min = cap + 1;
      for (const field of fields) {
        for (const word of words(field)) {
          if (!word || Math.abs(word.length - token.length) > cap) continue;
          const d = editDistance(token, word, cap);
          if (d < min) min = d;
        }
      }
      if (min <= cap) best = 3 - (min - 1) * 0.8; // 3 for dist 1, ~2.2 for dist 2
    }
  }
  return best;
}

const STOP = new Set(["a", "an", "the", "of", "with", "and", "or", "for", "emoji", "sign", "symbol", "mark"]);

/**
 * Search the index.
 * Returns { results: [{char, category, score}], suggestion, tokens }.
 * results are ranked most-relevant first. suggestion is a did-you-mean
 * term when a token only matched fuzzily (or null).
 */
export function search(index, query, { limit = 400 } = {}) {
  const items = Array.isArray(index?.items) ? index.items : [];
  const raw = String(query ?? "").normalize("NFKC").trim().toLowerCase().slice(0, MAX_QUERY_LENGTH);
  const safeLimit = Number.isInteger(limit) ? Math.max(0, Math.min(limit, items.length)) : Math.min(400, items.length);
  if (!raw) return { results: items.slice(0, safeLimit).map(i => ({ char: i.char, category: i.category, score: 0 })), suggestion: null, tokens: [] };

  const direct = items.find(item => item.char === raw);
  if (direct) return { results: [{ char: direct.char, category: direct.category, score: 100 }], suggestion: null, tokens: [raw] };

  const tokens = words(raw).filter(t => !STOP.has(t));
  if (!tokens.length) return { results: [], suggestion: null, tokens: [] };

  const scored = [];
  for (const item of items) {
    let total = 0, matched = 0, fuzzyOnly = 0;
    for (const t of tokens) {
      const s = tokenScore(t, item);
      if (s > 0) {
        total += s; matched++;
        if (s < 4) fuzzyOnly++;
      }
    }
    if (matched === tokens.length) {
      scored.push({ char: item.char, category: item.category, score: total, fuzzyOnly });
    }
  }

  const ranked = scored.sort((a, b) => b.score - a.score).slice(0, safeLimit);

  // Suggest a corrected query when nothing matched or every result depended
  // on at least one fuzzy token.
  let suggestion = null;
  if (!ranked.length || ranked.every(result => result.fuzzyOnly > 0)) {
    const candidate = didYouMean(index, tokens);
    const candidateTokens = candidate ? words(candidate).filter(t => !STOP.has(t)) : [];
    if (candidateTokens.length && items.some(item => candidateTokens.every(t => tokenScore(t, item) > 0))) {
      suggestion = candidate;
    }
  }
  const results = ranked.map(({ char, category, score }) => ({ char, category, score }));

  return { results, suggestion, tokens };
}

/** Nearest vocabulary word to any query token, for a did-you-mean prompt. */
export function didYouMean(index, tokens) {
  const vocab = Array.isArray(index?.vocab) ? index.vocab : [];
  const known = new Set(vocab);
  let changed = false;
  const corrected = tokens.map((t) => {
    if (known.has(t) || t.length < 3) return t;
    let best = null, bestD = Infinity;
    const cap = Math.max(2, fuzzyCap(t.length));
    for (const word of vocab) {
      if (Math.abs(word.length - t.length) > cap) continue;
      const d = editDistance(t, word, cap);
      if (d > 0 && d <= cap && d < bestD) { bestD = d; best = word; }
    }
    if (best) changed = true;
    return best || t;
  });
  return changed ? corrected.join(" ") : null;
}
