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

  var api = {
    DEFAULT_LEVEL: DEFAULT_LEVEL,
    isLeaf: isLeaf,
    collectLeaves: collectLeaves,
    collectRoleLeaves: collectRoleLeaves,
    getLevel: getLevel,
    leafGap: leafGap,
    isLeafMet: isLeafMet
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.CompetencyLogic = api;
  }
})(typeof self !== "undefined" ? self : this);
