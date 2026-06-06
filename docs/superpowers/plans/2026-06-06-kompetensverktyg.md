# Kompetensöverblick & Självskattning — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained HTML tool that shows what a job role needs to master, lets the user self-assess on a level scale, and surfaces the gap as a development plan.

**Architecture:** Vanilla HTML/CSS/JS with no build step. Content lives in `data.js` as a browser global. Pure logic (gap/summary/plan/validation) lives in `logic.js`, written so it works both as a browser `<script>` global and as a Node module — enabling automated tests via Node's built-in `node:test`. DOM rendering and `localStorage` persistence live in `app.js` and are verified in the browser.

**Tech Stack:** HTML5, CSS3, ES5-compatible vanilla JavaScript, `<details>`/`<summary>` for the accordion, `localStorage` for persistence, `node:test` for unit tests (no npm dependencies).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `index.html` | Page structure, loads the three scripts in order |
| `styles.css` | Visual styling |
| `logic.js` | Pure functions: leaf detection, gap, summaries, development plan, validation. Dual browser-global / Node-module. |
| `app.js` | DOM rendering, event handling, `localStorage` persistence. Uses `logic.js`. |
| `data.js` | Content: the role, categories, skills, legal requirements, recommended levels. Sets `window.COMPETENCY_DATA`. |
| `tests/logic.test.js` | Node tests for `logic.js`. |

Load order in `index.html`: `data.js` → `logic.js` → `app.js`.

---

## Task 1: Logic — leaf detection and leaf collection

**Files:**
- Create: `logic.js`
- Test: `tests/logic.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/logic.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — `Cannot find module '../logic.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `logic.js`:

```js
// Pure logic for the competency tool. No DOM access.
// Works as a browser global (window.CompetencyLogic) and as a Node module.
(function (root) {
  var DEFAULT_LEVEL = 0;

  function isLeaf(node) {
    return !node.children || node.children.length === 0;
  }

  function collectLeaves(node) {
    if (isLeaf(node)) return [node];
    return node.children.reduce(function (acc, child) {
      return acc.concat(collectLeaves(child));
    }, []);
  }

  function collectRoleLeaves(role) {
    return role.nodes.reduce(function (acc, node) {
      return acc.concat(collectLeaves(node));
    }, []);
  }

  var api = {
    DEFAULT_LEVEL: DEFAULT_LEVEL,
    isLeaf: isLeaf,
    collectLeaves: collectLeaves,
    collectRoleLeaves: collectRoleLeaves
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.CompetencyLogic = api;
  }
})(typeof self !== "undefined" ? self : this);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add logic.js tests/logic.test.js
git commit -m "feat: leaf detection and leaf collection logic"
```

---

## Task 2: Logic — levels, gap, and met-checks

**Files:**
- Modify: `logic.js`
- Test: `tests/logic.test.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/logic.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — `logic.getLevel is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `logic.js`, add these functions before the `var api = {` line:

```js
  function getLevel(levels, leafId) {
    return Object.prototype.hasOwnProperty.call(levels, leafId)
      ? levels[leafId]
      : DEFAULT_LEVEL;
  }

  function leafGap(leaf, levels) {
    return leaf.target - getLevel(levels, leaf.id);
  }

  function isLeafMet(leaf, levels) {
    return getLevel(levels, leaf.id) >= leaf.target;
  }
```

Then add them to the `api` object:

```js
  var api = {
    DEFAULT_LEVEL: DEFAULT_LEVEL,
    isLeaf: isLeaf,
    collectLeaves: collectLeaves,
    collectRoleLeaves: collectRoleLeaves,
    getLevel: getLevel,
    leafGap: leafGap,
    isLeafMet: isLeafMet
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS — all tests passing.

- [ ] **Step 5: Commit**

```bash
git add logic.js tests/logic.test.js
git commit -m "feat: level lookup, gap, and met-checks"
```

---

## Task 3: Logic — node and role summaries

**Files:**
- Modify: `logic.js`
- Test: `tests/logic.test.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/logic.test.js`:

```js
test("summarizeNode: counts met leaves out of total under a node", () => {
  // cat-a has leaf-1 (target 3) and leaf-2 (target 2)
  const node = fixtureRole.nodes[0];
  const result = logic.summarizeNode(node, { "leaf-1": 3, "leaf-2": 1 });
  assert.deepStrictEqual(result, { met: 1, total: 2 });
});

test("summarizeNode: a direct leaf node summarizes itself", () => {
  const node = fixtureRole.nodes[1]; // leaf-3, target 1
  assert.deepStrictEqual(logic.summarizeNode(node, { "leaf-3": 1 }), { met: 1, total: 1 });
  assert.deepStrictEqual(logic.summarizeNode(node, {}), { met: 0, total: 1 });
});

test("summarizeRole: counts across all role leaves", () => {
  const result = logic.summarizeRole(fixtureRole, { "leaf-1": 3, "leaf-2": 2, "leaf-3": 0 });
  assert.deepStrictEqual(result, { met: 2, total: 3 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — `logic.summarizeNode is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `logic.js`, add before the `var api = {` line:

```js
  function summarizeNode(node, levels) {
    var leaves = collectLeaves(node);
    var met = leaves.filter(function (leaf) { return isLeafMet(leaf, levels); }).length;
    return { met: met, total: leaves.length };
  }

  function summarizeRole(role, levels) {
    var leaves = collectRoleLeaves(role);
    var met = leaves.filter(function (leaf) { return isLeafMet(leaf, levels); }).length;
    return { met: met, total: leaves.length };
  }
```

Add to the `api` object:

```js
    summarizeNode: summarizeNode,
    summarizeRole: summarizeRole,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js tests/logic.test.js
git commit -m "feat: node and role summaries"
```

---

## Task 4: Logic — development plan builder

**Files:**
- Modify: `logic.js`
- Test: `tests/logic.test.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/logic.test.js`:

```js
test("buildDevelopmentPlan: groups gaps by top-level category, sorted by gap desc", () => {
  // leaf-1 target 3 @ level 0 => gap 3; leaf-2 target 2 @ level 2 => gap 0 (excluded)
  // leaf-3 target 1 @ level 0 => gap 1
  const plan = logic.buildDevelopmentPlan(fixtureRole, { "leaf-2": 2 });
  assert.strictEqual(plan.length, 2);
  assert.strictEqual(plan[0].category, "Kategori A");
  assert.deepStrictEqual(plan[0].items.map(i => [i.leaf.id, i.gap]), [["leaf-1", 3]]);
  assert.strictEqual(plan[1].category, "Direkt löv");
  assert.deepStrictEqual(plan[1].items.map(i => [i.leaf.id, i.gap]), [["leaf-3", 1]]);
});

test("buildDevelopmentPlan: omits categories with no gaps", () => {
  const plan = logic.buildDevelopmentPlan(fixtureRole, {
    "leaf-1": 3, "leaf-2": 2, "leaf-3": 1
  });
  assert.deepStrictEqual(plan, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — `logic.buildDevelopmentPlan is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `logic.js`, add before the `var api = {` line:

```js
  function buildDevelopmentPlan(role, levels) {
    return role.nodes.map(function (node) {
      var items = collectLeaves(node)
        .filter(function (leaf) { return leafGap(leaf, levels) > 0; })
        .map(function (leaf) { return { leaf: leaf, gap: leafGap(leaf, levels) }; })
        .sort(function (a, b) { return b.gap - a.gap; });
      return { category: node.title, items: items };
    }).filter(function (group) { return group.items.length > 0; });
  }
```

Add to the `api` object:

```js
    buildDevelopmentPlan: buildDevelopmentPlan,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js tests/logic.test.js
git commit -m "feat: development plan builder"
```

---

## Task 5: Logic — data validation

**Files:**
- Modify: `logic.js`
- Test: `tests/logic.test.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/logic.test.js`:

```js
test("validateRole: no errors for a valid role", () => {
  assert.deepStrictEqual(logic.validateRole(fixtureRole), []);
});

test("validateRole: flags duplicate ids", () => {
  const role = { id: "r", title: "R", nodes: [
    { id: "dup", title: "A", target: 1 },
    { id: "dup", title: "B", target: 1 }
  ]};
  assert.ok(logic.validateRole(role).some(e => e.includes("Duplicate id: dup")));
});

test("validateRole: flags leaf without numeric target", () => {
  const role = { id: "r", title: "R", nodes: [
    { id: "x", title: "X" }
  ]};
  assert.ok(logic.validateRole(role).some(e => e.includes("missing numeric target: x")));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — `logic.validateRole is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `logic.js`, add before the `var api = {` line:

```js
  function validateRole(role) {
    var errors = [];
    var seen = {};
    function walk(node) {
      if (seen[node.id]) errors.push("Duplicate id: " + node.id);
      seen[node.id] = true;
      if (isLeaf(node)) {
        if (typeof node.target !== "number") {
          errors.push("Leaf missing numeric target: " + node.id);
        }
      } else {
        node.children.forEach(walk);
      }
    }
    role.nodes.forEach(walk);
    return errors;
  }
```

Add to the `api` object:

```js
    validateRole: validateRole
```

(Note: the property added in Task 4 ends with a comma; this last property has no trailing comma. Ensure the object remains valid.)

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS — all logic tests passing.

- [ ] **Step 5: Commit**

```bash
git add logic.js tests/logic.test.js
git commit -m "feat: role data validation"
```

---

## Task 6: Content — the Fastighetsutvecklare role

**Files:**
- Create: `data.js`
- Test: `tests/data.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/data.test.js`:

```js
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
  assert.deepStrictEqual(data.scale.map(s => s.level), [0, 1, 2, 3]);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — `ENOENT` reading `data.js`.

- [ ] **Step 3: Write minimal implementation**

Create `data.js`:

```js
window.COMPETENCY_DATA = {
  scale: [
    { level: 0, label: "Ingen" },
    { level: 1, label: "Grundläggande" },
    { level: 2, label: "Kompetent" },
    { level: 3, label: "Expert" }
  ],
  roles: [{
    id: "fastighetsutvecklare-lejon",
    title: "Fastighetsutvecklare",
    org: "Lejonfastigheter",
    nodes: [
      {
        id: "juridik",
        title: "Juridik & lagkrav",
        children: [
          {
            id: "lagkrav",
            title: "Kännedom om lagkrav",
            children: [
              { id: "pbl", title: "PBL (Plan- och bygglagen)", target: 3,
                description: "Plan- och byggprocessen, bygglov, detaljplaners rättsverkan." },
              { id: "jordabalken", title: "Jordabalken", target: 2,
                description: "Fastighetsköp, servitut, nyttjanderätt och hyresförhållanden." },
              { id: "bfs2024", title: "BFS 2024 (Boverkets byggregler)", target: 1,
                description: "Boverkets gällande byggregler och dess tillämpning." }
            ]
          }
        ]
      },
      {
        id: "ekonomi",
        title: "Ekonomi & kalkyl",
        children: [
          { id: "investeringskalkyl", title: "Investeringskalkylering", target: 3,
            description: "Nuvärde, internränta, känslighetsanalys för investeringsbeslut." },
          { id: "fastighetsvardering", title: "Fastighetsvärdering", target: 2,
            description: "Avkastnings-, orts- och produktionskostnadsmetoder." }
        ]
      },
      {
        id: "planering",
        title: "Planering & process",
        children: [
          { id: "detaljplaner", title: "Detaljplaner", target: 3,
            description: "Läsa, tolka och driva detaljplaneprocesser." },
          { id: "projektledning", title: "Projektledning", target: 3,
            description: "Driva utvecklingsprojekt: tid, budget, intressenter och risk." }
        ]
      }
    ]
  }]
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS — data tests and all logic tests passing.

- [ ] **Step 5: Commit**

```bash
git add data.js tests/data.test.js
git commit -m "feat: Fastighetsutvecklare role content"
```

---

## Task 7: Page scaffold and styling

**Files:**
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kompetensöverblick</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header id="role-header"></header>
  <nav id="view-tabs">
    <button type="button" data-view="overview" class="active">Översikt</button>
    <button type="button" data-view="plan">Utvecklingsplan</button>
  </nav>
  <main>
    <section id="overview-view"></section>
    <section id="plan-view" hidden></section>
  </main>
  <script src="data.js"></script>
  <script src="logic.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `styles.css`**

```css
:root {
  --bg: #f7f8fa;
  --surface: #ffffff;
  --border: #e3e6eb;
  --text: #1f2733;
  --muted: #6b7480;
  --accent: #2f6f4f;
  --warn: #b4641e;
  --met: #2f6f4f;
  --gap: #b4641e;
  --radius: 10px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}

#role-header {
  padding: 2rem 1.5rem 1rem;
  max-width: 820px;
  margin: 0 auto;
}
#role-header h1 { margin: 0; font-size: 1.6rem; }
#role-header .org { color: var(--muted); font-weight: 500; }
#role-header .overview-badge {
  margin-top: 0.75rem;
  display: inline-block;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.9rem;
}

#view-tabs {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  gap: 0.5rem;
}
#view-tabs button {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
}
#view-tabs button.active { color: var(--text); font-weight: 600; border-bottom-color: var(--surface); }

main { max-width: 820px; margin: 0 auto; padding: 1rem 1.5rem 3rem; }

details {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 0.6rem;
}
details details { margin: 0.5rem 0.75rem; }
summary {
  cursor: pointer;
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
}
summary::-webkit-details-marker { display: none; }
summary .summary-badge {
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--muted);
  white-space: nowrap;
}
summary .summary-badge.has-gap { color: var(--gap); }

.leaf {
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border);
}
.leaf:first-child { border-top: none; }
.leaf-head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
.leaf-title { font-weight: 600; }
.leaf-target { font-size: 0.8rem; color: var(--muted); white-space: nowrap; }
.leaf-desc { color: var(--muted); font-size: 0.9rem; margin: 0.25rem 0 0.5rem; }
.leaf select {
  font-size: 0.9rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
}
.leaf.below-target { border-left: 3px solid var(--gap); }
.leaf.met { border-left: 3px solid var(--met); }

.plan-group { margin-bottom: 1.25rem; }
.plan-group h2 { font-size: 1.05rem; margin: 0 0 0.5rem; }
.plan-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--gap);
  border-radius: var(--radius);
  padding: 0.6rem 0.9rem;
  margin-bottom: 0.4rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.plan-gap { color: var(--gap); font-size: 0.85rem; white-space: nowrap; }
.plan-empty { color: var(--muted); }
```

- [ ] **Step 3: Commit**

```bash
git add index.html styles.css
git commit -m "feat: page scaffold and styling"
```

---

## Task 8: Rendering — accordion tree with summaries and role overview

**Files:**
- Create: `app.js`

- [ ] **Step 1: Create `app.js`**

```js
(function () {
  var logic = window.CompetencyLogic;
  var data = window.COMPETENCY_DATA;
  var role = data.roles[0];
  var scale = data.scale;
  var STORAGE_PREFIX = "amicompetent:";

  function storageKey() { return STORAGE_PREFIX + role.id; }

  function loadLevels() {
    try {
      return JSON.parse(localStorage.getItem(storageKey())) || {};
    } catch (e) {
      return {};
    }
  }

  function saveLevels(levels) {
    localStorage.setItem(storageKey(), JSON.stringify(levels));
  }

  var levels = loadLevels();

  function labelForLevel(level) {
    for (var i = 0; i < scale.length; i++) {
      if (scale[i].level === level) return scale[i].label;
    }
    return String(level);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function summaryBadgeText(node) {
    var s = logic.summarizeNode(node, levels);
    return s.met + " av " + s.total + " på rekommenderad nivå";
  }

  function renderLeaf(leaf) {
    var met = logic.isLeafMet(leaf, levels);
    var wrap = el("div", "leaf " + (met ? "met" : "below-target"));

    var head = el("div", "leaf-head");
    head.appendChild(el("span", "leaf-title", leaf.title));
    head.appendChild(el("span", "leaf-target", "Mål: " + labelForLevel(leaf.target)));
    wrap.appendChild(head);

    if (leaf.description) {
      wrap.appendChild(el("p", "leaf-desc", leaf.description));
    }

    var select = el("select");
    select.setAttribute("data-leaf-id", leaf.id);
    var current = logic.getLevel(levels, leaf.id);
    scale.forEach(function (s) {
      var opt = el("option", null, s.label);
      opt.value = String(s.level);
      if (s.level === current) opt.selected = true;
      select.appendChild(opt);
    });
    wrap.appendChild(select);

    return wrap;
  }

  function renderNode(node) {
    if (logic.isLeaf(node)) return renderLeaf(node);

    var details = el("details");
    details.open = false;
    var summary = el("summary");
    summary.appendChild(el("span", "summary-title", node.title));
    var s = logic.summarizeNode(node, levels);
    var badge = el("span", "summary-badge" + (s.met < s.total ? " has-gap" : ""), summaryBadgeText(node));
    summary.appendChild(badge);
    details.appendChild(summary);

    node.children.forEach(function (child) {
      details.appendChild(renderNode(child));
    });
    return details;
  }

  function renderHeader() {
    var header = document.getElementById("role-header");
    header.innerHTML = "";
    header.appendChild(el("h1", null, role.title));
    header.appendChild(el("div", "org", role.org));
    var s = logic.summarizeRole(role, levels);
    header.appendChild(el("div", "overview-badge",
      s.met + " av " + s.total + " färdigheter på rekommenderad nivå"));
  }

  function renderOverview() {
    var view = document.getElementById("overview-view");
    view.innerHTML = "";
    role.nodes.forEach(function (node) {
      view.appendChild(renderNode(node));
    });
  }

  function render() {
    renderHeader();
    renderOverview();
  }

  // Re-render on any level change (state lives in localStorage + `levels`).
  document.addEventListener("change", function (e) {
    var target = e.target;
    if (target.tagName === "SELECT" && target.getAttribute("data-leaf-id")) {
      var id = target.getAttribute("data-leaf-id");
      levels[id] = parseInt(target.value, 10);
      saveLevels(levels);
      render();
    }
  });

  render();
  window.__competencyRender = render; // used by the view-tab task
})();
```

- [ ] **Step 2: Verify in the browser**

Run (PowerShell): `Invoke-Item index.html`
Expected:
- Header shows "Fastighetsutvecklare", "Lejonfastigheter", and an overview badge like "0 av 7 färdigheter på rekommenderad nivå".
- Three top-level categories appear as collapsed accordions: "Juridik & lagkrav", "Ekonomi & kalkyl", "Planering & process", each with a summary badge.
- Expanding "Juridik & lagkrav" → "Kännedom om lagkrav" reveals PBL, Jordabalken, BFS 2024, each with a description, a "Mål:" label, and a level dropdown.
- Changing a dropdown updates the parent badges and the header overview badge, and the change survives a page reload.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: accordion rendering, summaries, and persistence"
```

---

## Task 9: Development plan view and tab switching

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add plan rendering and tab logic**

In `app.js`, replace the `render` function and the line `window.__competencyRender = render;` with:

```js
  function renderPlan() {
    var view = document.getElementById("plan-view");
    view.innerHTML = "";
    var plan = logic.buildDevelopmentPlan(role, levels);
    if (plan.length === 0) {
      view.appendChild(el("p", "plan-empty",
        "Inga gap — du är på rekommenderad nivå för alla färdigheter."));
      return;
    }
    plan.forEach(function (group) {
      var groupEl = el("div", "plan-group");
      groupEl.appendChild(el("h2", null, group.category));
      group.items.forEach(function (item) {
        var itemEl = el("div", "plan-item");
        itemEl.appendChild(el("span", "plan-item-title", item.leaf.title));
        itemEl.appendChild(el("span", "plan-gap",
          "Mål: " + labelForLevel(item.leaf.target) +
          " (nu: " + labelForLevel(logic.getLevel(levels, item.leaf.id)) + ")"));
        groupEl.appendChild(itemEl);
      });
      view.appendChild(groupEl);
    });
  }

  function render() {
    renderHeader();
    renderOverview();
    renderPlan();
  }

  // Tab switching between Översikt and Utvecklingsplan.
  document.getElementById("view-tabs").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-view]");
    if (!btn) return;
    var view = btn.getAttribute("data-view");
    var buttons = this.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle("active", buttons[i] === btn);
    }
    document.getElementById("overview-view").hidden = (view !== "overview");
    document.getElementById("plan-view").hidden = (view !== "plan");
  });

  render();
```

- [ ] **Step 2: Verify in the browser**

Run (PowerShell): `Invoke-Item index.html`
Expected:
- Clicking "Utvecklingsplan" hides the tree and shows gaps grouped by category, each item showing target and current level.
- With all dropdowns at "Ingen", every leaf with a positive target appears, sorted by largest gap first within each category.
- Raising every dropdown to its target (or above) and reopening the plan shows "Inga gap — du är på rekommenderad nivå för alla färdigheter."
- Clicking "Översikt" returns to the tree.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: development plan view and tab switching"
```

---

## Task 10: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `node --test`
Expected: PASS — all logic and data tests green.

- [ ] **Step 2: Full manual walkthrough**

Run (PowerShell): `Invoke-Item index.html`
Confirm end to end:
- Set a mix of levels across categories; parent badges and header overview update live.
- Some leaves show the green (met) marker, others the orange (below-target) marker.
- The Utvecklingsplan tab reflects exactly the leaves below target, sorted by gap.
- Reload the page: all levels persist.
- Open `index.html` by double-clicking it directly from the file explorer (file:// origin) and confirm content loads with no console errors — this proves the no-server / `data.js`-as-global design works.

- [ ] **Step 3: Commit any final tweaks**

```bash
git add -A
git commit -m "chore: final verification pass"
```

---

## Self-Review Notes

- **Spec coverage:** purpose/role overview (Task 8 header), recursive tree + accordion (Task 8), leaf-only scoring with `target` (Tasks 2, 8), parent summaries showing gap (Tasks 3, 8), role overview (Task 8), level scale in data (Task 6), development plan grouped/sorted by gap (Tasks 4, 9), `localStorage` persistence keyed per role+leaf (Task 8), no-build `data.js`-as-global (Tasks 6, 10), out-of-scope items not built. All covered.
- **Type consistency:** `levels` is always an object `{leafId: number}`; `summarizeNode`/`summarizeRole` return `{met, total}`; `buildDevelopmentPlan` returns `[{category, items:[{leaf, gap}]}]`. Names match across `logic.js` and `app.js` (`getLevel`, `isLeafMet`, `leafGap`, `summarizeNode`, `summarizeRole`, `buildDevelopmentPlan`, `validateRole`).
- **Placeholder scan:** no TBD/TODO; all code steps contain complete code.
