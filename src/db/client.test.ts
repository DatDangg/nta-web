import assert from "node:assert/strict";
import { test } from "node:test";

test("importing the client without DATABASE_URL does not throw; getDb() does", async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const client = await import("./client");
    assert.throws(() => client.getDb(), /DATABASE_URL is not set/);
    await client.closeDb();
  } finally {
    if (previous !== undefined) process.env.DATABASE_URL = previous;
  }
});

test("getDb() creates the pool lazily without connecting", async () => {
  const previous = process.env.DATABASE_URL;
  // Cổng không có server: nếu getDb() tự kết nối thì sẽ lỗi; Pool chỉ kết nối khi query.
  process.env.DATABASE_URL = "postgres://user:fake@127.0.0.1:1/none";
  try {
    const client = await import("./client");
    const db = client.getDb();
    assert.equal(client.getDb(), db);
    await client.closeDb();
  } finally {
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
  }
});
