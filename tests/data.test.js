const test = require("node:test");
const assert = require("node:assert");
const logic = require("../logic.js");

// Load data.js (browser global style) into a fake global, then read it back.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadData() {
  const code = fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  return sandbox.window.COMPETENCY_DATA;
}

test("data.js: defines a scale with 4 levels", () => {
  const data = loadData();
  assert.strictEqual(data.scale.length, 4);
  assert.deepEqual(data.scale.map(s => s.level), [0, 1, 2, 3]);
});

test("data.js: has the Fastighetsutvecklare role", () => {
  const data = loadData();
  const role = data.roles[0];
  assert.strictEqual(role.title, "Fastighetsutvecklare");
  assert.strictEqual(role.org, "Lejonfastigheter");
});

test("data.js: role passes validation", () => {
  const data = loadData();
  assert.deepStrictEqual(logic.validateRole(data.roles[0]), []);
});

test("data.js: includes the lagkrav leaves PBL, Jordabalken, BFS 2024", () => {
  const data = loadData();
  const ids = logic.collectRoleLeaves(data.roles[0]).map(l => l.id);
  assert.ok(ids.includes("pbl"));
  assert.ok(ids.includes("jordabalken"));
  assert.ok(ids.includes("bfs2024"));
});
