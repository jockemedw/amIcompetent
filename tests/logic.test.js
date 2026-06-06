const test = require("node:test");
const assert = require("node:assert");
const logic = require("../logic.js");

const fixtureRole = {
  id: "r1",
  title: "Testroll",
  org: "Test",
  nodes: [
    { id: "cat-a", title: "Kategori A", children: [
      { id: "skill-x", title: "Färdighet X", children: [
        { id: "leaf-1", title: "Löv 1", target: 3 },
        { id: "leaf-2", title: "Löv 2", target: 2 }
      ]}
    ]},
    { id: "leaf-3", title: "Direkt löv", target: 1 }
  ]
};

test("isLeaf: node without children is a leaf", () => {
  assert.strictEqual(logic.isLeaf({ id: "x", target: 1 }), true);
});

test("isLeaf: node with children is not a leaf", () => {
  assert.strictEqual(logic.isLeaf({ id: "x", children: [{ id: "y", target: 1 }] }), false);
});

test("collectLeaves: returns all leaves under a node recursively", () => {
  const leaves = logic.collectLeaves(fixtureRole.nodes[0]);
  assert.deepStrictEqual(leaves.map(l => l.id), ["leaf-1", "leaf-2"]);
});

test("collectRoleLeaves: flattens all leaves across the role", () => {
  const leaves = logic.collectRoleLeaves(fixtureRole);
  assert.deepStrictEqual(leaves.map(l => l.id), ["leaf-1", "leaf-2", "leaf-3"]);
});

test("getLevel: returns stored level", () => {
  assert.strictEqual(logic.getLevel({ "leaf-1": 2 }, "leaf-1"), 2);
});

test("getLevel: returns DEFAULT_LEVEL when unset", () => {
  assert.strictEqual(logic.getLevel({}, "leaf-1"), logic.DEFAULT_LEVEL);
});

test("leafGap: target minus level", () => {
  const leaf = { id: "leaf-1", target: 3 };
  assert.strictEqual(logic.leafGap(leaf, { "leaf-1": 1 }), 2);
});

test("leafGap: zero or negative when met or exceeded", () => {
  const leaf = { id: "leaf-1", target: 2 };
  assert.strictEqual(logic.leafGap(leaf, { "leaf-1": 3 }), -1);
});

test("isLeafMet: true when level >= target", () => {
  const leaf = { id: "leaf-1", target: 2 };
  assert.strictEqual(logic.isLeafMet(leaf, { "leaf-1": 2 }), true);
  assert.strictEqual(logic.isLeafMet(leaf, { "leaf-1": 1 }), false);
});

module.exports = { fixtureRole };
