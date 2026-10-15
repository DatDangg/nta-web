// Parse cờ của content-cli (CR-034 review F5, CR-030): cờ sai lệnh / --file sai hình dạng → từ chối (exit 2) TRƯỚC khi chạm DB.
// Chạy CLI thật bằng tiến trình con, DATABASE_URL trỏ cổng đóng → nếu lọt qua bước kiểm cờ thì lỗi kết nối (exit 1), không phải 2.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

function runCli(args: string[], input?: string, env: Record<string, string> = {}) {
  const result = spawnSync(process.execPath, ["--import", "tsx", "tools/db/content-cli.ts", ...args], {
    encoding: "utf8",
    input,
    env: { ...process.env, DATABASE_URL: "postgres://nobody@127.0.0.1:1/none", ...env },
  });
  return { status: result.status, stderr: result.stderr };
}

describe("content-cli — cờ theo lệnh", () => {
  it("rollback --dry-run bị từ chối (không được ghi thật khi người dùng tưởng là thử)", () => {
    const { status, stderr } = runCli(["rollback", "post/vi/x", "--to", "1", "--expected-version", "2", "--dry-run", "--confirm-prod"]);
    assert.equal(status, 2);
    assert.match(stderr, /--dry-run chỉ dùng với: publish-post/);
  });

  it("--actor ngoài create/update/delete/publish-post bị từ chối", () => {
    const { status, stderr } = runCli(["upload", "a.png", "--actor", "x"]);
    assert.equal(status, 2);
    assert.match(stderr, /--actor chỉ dùng với: create, update, delete, publish-post/);
  });

  it("--note ngoài lệnh ghi nội dung bị từ chối", () => {
    const { status, stderr } = runCli(["list", "--note", "x"]);
    assert.equal(status, 2);
    assert.match(stderr, /--note chỉ dùng với: rollback, create, update, delete, publish-post/);
  });

  it("--file / --confirm-public-url-change sai lệnh bị từ chối", () => {
    assert.match(runCli(["delete", "1", "--expected-version", "1", "--file", "-"]).stderr, /--file chỉ dùng với: create, update/);
    const { status, stderr } = runCli(["update", "1", "--file", "-", "--expected-version", "1", "--confirm-public-url-change"], "{}");
    assert.equal(status, 2);
    assert.match(stderr, /--confirm-public-url-change chỉ dùng với: delete/);
  });

  it("publish-post nhận --dry-run (qua bước kiểm cờ, tới bước đọc file)", () => {
    const { status, stderr } = runCli(["publish-post", "ai-weekly-2099-w01", "--dry-run", "--note", "n", "--actor", "a"]);
    assert.equal(status, 1);
    assert.match(stderr, /không tìm thấy file/);
  });
});

describe("content-cli — create/update/delete (CR-030)", () => {
  it("create thiếu --file → exit 2", () => {
    const { status, stderr } = runCli(["create", "post/vi/x"]);
    assert.equal(status, 2);
    assert.match(stderr, /create cần --file/);
  });

  it("create sai dạng collection/locale/slug → exit 2", () => {
    assert.equal(runCli(["create", "post/x", "--file", "-"], '{"data":{}}').status, 2);
  });

  it("--file JSON hỏng → exit 2", () => {
    const { status, stderr } = runCli(["create", "post/vi/x", "--file", "-"], "{không phải json");
    assert.equal(status, 2);
    assert.match(stderr, /JSON không hợp lệ/);
  });

  it("--file data không phải object → exit 2", () => {
    const { status, stderr } = runCli(["create", "post/vi/x", "--file", "-"], '{"data":[1]}');
    assert.equal(status, 2);
    assert.match(stderr, /data bắt buộc là object/);
  });

  it("--file có key lạ → exit 2", () => {
    const { status, stderr } = runCli(["create", "post/vi/x", "--file", "-"], '{"data":{},"slug":"y"}');
    assert.equal(status, 2);
    assert.match(stderr, /key lạ: slug/);
  });

  it("update thiếu --expected-version → exit 2", () => {
    const { status, stderr } = runCli(["update", "post/vi/x", "--file", "-"], '{"data":{}}');
    assert.equal(status, 2);
    assert.match(stderr, /--expected-version phải là số nguyên/);
  });

  it("delete thiếu --expected-version → exit 2", () => {
    assert.equal(runCli(["delete", "post/vi/x"]).status, 2);
  });

  it("--expected-version ngoài rollback/update/delete bị từ chối", () => {
    const { status, stderr } = runCli(["create", "post/vi/x", "--file", "-", "--expected-version", "5"], '{"data":{}}');
    assert.equal(status, 2);
    assert.match(stderr, /--expected-version chỉ dùng với: rollback, update, delete/);
  });

  it("--actor rỗng / chỉ khoảng trắng → exit 2", () => {
    const { status, stderr } = runCli(["delete", "7", "--expected-version", "2", "--actor", "  "]);
    assert.equal(status, 2);
    assert.match(stderr, /--actor không được rỗng/);
    assert.equal(runCli(["create", "post/vi/x", "--file", "-", "--actor", ""], '{"data":{}}').status, 2);
  });

  it("DB prod thiếu --confirm-prod → exit 2 (create/update/delete)", () => {
    const prod = { DATABASE_URL: "postgres://x@nta-db:5432/nta_web" };
    const payload = '{"data":{}}';
    for (const args of [
      ["create", "post/vi/x", "--file", "-"],
      ["update", "post/vi/x", "--file", "-", "--expected-version", "2"],
      ["delete", "post/vi/x", "--expected-version", "2"],
    ]) {
      const { status, stderr } = runCli(args, payload, prod);
      assert.equal(status, 2, args[0]);
      assert.match(stderr, /--confirm-prod/);
    }
  });

  it("lệnh hợp lệ qua bước kiểm cờ, tới DB (lỗi kết nối → exit 1)", () => {
    const payload = '{"data":{"title":"x"},"body":null,"sortOrder":1}';
    assert.equal(runCli(["create", "post/vi/x", "--file", "-", "--actor", "bot:1", "--note", "n"], payload).status, 1);
    assert.equal(runCli(["update", "post/vi/x", "--file", "-", "--expected-version", "2"], payload).status, 1);
    assert.equal(runCli(["delete", "7", "--expected-version", "2", "--confirm-public-url-change", "--actor", "bot:1"]).status, 1);
  });
});
