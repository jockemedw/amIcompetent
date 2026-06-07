(function () {
  "use strict";

  var logic = window.CompetencyLogic;
  var data = window.COMPETENCY_DATA;
  var scale = data.scale;
  var scaleHelp = data.scaleHelp || [];

  var STORAGE_PREFIX = "amicompetent:";
  var ROLE_KEY = STORAGE_PREFIX + "role";
  var LEAF_KEY = STORAGE_PREFIX + "leaf:";

  var SVG_NS = "http://www.w3.org/2000/svg";

  // --- state ----------------------------------------------------------

  var role = findRole(localStorage.getItem(ROLE_KEY)) || data.roles[0];
  var levels = loadLevels(role);
  var view = "overview";            // "overview" | "plan"
  var selectedLeafId = restoreSelectedLeaf();
  var openAreas = defaultOpenAreas();

  // --- persistence helpers --------------------------------------------

  function findRole(id) {
    for (var i = 0; i < data.roles.length; i++) {
      if (data.roles[i].id === id) return data.roles[i];
    }
    return null;
  }

  function levelsKey(r) { return STORAGE_PREFIX + r.id; }

  function loadLevels(r) {
    try { return JSON.parse(localStorage.getItem(levelsKey(r))) || {}; }
    catch (e) { return {}; }
  }

  function saveLevels() {
    localStorage.setItem(levelsKey(role), JSON.stringify(levels));
  }

  function restoreSelectedLeaf() {
    var leaves = logic.collectRoleLeaves(role);
    var stored = localStorage.getItem(LEAF_KEY + role.id);
    if (stored && leaves.some(function (l) { return l.id === stored; })) return stored;
    return leaves.length ? leaves[0].id : null;
  }

  function defaultOpenAreas() {
    // All top-level areas open by default — calm, scannable overview.
    var set = Object.create(null);
    role.nodes.forEach(function (n) { set[n.id] = true; });
    return set;
  }

  // --- tiny DOM + lookup helpers --------------------------------------

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function svg(path, viewBox) {
    var s = document.createElementNS(SVG_NS, "svg");
    s.setAttribute("viewBox", viewBox || "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    var p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", path);
    s.appendChild(p);
    return s;
  }

  function labelForLevel(level) {
    for (var i = 0; i < scale.length; i++) {
      if (scale[i].level === level) return scale[i].label;
    }
    return String(level);
  }

  function findLeaf(id) {
    var leaves = logic.collectRoleLeaves(role);
    for (var i = 0; i < leaves.length; i++) {
      if (leaves[i].id === id) return leaves[i];
    }
    return null;
  }

  // Find the path of node titles from a top-level area down to a leaf.
  function pathToLeaf(leafId) {
    var trail = null;
    function walk(node, ancestors) {
      if (trail) return;
      var here = ancestors.concat([node]);
      if (logic.isLeaf(node)) {
        if (node.id === leafId) trail = here;
        return;
      }
      node.children.forEach(function (c) { walk(c, here); });
    }
    role.nodes.forEach(function (n) { walk(n, []); });
    return trail || [];
  }

  function leafStatus(leaf) {
    var cur = logic.getLevel(levels, leaf.id);
    if (cur >= leaf.target) return "met";
    if (cur > 0) return "progress";
    return "none";
  }

  // ====================================================================
  // RAIL — roles
  // ====================================================================

  function renderRail() {
    var rail = document.getElementById("rail");
    rail.innerHTML = "";

    var brand = el("div", "brand");
    var mark = el("div", "brand-mark");
    mark.appendChild(el("i")); mark.appendChild(el("i")); mark.appendChild(el("i"));
    brand.appendChild(mark);
    var bt = el("div", "brand-text");
    bt.appendChild(el("span", "brand-name", "Kompetenskarta"));
    bt.appendChild(el("span", "brand-sub", "Lejonfastigheter"));
    brand.appendChild(bt);
    rail.appendChild(brand);

    rail.appendChild(el("div", "rail-label", "Roller"));

    var list = el("div", "rail-list");
    data.roles.forEach(function (r, i) {
      var stored = loadLevels(r);
      var s = logic.summarizeRole(r, stored);
      var pct = s.total ? Math.round((s.met / s.total) * 100) : 0;

      var btn = el("button", "rail-role" + (r.id === role.id ? " is-active" : ""));
      btn.type = "button";
      btn.setAttribute("data-role-id", r.id);
      btn.style.setProperty("--i", i);
      btn.appendChild(el("span", "rail-role-title", r.title));
      btn.appendChild(el("span", "rail-role-meta", s.met + " / " + s.total + " på nivå"));
      var bar = el("div", "rail-bar");
      var fill = el("i");
      fill.style.width = pct + "%";
      bar.appendChild(fill);
      btn.appendChild(bar);
      list.appendChild(btn);
    });
    rail.appendChild(list);

    rail.appendChild(el("div", "rail-foot",
      "Skatta din nivå mot rollens mål. Allt sparas lokalt i din webbläsare."));
  }

  // ====================================================================
  // TOPBAR — role header, progress ring, tabs, scale legend
  // ====================================================================

  function ringCircle(className, dashOffset) {
    var c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("class", className);
    c.setAttribute("cx", "26");
    c.setAttribute("cy", "26");
    c.setAttribute("r", "21");
    if (dashOffset != null) {
      var circ = 2 * Math.PI * 21;
      c.setAttribute("stroke-dasharray", circ.toFixed(2));
      c.setAttribute("stroke-dashoffset", dashOffset.toFixed(2));
    }
    return c;
  }

  function renderTopbar() {
    var bar = document.getElementById("topbar");
    bar.innerHTML = "";

    var s = logic.summarizeRole(role, levels);
    var circ = 2 * Math.PI * 21;
    var offset = s.total ? circ * (1 - s.met / s.total) : circ;

    var row = el("div", "topbar-row");

    var head = el("div", "topbar-head");
    head.appendChild(el("span", "eyebrow", role.org));
    head.appendChild(el("h1", null, role.title));
    if (role.summary) head.appendChild(el("p", "topbar-summary", role.summary));
    row.appendChild(head);

    var prog = el("div", "progress");
    var ring = document.createElementNS(SVG_NS, "svg");
    ring.setAttribute("class", "ring");
    ring.setAttribute("viewBox", "0 0 52 52");
    ring.appendChild(ringCircle("ring-bg"));
    ring.appendChild(ringCircle("ring-val", offset));
    prog.appendChild(ring);
    var ptext = el("div", "progress-text");
    var num = el("div", "progress-num");
    var b = el("b", null, String(s.met));
    num.appendChild(b);
    num.appendChild(document.createTextNode(" / " + s.total));
    ptext.appendChild(num);
    ptext.appendChild(el("div", "progress-label", "på rekommenderad nivå"));
    prog.appendChild(ptext);
    row.appendChild(prog);

    bar.appendChild(row);

    // tabs + legend
    var foot = el("div", "topbar-foot");

    var tabs = el("div", "tabs");
    tabs.setAttribute("role", "tablist");
    var gapCount = s.total - s.met;

    var t1 = el("button", "tab" + (view === "overview" ? " is-active" : ""), "Översikt");
    t1.type = "button"; t1.setAttribute("data-view", "overview");
    t1.setAttribute("role", "tab"); t1.setAttribute("aria-selected", view === "overview");
    tabs.appendChild(t1);

    var t2 = el("button", "tab" + (view === "plan" ? " is-active" : ""), "Utvecklingsplan");
    t2.type = "button"; t2.setAttribute("data-view", "plan");
    t2.setAttribute("role", "tab"); t2.setAttribute("aria-selected", view === "plan");
    if (gapCount > 0) t2.appendChild(el("span", "tab-count", String(gapCount)));
    tabs.appendChild(t2);

    foot.appendChild(tabs);

    if (scaleHelp.length) {
      var legend = el("div", "legend");
      legend.setAttribute("aria-label", "Nivåskala");
      scaleHelp.forEach(function (h) {
        var item = el("span", "legend-item");
        item.title = h.text;                       // full förklaring vid hover
        item.appendChild(el("span", "legend-num", String(h.level)));
        item.appendChild(el("span", "legend-step", labelForLevel(h.level)));
        legend.appendChild(item);
      });
      foot.appendChild(legend);
    }

    bar.appendChild(foot);
  }

  // ====================================================================
  // AREAS pane (middle)
  // ====================================================================

  function makeLeafRow(leaf) {
    var status = leafStatus(leaf);
    var row = el("button", "leaf-row" + (leaf.id === selectedLeafId ? " is-selected" : ""));
    row.type = "button";
    row.setAttribute("data-leaf-id", leaf.id);

    var dot = el("span", "leaf-dot" +
      (status === "met" ? " is-met" : status === "progress" ? " is-progress" : ""));
    row.appendChild(dot);

    row.appendChild(el("span", "leaf-row-title", leaf.title));

    var cur = logic.getLevel(levels, leaf.id);
    var pips = el("span", "pips");
    var shown = Math.max(leaf.target, cur);
    for (var i = 1; i <= shown; i++) {
      var cls = "pip";
      if (i <= cur && i <= leaf.target) cls += " is-filled";
      else if (i <= cur) cls += " is-over";
      pips.appendChild(el("span", cls));
    }
    row.appendChild(pips);

    return row;
  }

  // Render an area's descendants: leaves become rows, sub-groups become
  // small labels followed by their own leaves (handles variable nesting).
  function appendAreaChildren(container, node) {
    node.children.forEach(function (child) {
      if (logic.isLeaf(child)) {
        container.appendChild(makeLeafRow(child));
      } else {
        container.appendChild(el("div", "subgroup-label", child.title));
        appendAreaChildren(container, child);
      }
    });
  }

  function renderAreas() {
    var pane = document.getElementById("areas-pane");
    pane.innerHTML = "";

    role.nodes.forEach(function (node, i) {
      var isOpen = !!openAreas[node.id];
      var s = logic.summarizeNode(node, levels);

      var area = el("div", "area" + (isOpen ? " is-open" : ""));
      area.style.setProperty("--i", i);

      var head = el("button", "area-head");
      head.type = "button";
      head.setAttribute("data-area-id", node.id);
      head.setAttribute("aria-expanded", isOpen);
      head.appendChild(svg("M9 6l6 6-6 6", "0 0 24 24")).setAttribute("class", "area-chevron");
      head.appendChild(el("span", "area-title", node.title));
      head.appendChild(el("span", "area-count" + (s.met === s.total ? " is-complete" : ""),
        s.met + "/" + s.total));
      area.appendChild(head);

      var body = el("div", "area-body");
      var inner = el("div");
      appendAreaChildren(inner, node);
      body.appendChild(inner);
      area.appendChild(body);

      pane.appendChild(area);
    });
  }

  // ====================================================================
  // DETAIL pane (right)
  // ====================================================================

  function renderLadder(leaf) {
    var current = logic.getLevel(levels, leaf.id);
    var ladder = el("ol", "ladder");
    var idx = 0;

    scale.forEach(function (sc) {
      if (sc.level === 0) return;                 // ladder starts at step 1
      var guide = leaf.levelGuide && leaf.levelGuide[sc.level];
      if (!guide) return;

      var cls = "ladder-rung";
      if (current > 0 && sc.level <= current) cls += " is-reached";
      if (current > 0 && sc.level === current) cls += " is-current";
      if (sc.level === leaf.target) cls += " is-target";

      var rung = el("li", cls);
      rung.style.animationDelay = (idx * 55 + 60) + "ms";
      idx++;

      rung.appendChild(el("span", "ladder-rung-num", String(sc.level)));

      var rbody = el("div", "rung-body");
      var rhead = el("div", "rung-head");
      rhead.appendChild(el("span", "rung-label", sc.label));
      var tags = el("span", "rung-tags");
      if (sc.level === leaf.target) tags.appendChild(el("span", "rung-tag tag-target", "Mål"));
      if (current > 0 && sc.level === current) tags.appendChild(el("span", "rung-tag tag-current", "Du"));
      rhead.appendChild(tags);
      rbody.appendChild(rhead);
      rbody.appendChild(el("p", "rung-text", guide));
      rung.appendChild(rbody);

      ladder.appendChild(rung);
    });

    return ladder;
  }

  function renderLevelControl(leaf) {
    var current = logic.getLevel(levels, leaf.id);
    var set = el("div", "level-set");
    set.setAttribute("role", "radiogroup");
    set.setAttribute("aria-label", "Din nivå");

    scale.forEach(function (sc) {
      var opt = el("button", "level-opt");
      opt.type = "button";
      opt.setAttribute("data-leaf-id", leaf.id);
      opt.setAttribute("data-level", String(sc.level));
      opt.setAttribute("role", "radio");
      opt.setAttribute("aria-checked", sc.level === current ? "true" : "false");
      opt.appendChild(el("span", "level-opt-num", String(sc.level)));
      opt.appendChild(el("span", "level-opt-label", sc.label));
      set.appendChild(opt);
    });
    return set;
  }

  function renderDetail() {
    var pane = document.getElementById("detail-pane");
    pane.innerHTML = "";

    var leaf = selectedLeafId ? findLeaf(selectedLeafId) : null;
    if (!leaf) {
      var empty = el("div", "detail-empty");
      empty.appendChild(el("h2", null, "Välj en färdighet"));
      empty.appendChild(el("p", null, "Klicka på en färdighet i listan för att se nivåtrappan och skatta dig själv."));
      pane.appendChild(empty);
      return;
    }

    var card = el("div", "detail-card");

    var trail = pathToLeaf(leaf.id);
    var crumb = el("div", "detail-crumb");
    trail.slice(0, -1).forEach(function (n, i) {
      if (i > 0) crumb.appendChild(el("span", "sep", "·"));
      crumb.appendChild(el("span", null, n.title));
    });
    card.appendChild(crumb);

    card.appendChild(el("h2", "detail-title", leaf.title));

    var target = el("span", "detail-target");
    target.appendChild(svg("M12 2l2.4 6.9H22l-5.8 4.3 2.2 7-6.4-4.6-6.4 4.6 2.2-7L2 8.9h7.6z", "0 0 24 24"));
    target.appendChild(document.createTextNode("Mål: " + labelForLevel(leaf.target)));
    card.appendChild(target);

    if (leaf.description) card.appendChild(el("p", "detail-desc", leaf.description));

    if (leaf.levelGuide) {
      card.appendChild(el("div", "detail-section-label", "Nivåtrappa — nybörjare till expert"));
      card.appendChild(renderLadder(leaf));
    }

    card.appendChild(el("div", "detail-section-label", "Din nivå"));
    card.appendChild(renderLevelControl(leaf));

    var current = logic.getLevel(levels, leaf.id);
    if (current >= leaf.target) {
      var done = el("div", "detail-done");
      done.appendChild(svg("M20 6L9 17l-5-5", "0 0 24 24"));
      done.appendChild(document.createTextNode("Du är på rekommenderad nivå för den här färdigheten."));
      card.appendChild(done);
    } else {
      var nextLevel = current + 1;
      var nextGuide = leaf.levelGuide && leaf.levelGuide[nextLevel];
      if (nextGuide) {
        var ns = el("div", "next-step");
        ns.appendChild(svg("M5 12h14M13 6l6 6-6 6", "0 0 24 24"));
        var nb = el("div", "next-step-body");
        nb.appendChild(el("div", "next-step-label", "Nästa steg → " + labelForLevel(nextLevel)));
        nb.appendChild(el("p", "next-step-text", nextGuide));
        ns.appendChild(nb);
        card.appendChild(ns);
      }
    }

    pane.appendChild(card);
  }

  // ====================================================================
  // PLAN view
  // ====================================================================

  function renderPlan() {
    var pane = document.getElementById("plan-view");
    pane.innerHTML = "";

    var plan = logic.buildDevelopmentPlan(role, levels);

    if (plan.length === 0) {
      var empty = el("div", "plan-empty");
      var mark = el("div", "plan-empty-mark");
      mark.appendChild(svg("M20 6L9 17l-5-5", "0 0 24 24"));
      empty.appendChild(mark);
      empty.appendChild(el("h2", null, "Inga gap kvar"));
      empty.appendChild(el("p", null,
        "Du ligger på rekommenderad nivå för alla färdigheter i rollen " + role.title + "."));
      pane.appendChild(empty);
      return;
    }

    pane.appendChild(el("p", "plan-intro",
      "De färdigheter där din nivå ligger under målet — grupperade per område och " +
      "sorterade efter störst gap först. Klicka på ett kort för att öppna nivåtrappan."));

    var animIdx = 0;
    plan.forEach(function (group) {
      var groupEl = el("div", "plan-group");
      var gh = el("div", "plan-group-head");
      gh.appendChild(el("h2", null, group.category));
      gh.appendChild(el("div", "plan-group-rule"));
      gh.appendChild(el("span", "plan-group-num",
        group.items.length + (group.items.length === 1 ? " färdighet" : " färdigheter")));
      groupEl.appendChild(gh);

      var grid = el("div", "plan-grid");
      group.items.forEach(function (item) {
        var leaf = item.leaf;
        var cur = logic.getLevel(levels, leaf.id);

        var card = el("button", "plan-card");
        card.type = "button";
        card.setAttribute("data-leaf-id", leaf.id);
        card.style.animationDelay = (animIdx * 35) + "ms";
        animIdx++;

        var ch = el("div", "plan-card-head");
        ch.appendChild(el("span", "plan-card-title", leaf.title));
        ch.appendChild(el("span", "plan-gap-badge",
          "+" + item.gap + (item.gap === 1 ? " steg" : " steg")));
        card.appendChild(ch);

        var levelsRow = el("div", "plan-levels");
        var nowB = el("b", null, labelForLevel(cur));
        levelsRow.appendChild(document.createTextNode("Nu: "));
        levelsRow.appendChild(nowB);
        levelsRow.appendChild(svg("M5 12h14M13 6l6 6-6 6", "0 0 24 24"));
        var goalB = el("b", null, labelForLevel(leaf.target));
        levelsRow.appendChild(document.createTextNode("Mål: "));
        levelsRow.appendChild(goalB);
        card.appendChild(levelsRow);

        var nextGuide = leaf.levelGuide && leaf.levelGuide[cur + 1];
        if (nextGuide) card.appendChild(el("p", "plan-next-text", nextGuide));

        grid.appendChild(card);
      });
      groupEl.appendChild(grid);
      pane.appendChild(groupEl);
    });
  }

  // ====================================================================
  // Render orchestration
  // ====================================================================

  function setView(next) {
    view = next;
    document.getElementById("overview-view").hidden = (view !== "overview");
    document.getElementById("plan-view").hidden = (view !== "plan");
  }

  function render() {
    renderRail();
    renderTopbar();
    renderAreas();
    renderDetail();
    renderPlan();
    setView(view);
  }

  function playEnter() {
    var app = document.getElementById("app");
    app.classList.remove("app-enter");
    // force reflow so the animation re-triggers on role switch
    void app.offsetWidth;
    app.classList.add("app-enter");
    window.setTimeout(function () { app.classList.remove("app-enter"); }, 1400);
  }

  // ====================================================================
  // Events (delegated)
  // ====================================================================

  function selectRole(id) {
    var next = findRole(id);
    if (!next || next.id === role.id) return;
    role = next;
    localStorage.setItem(ROLE_KEY, role.id);
    levels = loadLevels(role);
    selectedLeafId = restoreSelectedLeaf();
    openAreas = defaultOpenAreas();
    render();
    playEnter();
  }

  function selectLeaf(id, opts) {
    selectedLeafId = id;
    localStorage.setItem(LEAF_KEY + role.id, id);
    if (opts && opts.openArea) {
      var trail = pathToLeaf(id);
      if (trail.length) openAreas[trail[0].id] = true;
    }
    if (opts && opts.toOverview) setView("overview");
    render();
    if (opts && opts.scrollIntoView) {
      var node = document.querySelector('.leaf-row[data-leaf-id="' + cssEscape(id) + '"]');
      if (node) node.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function setLevel(leafId, level) {
    levels[leafId] = level;
    saveLevels();
    render();
  }

  function cssEscape(s) {
    return window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/"/g, '\\"');
  }

  document.addEventListener("click", function (e) {
    var t = e.target;

    var roleBtn = t.closest(".rail-role");
    if (roleBtn) { selectRole(roleBtn.getAttribute("data-role-id")); return; }

    var tab = t.closest(".tab");
    if (tab) { setView(tab.getAttribute("data-view")); render(); return; }

    var areaHead = t.closest(".area-head");
    if (areaHead) {
      var aid = areaHead.getAttribute("data-area-id");
      openAreas[aid] = !openAreas[aid];
      renderAreas();
      return;
    }

    var levelOpt = t.closest(".level-opt");
    if (levelOpt) {
      setLevel(levelOpt.getAttribute("data-leaf-id"),
        parseInt(levelOpt.getAttribute("data-level"), 10));
      return;
    }

    var planCard = t.closest(".plan-card");
    if (planCard) {
      selectLeaf(planCard.getAttribute("data-leaf-id"),
        { toOverview: true, openArea: true, scrollIntoView: true });
      return;
    }

    var leafRow = t.closest(".leaf-row");
    if (leafRow) { selectLeaf(leafRow.getAttribute("data-leaf-id")); return; }
  });

  // Keyboard: arrow-key navigation between level options
  document.addEventListener("keydown", function (e) {
    var opt = document.activeElement;
    if (!opt || !opt.classList || !opt.classList.contains("level-opt")) return;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" &&
        e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    var opts = Array.prototype.slice.call(opt.parentNode.children);
    var i = opts.indexOf(opt);
    var dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
    var nextEl = opts[(i + dir + opts.length) % opts.length];
    if (nextEl) nextEl.focus();
  });

  // --- boot -----------------------------------------------------------

  render();
  playEnter();
})();
