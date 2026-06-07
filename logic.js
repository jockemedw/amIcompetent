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

  // A level guide entry is either a plain string (one-line guide, used by the
  // roles that have not been deepened yet) or an object { summary, indicators }.
  // Normalize both — and missing entries — to the object shape so the UI and the
  // development plan never have to branch on the form of the data.
  function normalizeGuide(entry) {
    if (entry == null) return { summary: "", indicators: [] };
    if (typeof entry === "string") return { summary: entry, indicators: [] };
    return {
      summary: entry.summary || "",
      indicators: entry.indicators || []
    };
  }

  // Aggregate the role into one data point per top-level area for the radar:
  // current = mean of the user's levels in the area, target = mean of the
  // recommended targets, plus the met/total counts. Empty areas read as 0.
  function buildRadarData(role, levels) {
    return role.nodes.map(function (node) {
      var leaves = collectLeaves(node);
      var n = leaves.length || 1;
      var curSum = leaves.reduce(function (a, leaf) {
        return a + getLevel(levels, leaf.id);
      }, 0);
      var tgtSum = leaves.reduce(function (a, leaf) { return a + leaf.target; }, 0);
      var s = summarizeNode(node, levels);
      return {
        area: node.title,
        current: curSum / n,
        target: tgtSum / n,
        met: s.met,
        total: s.total
      };
    });
  }

  function validateRole(role) {
    var errors = [];
    var seen = Object.create(null);
    function walk(node) {
      if (seen[node.id]) errors.push("Duplicate id: " + node.id);
      seen[node.id] = true;
      if (isLeaf(node)) {
        if (typeof node.target !== "number" || isNaN(node.target)) {
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
    normalizeGuide: normalizeGuide,
    buildRadarData: buildRadarData,
    validateRole: validateRole
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.CompetencyLogic = api;
  }
})(typeof self !== "undefined" ? self : this);
