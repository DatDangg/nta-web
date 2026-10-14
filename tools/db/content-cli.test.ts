// Parse cờ của content-cli (CR-034 review F5): cờ chỉ dành cho lệnh khác → từ chối (exit 2) TRƯỚC khi chạm DB.
// Chạy CLI thật bằng tiến trình con, DATABASE_URL trỏ cổng đóng → nếu lọt qua bước kiểm cờ thì lỗi kết nối (exit 1), không phải 2.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

function runCli(args: string[]) {
  const result = spawnSync(process.execPath, ["--import", "tsx", "tools/db/content-cli.ts", ...args], {
    encoding: "utf8",
    env: { ...process.env, DATABASE_URL: "postgres://nobody@127.0.0.1:1/none" },
  });
  return { status: result.status, stderr: result.stderr };
}

describe("content-cli — cờ theo lệnh", () => {
  it("rollback --dry-run bị từ chối (không được ghi thật khi người dùng tưởng là thử)", () => {
    const { status, stderr } = runCli(["rollback", "post/vi/x", "--to", "1", "--expected-version", "2", "--dry-run", "--confirm-prod"]);
    assert.equal(status, 2);
    assert.match(stderr, /--dry-run chỉ dùng với: publish-post/);
  });

  it("--actor ngoài publish-post bị từ chối", () => {
    const { status, stderr } = runCli(["upload", "a.png", "--actor", "x"]);
    assert.equal(status, 2);
    assert.match(stderr, /--actor chỉ dùng với: publish-post/);
  });

  it("--note ngoài rollback/publish-post bị từ chối", () => {
    const { status, stderr } = runCli(["list", "--note", "x"]);
    assert.equal(status, 2);
    assert.match(stderr, /--note chỉ dùng với: rollback, publish-post/);
  });

  it("publish-post nhận --dry-run (qua bước kiểm cờ, tới bước đọc file)", () => {
    const { status, stderr } = runCli(["publish-post", "ai-weekly-2099-w01", "--dry-run", "--note", "n", "--actor", "a"]);
    assert.equal(status, 1);
    assert.match(stderr, /không tìm thấy file/);
  });
});
