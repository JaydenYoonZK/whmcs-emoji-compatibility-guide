import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildIndex, search, editDistance, didYouMean } from "../docs/search.js";

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
  assert.ok(index.items.length >= 180);
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

test("typo still finds the target", () => {
  assert.ok(has(search(index, "hart"), "❤️"), "hart -> heart");
  assert.ok(search(index, "wraning").results.some(r => r.char === "⚠️"), "wraning -> warning");
  assert.ok(search(index, "arow").results.some(r => r.char.length && r.char.includes("➡")) ||
            search(index, "arow").results.length > 0, "arow -> arrow");
});

test("did-you-mean suggests a close term for a typo", () => {
  const s = didYouMean(index, ["chekc"]);
  assert.equal(s, "check");
});

test("exact word does not trigger a suggestion", () => {
  assert.equal(didYouMean(index, ["heart"]), null);
});

test("pasting an emoji glyph finds itself", () => {
  assert.ok(has(search(index, "⚠️"), "⚠️"));
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

test("dataset integrity: well-formed, unique, and reviewed", () => {
  assert.equal(data.schema, 3, "schema version present");
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
  assert.ok(count >= 180, `at least 180 curated emoji (got ${count})`);
});

test("CSV export mirrors the reviewed dataset", () => {
  const rows = parseCsv(csv);
  assert.deepEqual(rows[0], ["emoji", "name", "category", "safety_rating", "notes", "keywords"]);
  assert.equal(rows.length - 1, index.items.length);
  const csvChars = new Set(rows.slice(1).map(r => r[0]));
  assert.equal(csvChars.size, index.items.length);
  for (const item of index.items) assert.ok(csvChars.has(item.char), `CSV includes ${item.char}`);
  assert.ok(rows.slice(1).every(r => r[3] === "usually_safe"));
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
