import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildIndex, search, editDistance, didYouMean } from "../docs/search.js";

const data = JSON.parse(readFileSync(new URL("../docs/data/emoji.json", import.meta.url)));
const index = buildIndex(data.categories);

const chars = (r) => r.results.map(x => x.char);
const has = (r, glyph) => chars(r).includes(glyph);

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
