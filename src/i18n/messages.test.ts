import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// CR-044 (R-20a mục 3): ja.json phải khớp cấu trúc en.json/vi.json — thiếu key thì next-intl
// rơi về fallback/lỗi lúc render, xem tasks/feature-add-japanese-locale/phase-2-task-01.md.
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const load = (locale: string): Json =>
  JSON.parse(readFileSync(new URL(`./messages/${locale}.json`, import.meta.url), "utf8")) as Json;

const vi = load("vi");
const en = load("en");
const ja = load("ja");

const kindOf = (value: Json): string => (Array.isArray(value) ? "array" : value === null ? "null" : typeof value);

/** Map đường dẫn lá (gồm index mảng) → kiểu lá. */
function collectLeaves(value: Json, path = "", leaves = new Map<string, string>()): Map<string, string> {
  if (Array.isArray(value)) {
    leaves.set(path, `array(${value.length})`);
    value.forEach((item, index) => collectLeaves(item, `${path}[${index}]`, leaves));
  } else if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) collectLeaves(child, path ? `${path}.${key}` : key, leaves);
  } else {
    leaves.set(path, kindOf(value));
  }
  return leaves;
}

function collectStrings(value: Json, path = "", out: Array<[string, string]> = []): Array<[string, string]> {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => collectStrings(item, `${path}[${index}]`, out));
  else if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) collectStrings(child, path ? `${path}.${key}` : key, out);
  }
  return out;
}

/** Tên đối số ICU cấp ngoài cùng (`{name}`, `{count, plural, ...}` → count); bỏ qua nội dung lồng trong plural/select. */
function topLevelArguments(message: string): string[] {
  const names = new Set<string>();
  let depth = 0;
  for (let index = 0; index < message.length; index++) {
    const char = message[index];
    if (char === "{") {
      if (depth === 0) {
        const match = /^\s*([\w-]+)/.exec(message.slice(index + 1));
        if (match) names.add(match[1]);
      }
      depth++;
    } else if (char === "}") {
      depth--;
    }
  }
  return [...names].sort();
}

test("vi, en, ja có cùng tập key đệ quy và cùng kiểu lá (mảng cùng độ dài)", () => {
  const enLeaves = Object.fromEntries(collectLeaves(en));
  assert.deepEqual(Object.fromEntries(collectLeaves(vi)), enLeaves, "vi lệch en");
  assert.deepEqual(Object.fromEntries(collectLeaves(ja)), enLeaves, "ja lệch en");
});

test("ja không có chuỗi rỗng", () => {
  const empty = collectStrings(ja).filter(([, text]) => text.trim() === "").map(([path]) => path);
  assert.deepEqual(empty, []);
});

test("mỗi chuỗi ja giữ đúng tập đối số ICU cấp ngoài cùng như en", () => {
  const enStrings = new Map(collectStrings(en));
  for (const [path, text] of collectStrings(ja)) {
    const source = enStrings.get(path);
    assert.ok(source !== undefined, `en thiếu ${path}`);
    assert.deepEqual(topLevelArguments(text), topLevelArguments(source), `đối số ICU lệch ở ${path}`);
  }
});

test("ja giữ rich-text tag như en", () => {
  const tagsOf = (text: string) => (text.match(/<\/?\w+>/g) ?? []).sort();
  const enStrings = new Map(collectStrings(en));
  for (const [path, text] of collectStrings(ja)) {
    assert.deepEqual(tagsOf(text), tagsOf(enStrings.get(path) ?? ""), `tag lệch ở ${path}`);
  }
});
