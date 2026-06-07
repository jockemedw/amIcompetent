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
  assert.deepStrictEqual([...data.scale].map(s => s.level), [0, 1, 2, 3]);
  assert.deepStrictEqual([...data.scale].map(s => s.label), ["Ingen", "Grundläggande", "Kompetent", "Expert"]);
});

test("data.js: Fastighetsutvecklare is the first role", () => {
  const data = loadData();
  const role = data.roles[0];
  assert.strictEqual(role.title, "Fastighetsutvecklare");
  assert.strictEqual(role.org, "Lejonfastigheter");
});

test("data.js: has a full set of Lejonfastigheter roles", () => {
  const data = loadData();
  assert.ok(data.roles.length >= 9, "expected at least 9 roles");
  // Every role belongs to Lejonfastigheter and has a non-empty content tree.
  data.roles.forEach(role => {
    assert.strictEqual(role.org, "Lejonfastigheter");
    assert.ok(Array.isArray(role.nodes) && role.nodes.length > 0, role.id + " has nodes");
  });
});

test("data.js: every role passes validation", () => {
  const data = loadData();
  data.roles.forEach(role => {
    assert.deepStrictEqual(logic.validateRole(role), [], "role " + role.id + " is valid");
  });
});

test("data.js: role ids are globally unique", () => {
  const data = loadData();
  const ids = data.roles.map(r => r.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test("data.js: every leaf has a target on the 1–3 scale", () => {
  const data = loadData();
  data.roles.forEach(role => {
    logic.collectRoleLeaves(role).forEach(leaf => {
      assert.ok(
        typeof leaf.target === "number" && leaf.target >= 1 && leaf.target <= 3,
        "leaf " + leaf.id + " in " + role.id + " has a valid target"
      );
    });
  });
});

test("data.js: every leaf carries a full beginner→expert ladder", () => {
  const data = loadData();
  data.roles.forEach(role => {
    logic.collectRoleLeaves(role).forEach(leaf => {
      assert.ok(leaf.levelGuide, "leaf " + leaf.id + " has a levelGuide");
      [1, 2, 3].forEach(level => {
        // A level guide may be a plain string or a deepened { summary, indicators }
        // object — normalizeGuide unifies both. Either way it must describe the level.
        const g = logic.normalizeGuide(leaf.levelGuide[level]);
        assert.ok(g.summary.length > 0, "leaf " + leaf.id + " describes level " + level);
        assert.ok(Array.isArray(g.indicators), "leaf " + leaf.id + " level " + level + " has indicators array");
      });
    });
  });
});

test("data.js: the flagship role's levels are deepened with indicators", () => {
  const data = loadData();
  const flagship = data.roles[0];
  logic.collectRoleLeaves(flagship).forEach(leaf => {
    [1, 2, 3].forEach(level => {
      const g = logic.normalizeGuide(leaf.levelGuide[level]);
      assert.ok(
        g.indicators.length >= 2,
        "flagship leaf " + leaf.id + " level " + level + " lists concrete indicators"
      );
    });
  });
});

test("data.js: Fastighetsutvecklare is the deepest, flagship role", () => {
  const data = loadData();
  const flagship = data.roles[0];
  const leaves = logic.collectRoleLeaves(flagship);
  assert.ok(leaves.length >= 30, "flagship has rich coverage");
  // It is at least as deep as any other role.
  data.roles.slice(1).forEach(role => {
    assert.ok(
      leaves.length >= logic.collectRoleLeaves(role).length,
      "flagship is at least as deep as " + role.id
    );
  });
});

test("data.js: includes the lagkrav leaves PBL, Jordabalken, BFS/BBR", () => {
  const data = loadData();
  const ids = logic.collectRoleLeaves(data.roles[0]).map(l => l.id);
  assert.ok(ids.includes("pbl"));
  assert.ok(ids.includes("jordabalken"));
  assert.ok(ids.includes("bfs2024"));
});
