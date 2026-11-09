import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPostDate } from "./date";

test("formatPostDate: vi/en giữ định dạng cũ, ja → YYYY年M月D日 (CR-044)", () => {
  assert.equal(formatPostDate("2026-11-09", "vi"), "09 Th11, 2026");
  assert.equal(formatPostDate("2026-11-09", "en"), "Nov 9, 2026");
  assert.equal(formatPostDate("2026-11-09", "ja"), "2026年11月9日");
  assert.equal(formatPostDate("2026-10-08T23:30:00Z", "ja"), "2026年10月8日");
});
