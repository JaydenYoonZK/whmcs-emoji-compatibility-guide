import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../docs/data/emoji.json", import.meta.url), "utf8"));
const rows = [[
  "emoji",
  "name",
  "category",
  "safety_rating",
  "notes",
  "keywords"
]];

for (const category of data.categories) {
  for (const entry of category.emoji) {
    const emoji = typeof entry === "string" ? { char: entry, name: "", keywords: [] } : entry;
    rows.push([
      emoji.char,
      emoji.name || "",
      category.name,
      "usually_safe",
      "Curated older Unicode symbol; test in your own WHMCS stack before billing-critical use.",
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
