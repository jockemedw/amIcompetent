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

  function buildDevelopmentPlan(role, levels) {
    return role.nodes.map(function (node) {
      var items = collectLeaves(node)
        .filter(function (leaf) { return leafGap(leaf, levels) > 0; })
        .map(function (leaf) { return { leaf: leaf, gap: leafGap(leaf, levels) }; })
        .sort(function (a, b) { return b.gap - a.gap; });
      return { category: node.title, items: items };
    }).filter(function (group) { return group.items.length > 0; });
  }

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

  var api = {
    DEFAULT_LEVEL: DEFAULT_LEVEL,
    isLeaf: isLeaf,
    collectLeaves: collectLeaves,
    collectRoleLeaves: collectRoleLeaves,
    getLevel: getLevel,
    leafGap: leafGap,
    isLeafMet: isLeafMet,
    summarizeNode: summarizeNode,
    summarizeRole: summarizeRole,
    buildDevelopmentPlan: buildDevelopmentPlan,
    validateRole: validateRole
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.CompetencyLogic = api;
  }
})(typeof self !== "undefined" ? self : this);
