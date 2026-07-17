import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildIndex, search, editDistance, didYouMean, normalizeCategories, MAX_QUERY_LENGTH } from "../docs/search.js";

const data = JSON.parse(readFileSync(new URL("../docs/data/emoji.json", import.meta.url)));
const csv = readFileSync(new URL("../docs/data/emoji.csv", import.meta.url), "utf8");
const html = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
const index = buildIndex(data.categories);

const chars = (r) => r.results.map(x => x.char);
const has = (r, glyph) => chars(r).includes(glyph);

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (quoted) {
      if (ch === "\"" && next === "\"") { cell += "\""; i++; }
      else if (ch === "\"") quoted = false;
      else cell += ch;
    } else if (ch === "\"") {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell); cell = "";
    } else if (ch === "\n") {
      row.push(cell); rows.push(row); row = []; cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

test("dataset is enriched with keywords", () => {
  assert.equal(index.items.length, 179);
  assert.ok(index.items.every(i => Array.isArray(i.keywords)));
  assert.ok(index.vocab.includes("heart"));
  assert.ok(index.vocab.includes("warning"));
});

test("editDistance basics with cap and transpositions", () => {
  assert.equal(editDistance("heart", "heart"), 0);
  assert.equal(editDistance("hart", "heart"), 1);        // one deletion
  assert.equal(editDistance("hte", "the"), 1);           // adjacent transposition
  assert.equal(editDistance("wraning", "warning"), 1);   // transposition, Damerau
  assert.equal(editDistance("chekc", "check"), 1);        // transposition
  assert.ok(editDistance("abc", "xyzptv", 2) > 2);
});

test("search by name finds the heart", () => {
  assert.ok(has(search(index, "heart"), "❤️"));
});

test("search by concept finds related emoji", () => {
  const love = search(index, "love");
  assert.ok(has(love, "❤️"));
  const danger = search(index, "danger");
  assert.ok(danger.results.some(r => ["⚠️", "☢️", "☣️", "☠️", "⛔️"].includes(r.char)));
});

test("search by color works", () => {
  const red = search(index, "red");
  assert.ok(has(red, "❤️"));
  const green = search(index, "green");
  assert.ok(has(green, "☘️") || has(green, "✅"));
});

test("multi-word query requires both concepts", () => {
  const r = search(index, "red heart");
  assert.ok(has(r, "❤️"));
  // a plain star should not appear for "red heart"
  assert.ok(!has(r, "⭐️"));
});

test("multi-word search does not fall back to partial matches", () => {
  assert.equal(search(index, "red zzzqxwv").results.length, 0);
});

test("search ignores ordinary punctuation around words", () => {
  assert.ok(has(search(index, "heart,"), "❤️"));
  assert.ok(has(search(index, "red-heart"), "❤️"));
});

test("typo still finds the target", () => {
  assert.ok(has(search(index, "hart"), "❤️"), "hart -> heart");
  assert.ok(search(index, "wraning").results.some(r => r.char === "⚠️"), "wraning -> warning");
  assert.ok(search(index, "arow").results.some(r => r.char.includes("➡")), "arow -> arrow");
});

test("did-you-mean suggests a close term for a typo", () => {
  const s = didYouMean(index, ["chekc"]);
  assert.equal(s, "check");
});

test("did-you-mean preserves correct terms in a multi-word query", () => {
  assert.equal(didYouMean(index, ["heart", "chekc"]), "heart check");
  assert.equal(search(index, "red hert").suggestion, "red heart");
  assert.equal(search(index, "heart chekc").suggestion, null, "do not suggest a correction with no results");
});

test("exact word does not trigger a suggestion", () => {
  assert.equal(didYouMean(index, ["heart"]), null);
});

test("a suggestion is never a one or two character word", () => {
  // "luv" sits an equal edit distance from the stray token "v" and the real
  // word "love"; the correction must be the useful word, never the junk letter
  assert.equal(didYouMean(index, ["luv"]), "love");
  for (const token of ["luv", "xox", "tmm", "iii", "ono"]) {
    const s = didYouMean(index, [token]);
    if (s !== null) {
      for (const w of s.split(" ")) {
        assert.ok(w === token || w.length >= 3, `suggested "${w}" for "${token}" is too short to be useful`);
      }
    }
  }
});

test("a glyph pasted without its variation selector still finds itself", () => {
  const withSelector = index.items.find((item) => item.char.includes("\uFE0F"));
  const bare = withSelector.char.replaceAll("\uFE0F", "");
  const { results } = search(index, bare);
  assert.equal(results.length, 1);
  assert.equal(results[0].char, withSelector.char);
});

test("pasting an emoji glyph finds itself", () => {
  assert.ok(has(search(index, "⚠️"), "⚠️"));
});

test("a single-code-point glyph pasted WITH a stray variation selector still finds itself", () => {
  const bare = index.items.find((item) => !item.char.includes("\uFE0F"));
  const { results } = search(index, bare.char + "\uFE0F");
  assert.equal(results[0].char, bare.char);
});

test("every stored glyph resolves by paste, in both variation-selector forms", () => {
  // NFKC normalization once broke this for the enclosed ideographs (㊙️, ‼️);
  // the whole list, not one arbitrary entry, must survive a copy-paste lookup
  for (const item of index.items) {
    const withSel = search(index, item.char);
    assert.equal(withSel.results[0]?.char, item.char, `paste ${item.char}`);
    const bare = item.char.replaceAll("\uFE0F", "");
    if (bare && bare !== item.char) {
      assert.equal(search(index, bare).results[0]?.char, item.char, `paste bare ${item.char}`);
    }
  }
});

test("a query of only stop words returns nothing", () => {
  const r = search(index, "the of and");
  assert.equal(r.results.length, 0);
  assert.equal(r.tokens.length, 0);
  // "emoji" is itself a stop word, so it collapses to the same empty branch
  assert.equal(search(index, "emoji").results.length, 0);
});

test("results are ranked, best first", () => {
  const r = search(index, "star");
  assert.ok(r.results.length > 0);
  // the plain star should rank at or near the top for the query "star"
  const idx = chars(r).indexOf("⭐️");
  assert.ok(idx >= 0 && idx < 3, `star should rank high, was ${idx}`);
});

test("nonsense query returns no results", () => {
  const r = search(index, "zzzqxwv");
  assert.equal(r.results.length, 0);
});

test("empty query returns everything", () => {
  const r = search(index, "");
  assert.equal(r.results.length, index.items.length);
});

test("result limits are bounded and apply to empty searches", () => {
  assert.equal(search(index, "", { limit: 3 }).results.length, 3);
  assert.equal(search(index, "heart", { limit: -4 }).results.length, 0);
  assert.equal(search(index, "heart", { limit: Number.NaN }).results.length > 0, true);
  assert.equal(MAX_QUERY_LENGTH, 256);
});

test("search accepts non-string input and caps oversized queries", () => {
  assert.equal(search(index, null, { limit: 2 }).results.length, 2);
  const result = search(index, "heart ".repeat(100));
  assert.ok(result.tokens.join(" ").length <= MAX_QUERY_LENGTH);
  assert.ok(has(result, "❤️"));
});

test("category normalization skips malformed reusable input", () => {
  const normalized = normalizeCategories([
    null,
    { name: "Broken" },
    { name: "Valid", emoji: [null, 42, "✅", { char: "❤️", name: 9, keywords: ["love", 4] }] }
  ]);
  assert.deepEqual(normalized, [{
    name: "Valid",
    emoji: [
      { char: "✅", name: "", keywords: [] },
      { char: "❤️", name: "", keywords: ["love"] }
    ]
  }]);
  assert.equal(buildIndex(normalized).items.length, 2);
});

test("dataset integrity: well-formed, unique, and reviewed", () => {
  assert.equal(data.schema, 4, "schema version present");
  assert.match(data.lastReviewed, /^\d{4}-\d{2}-\d{2}$/, "lastReviewed is an ISO date");
  assert.ok(Array.isArray(data.categories) && data.categories.length > 0);

  const seen = new Set();
  let count = 0;
  for (const cat of data.categories) {
    assert.ok(cat.name, "every category has a name");
    assert.ok(Array.isArray(cat.emoji) && cat.emoji.length > 0, `category ${cat.name} has emoji`);
    for (const e of cat.emoji) {
      count++;
      const ch = typeof e === "string" ? e : e.char;
      assert.ok(ch && typeof ch === "string", "every entry has a char");
      assert.ok(!seen.has(ch), `no duplicate emoji: ${ch}`);
      seen.add(ch);
      if (typeof e === "object") {
        assert.ok(e.name && typeof e.name === "string", `${ch} has a name`);
        assert.ok(Array.isArray(e.keywords), `${ch} has a keywords array`);
      }
    }
  }
  assert.equal(count, 179, "the reviewed profile has 179 entries");
  assert.equal(data.compatibilityProfile.classification, "usually_safer_starting_point");
  assert.equal(data.compatibilityProfile.allCodePointsInBmp, true);
  assert.deepEqual(data.compatibilityProfile.excludes, [
    "emoji_zwj_sequences",
    "emoji_modifier_sequences",
    "regional_indicator_flags",
    "supplementary_plane_code_points"
  ]);

  for (const ch of seen) {
    const points = [...ch].map(part => part.codePointAt(0));
    assert.ok(points.every(point => point <= 0xffff), `${ch} stays in the Basic Multilingual Plane`);
    assert.ok(!points.includes(0x200d), `${ch} is not a ZWJ sequence`);
    assert.ok(!points.some(point => point >= 0x1f3fb && point <= 0x1f3ff), `${ch} has no emoji modifier`);
    assert.ok(points.filter(point => point >= 0x1f1e6 && point <= 0x1f1ff).length < 2, `${ch} is not a regional flag`);
  }
});

test("CSV export mirrors the reviewed dataset", () => {
  const rows = parseCsv(csv);
  assert.deepEqual(rows[0], ["emoji", "name", "category", "compatibility_rating", "sequence_type", "code_points", "notes", "keywords"]);
  assert.equal(rows.length - 1, index.items.length);
  const csvChars = new Set(rows.slice(1).map(r => r[0]));
  assert.equal(csvChars.size, index.items.length);
  for (const item of index.items) assert.ok(csvChars.has(item.char), `CSV includes ${item.char}`);
  assert.ok(rows.slice(1).every(r => r[3] === "usually_safer"));
  assert.ok(rows.slice(1).every(r => /^(single_code_point|variation_sequence|keycap_sequence|combining_sequence)$/.test(r[4])));
  assert.ok(rows.slice(1).every(r => /^U\+[0-9A-F]{4}( U\+[0-9A-F]{4})*$/.test(r[5])));
});

test("curated copy groups use only reviewed emoji", () => {
  const safe = new Set(index.items.map(i => i.char));
  const groupChars = [...html.matchAll(/data-emoji="([^"]+)"/g)].map(m => m[1]);
  assert.ok(groupChars.length >= 24, "copy groups expose several useful choices");
  for (const ch of groupChars) assert.ok(safe.has(ch), `copy group emoji is reviewed: ${ch}`);
  for (const label of ["Hosting", "Billing", "Support", "Security"]) {
    assert.ok(html.includes(`<h3>${label}</h3>`), `${label} group is present`);
  }
});
