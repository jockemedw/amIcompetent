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

module.exports = { fixtureRole };
