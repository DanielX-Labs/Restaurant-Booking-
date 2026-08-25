import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
process.env.VERCEL = "1";
const { default: app } = await import("../index.js");

test("health endpoint and JSON 404 are available without a database", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const health = await fetch(`http://127.0.0.1:${port}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { success: true });
  const missing = await fetch(`http://127.0.0.1:${port}/missing`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).success, false);
  const userSession = await fetch(`http://127.0.0.1:${port}/api/auth/is-auth`);
  assert.equal(userSession.status, 200);
  assert.deepEqual(await userSession.json(), { success: true, authenticated: false, user: null });
  const adminSession = await fetch(`http://127.0.0.1:${port}/api/auth/admin/is-auth`);
  assert.equal(adminSession.status, 200);
  assert.deepEqual(await adminSession.json(), { success: true, authenticated: false, admin: null });
});
