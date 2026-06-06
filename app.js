(function () {
  var logic = window.CompetencyLogic;
  var data = window.COMPETENCY_DATA;
  var scale = data.scale;
  var scaleHelp = data.scaleHelp || [];
  var STORAGE_PREFIX = "amicompetent:";
  var ROLE_KEY = STORAGE_PREFIX + "role";

  // --- current role + persistence -------------------------------------

  function findRole(id) {
    for (var i = 0; i < data.roles.length; i++) {
      if (data.roles[i].id === id) return data.roles[i];
    }
    return null;
  }

  var role = findRole(localStorage.getItem(ROLE_KEY)) || data.roles[0];

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

  // --- small helpers --------------------------------------------------

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

  // --- level ladder (the pedagogical core) ----------------------------
  // Shows, for one skill, what each step from beginner to expert means,
  // with the recommended target and the user's current level marked.

  function renderLadder(leaf) {
    if (!leaf.levelGuide) return null;
    var current = logic.getLevel(levels, leaf.id);
    var ladder = el("ol", "ladder");

    scale.forEach(function (s) {
      if (s.level === 0) return; // skip "Ingen" — the ladder starts at step 1
      var guide = leaf.levelGuide[s.level];
      if (!guide) return;

      var classes = "ladder-rung";
      if (s.level <= current && current > 0) classes += " is-reached";
      if (s.level === current && current > 0) classes += " is-current";
      if (s.level === leaf.target) classes += " is-target";

      var rung = el("li", classes);
      var head = el("div", "rung-head");
      head.appendChild(el("span", "rung-label", s.label));

      var tags = el("span", "rung-tags");
      if (s.level === leaf.target) tags.appendChild(el("span", "rung-tag tag-target", "Mål"));
      if (s.level === current && current > 0) tags.appendChild(el("span", "rung-tag tag-current", "Du"));
      head.appendChild(tags);

      rung.appendChild(head);
      rung.appendChild(el("p", "rung-text", guide));
      ladder.appendChild(rung);
    });

    return ladder;
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

    var ladder = renderLadder(leaf);
    if (ladder) wrap.appendChild(ladder);

    var control = el("div", "leaf-control");
    control.appendChild(el("label", "control-label", "Din nivå"));
    var select = el("select");
    select.setAttribute("data-leaf-id", leaf.id);
    var current = logic.getLevel(levels, leaf.id);
    scale.forEach(function (s) {
      var opt = el("option", null, s.label);
      opt.value = String(s.level);
      if (s.level === current) opt.selected = true;
      select.appendChild(opt);
    });
    control.appendChild(select);
    wrap.appendChild(control);

    return wrap;
  }

  function renderNode(node) {
    if (logic.isLeaf(node)) return renderLeaf(node);

    var details = el("details");
    details.setAttribute("data-node-id", node.id);
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

  // --- header (role switch, overview, scale legend) -------------------

  function renderHeader() {
    var header = document.getElementById("role-header");
    header.innerHTML = "";

    var switcher = el("div", "role-switch");
    switcher.appendChild(el("label", "role-switch-label", "Roll"));
    var roleSelect = el("select");
    roleSelect.id = "role-select";
    data.roles.forEach(function (r) {
      var opt = el("option", null, r.title);
      opt.value = r.id;
      if (r.id === role.id) opt.selected = true;
      roleSelect.appendChild(opt);
    });
    switcher.appendChild(roleSelect);
    header.appendChild(switcher);

    header.appendChild(el("h1", null, role.title));
    header.appendChild(el("div", "org", role.org));
    if (role.summary) header.appendChild(el("p", "role-summary", role.summary));

    var s = logic.summarizeRole(role, levels);
    header.appendChild(el("div", "overview-badge",
      s.met + " av " + s.total + " färdigheter på rekommenderad nivå"));

    if (scaleHelp.length) {
      var legend = el("div", "scale-legend");
      legend.appendChild(el("span", "scale-legend-title", "Nivåskala"));
      scaleHelp.forEach(function (h) {
        var item = el("span", "scale-legend-item");
        item.appendChild(el("strong", null, labelForLevel(h.level)));
        item.appendChild(document.createTextNode(" — " + h.text));
        legend.appendChild(item);
      });
      header.appendChild(legend);
    }
  }

  // --- accordion open-state preservation across re-render -------------

  function getOpenNodeIds(view) {
    var open = [];
    var els = view.querySelectorAll("details[open]");
    for (var i = 0; i < els.length; i++) {
      var id = els[i].getAttribute("data-node-id");
      if (id) open.push(id);
    }
    return open;
  }

  function restoreOpenNodeIds(view, ids) {
    ids.forEach(function (id) {
      var node = view.querySelector('details[data-node-id="' + id + '"]');
      if (node) node.open = true;
    });
  }

  function renderOverview() {
    var view = document.getElementById("overview-view");
    var openIds = getOpenNodeIds(view);
    view.innerHTML = "";
    role.nodes.forEach(function (node) {
      view.appendChild(renderNode(node));
    });
    restoreOpenNodeIds(view, openIds);
  }

  function renderPlan() {
    var view = document.getElementById("plan-view");
    view.innerHTML = "";
    var plan = logic.buildDevelopmentPlan(role, levels);

    var intro = el("p", "plan-intro",
      "Din utvecklingsplan: de färdigheter där din nivå ligger under mål, " +
      "grupperade per område och sorterade efter störst gap först.");
    view.appendChild(intro);

    if (plan.length === 0) {
      view.appendChild(el("p", "plan-empty",
        "Inga gap — du är på rekommenderad nivå för alla färdigheter i den här rollen."));
      return;
    }
    plan.forEach(function (group) {
      var groupEl = el("div", "plan-group");
      groupEl.appendChild(el("h2", null, group.category));
      group.items.forEach(function (item) {
        var itemEl = el("div", "plan-item");
        var main = el("div", "plan-item-main");
        main.appendChild(el("span", "plan-item-title", item.leaf.title));
        var nextLevel = logic.getLevel(levels, item.leaf.id) + 1;
        var nextGuide = item.leaf.levelGuide && item.leaf.levelGuide[nextLevel];
        if (nextGuide) {
          main.appendChild(el("p", "plan-next", "Nästa steg (" +
            labelForLevel(nextLevel) + "): " + nextGuide));
        }
        itemEl.appendChild(main);
        itemEl.appendChild(el("span", "plan-gap",
          "Mål: " + labelForLevel(item.leaf.target) +
          " · nu: " + labelForLevel(logic.getLevel(levels, item.leaf.id))));
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

  // --- events ---------------------------------------------------------

  document.addEventListener("change", function (e) {
    var target = e.target;
    if (target.id === "role-select") {
      var next = findRole(target.value);
      if (next) {
        role = next;
        localStorage.setItem(ROLE_KEY, role.id);
        levels = loadLevels();
        render();
      }
      return;
    }
    if (target.tagName === "SELECT" && target.getAttribute("data-leaf-id")) {
      var id = target.getAttribute("data-leaf-id");
      levels[id] = parseInt(target.value, 10);
      saveLevels(levels);
      render();
    }
  });

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
