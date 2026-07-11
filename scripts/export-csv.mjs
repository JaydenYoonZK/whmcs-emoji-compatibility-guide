import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../docs/data/emoji.json", import.meta.url), "utf8"));
const rows = [[
  "emoji",
  "name",
  "category",
  "compatibility_rating",
  "sequence_type",
  "code_points",
  "notes",
  "keywords"
]];

function codePoints(value) {
  return [...value].map(char => `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
}

function sequenceType(value) {
  const points = codePoints(value);
  if (points.includes("U+20E3")) return "keycap_sequence";
  if (points.includes("U+FE0F")) return "variation_sequence";
  return points.length === 1 ? "single_code_point" : "combining_sequence";
}

for (const category of data.categories) {
  for (const entry of category.emoji) {
    const emoji = typeof entry === "string" ? { char: entry, name: "", keywords: [] } : entry;
    rows.push([
      emoji.char,
      emoji.name || "",
      category.name,
      "usually_safer",
      sequenceType(emoji.char),
      codePoints(emoji.char).join(" "),
      "Conservative BMP-only shortlist; test in your own WHMCS database, template, and mail pipeline.",
      (emoji.keywords || []).join("; ")
    ]);
  }
}

const escapeCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

writeFileSync(
  new URL("../docs/data/emoji.csv", import.meta.url),
  rows.map(row => row.map(escapeCell).join(",")).join("\n") + "\n"
);
