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
})();
