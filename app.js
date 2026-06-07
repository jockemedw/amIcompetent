(function () {
  "use strict";

  var logic = window.CompetencyLogic;
  var data = window.COMPETENCY_DATA;
  var scale = data.scale;
  var scaleHelp = data.scaleHelp || [];
  var quizData = window.QUIZ_DATA || {};
  var quizApi = window.QuizLogic;

  var STORAGE_PREFIX = "amicompetent:";
  var ROLE_KEY = STORAGE_PREFIX + "role";
  var LEAF_KEY = STORAGE_PREFIX + "leaf:";

  var SVG_NS = "http://www.w3.org/2000/svg";

  // --- state ----------------------------------------------------------

  var role = findRole(localStorage.getItem(ROLE_KEY)) || data.roles[0];
  var levels = loadLevels(role);
  var view = "dashboard";           // "dashboard" | "overview" | "plan"
  var selectedLeafId = restoreSelectedLeaf();
  var openAreas = defaultOpenAreas();
  var lastDetailLeaf = null;        // gates the detail entrance animation
  var quizSession = null;   // { leafId, questions, answers:[], index, pending, revealed }

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

  function quizResultKey(leafId) {
    return STORAGE_PREFIX + "quiz:" + role.id + ":" + leafId;
  }

  function loadQuizResult(leafId) {
    try { return JSON.parse(localStorage.getItem(quizResultKey(leafId))); }
    catch (e) { return null; }
  }

  function saveQuizResult(leafId, level) {
    localStorage.setItem(quizResultKey(leafId), JSON.stringify({
      resultLevel: level,
      date: new Date().toISOString().slice(0, 10)
    }));
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

  function svgEl(name, attrs) {
    var e = document.createElementNS(SVG_NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // Point on a radar axis: axis i of n, starting at the top, going clockwise.
  function radarXY(cx, cy, radius, i, n) {
    var ang = (-90 + i * 360 / n) * Math.PI / 180;
    return { x: cx + radius * Math.cos(ang), y: cy + radius * Math.sin(ang) };
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

    function addTab(viewId, label, count) {
      var t = el("button", "tab" + (view === viewId ? " is-active" : ""), label);
      t.type = "button"; t.setAttribute("data-view", viewId);
      t.setAttribute("role", "tab"); t.setAttribute("aria-selected", view === viewId);
      if (count) t.appendChild(el("span", "tab-count", String(count)));
      tabs.appendChild(t);
    }

    addTab("dashboard", "Översikt");
    addTab("overview", "Färdigheter");
    addTab("plan", "Utvecklingsplan", gapCount > 0 ? gapCount : 0);

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

  // The interactive level ladder: every level is a selectable radio whose
  // body IS its criterion. Picking one sets "Din nivå" (the "Du" marker);
  // "Mål" stays on the target. No separate selector, no repeated next-step.
  function renderLevelLadder(leaf, animate) {
    var current = logic.getLevel(levels, leaf.id);
    var group = el("div", "lvl");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "Din nivå för " + leaf.title);
    var idx = 0;

    scale.forEach(function (sc) {
      var guide = leaf.levelGuide && leaf.levelGuide[sc.level];
      if (sc.level !== 0 && !guide) return;       // only real, defined steps

      var isSel = sc.level === current;
      var isTarget = sc.level === leaf.target;

      var cls = "lvl-step";
      if (isSel) cls += " is-selected";
      if (isTarget) cls += " is-target";

      var step = el("button", cls);
      step.type = "button";
      step.setAttribute("data-leaf-id", leaf.id);
      step.setAttribute("data-level", String(sc.level));
      step.setAttribute("role", "radio");
      step.setAttribute("aria-checked", isSel ? "true" : "false");
      if (animate) step.style.setProperty("--i", idx);
      idx++;

      var radioCls = "lvl-radio";
      if (isSel) radioCls += " is-on";
      else if (sc.level > 0 && sc.level < current) radioCls += " is-passed";
      var radio = el("span", radioCls);
      radio.appendChild(svg("M20 6L9 17l-5-5", "0 0 24 24"));
      step.appendChild(radio);

      var body = el("div", "lvl-body");
      var head = el("div", "lvl-head");
      head.appendChild(el("span", "lvl-label", sc.level === 0 ? "Ingen" : sc.label));
      var tags = el("span", "lvl-tags");
      if (isTarget) tags.appendChild(el("span", "lvl-tag tag-target", "Mål"));
      head.appendChild(tags);
      body.appendChild(head);

      if (sc.level === 0) {
        body.appendChild(el("p", "lvl-text", "Ingen erfarenhet ännu."));
      } else {
        var g = logic.normalizeGuide(guide);
        body.appendChild(el("p", "lvl-text", g.summary));
        if (g.indicators.length) {
          var ul = el("ul", "lvl-indicators");
          g.indicators.forEach(function (ind) {
            ul.appendChild(el("li", null, ind));
          });
          body.appendChild(ul);
        }
      }
      step.appendChild(body);

      group.appendChild(step);
    });

    return group;
  }

  function renderDetail() {
    var pane = document.getElementById("detail-pane");
    pane.innerHTML = "";

    var leaf = selectedLeafId ? findLeaf(selectedLeafId) : null;
    if (!leaf) {
      var empty = el("div", "detail-empty");
      empty.appendChild(el("h2", null, "Välj en färdighet"));
      empty.appendChild(el("p", null, "Klicka på en färdighet i listan för att se nivåerna och skatta dig själv."));
      pane.appendChild(empty);
      return;
    }

    var animate = (selectedLeafId !== lastDetailLeaf);
    lastDetailLeaf = selectedLeafId;

    var card = el("div", "detail-card" + (animate ? " anim" : ""));

    var trail = pathToLeaf(leaf.id);
    var crumb = el("div", "detail-crumb");
    trail.slice(0, -1).forEach(function (n, i) {
      if (i > 0) crumb.appendChild(el("span", "sep", "·"));
      crumb.appendChild(el("span", null, n.title));
    });
    card.appendChild(crumb);

    card.appendChild(el("h2", "detail-title", leaf.title));

    // Status at a glance: target + where you are.
    var current = logic.getLevel(levels, leaf.id);
    var meta = el("div", "detail-meta");

    var target = el("span", "meta-badge is-target");
    target.appendChild(svg("M12 2l2.4 6.9H22l-5.8 4.3 2.2 7-6.4-4.6-6.4 4.6 2.2-7L2 8.9h7.6z", "0 0 24 24"));
    target.appendChild(document.createTextNode("Mål: " + labelForLevel(leaf.target)));
    meta.appendChild(target);

    if (current >= leaf.target) {
      var done = el("span", "meta-badge is-done");
      done.appendChild(svg("M20 6L9 17l-5-5", "0 0 24 24"));
      done.appendChild(document.createTextNode("På rekommenderad nivå"));
      meta.appendChild(done);
    } else {
      var gap = leaf.target - current;
      var gapBadge = el("span", "meta-badge is-gap");
      gapBadge.appendChild(document.createTextNode(
        gap + (gap === 1 ? " steg kvar" : " steg kvar") + " till mål"));
      meta.appendChild(gapBadge);
    }
    var qr = loadQuizResult(leaf.id);
    if (qr) {
      var tested = el("span", "meta-badge is-tested");
      tested.appendChild(svg("M20 6L9 17l-5-5", "0 0 24 24"));
      tested.appendChild(document.createTextNode("Testad: nivå " + qr.resultLevel));
      meta.appendChild(tested);
    }
    card.appendChild(meta);

    if (leaf.description) card.appendChild(el("p", "detail-desc", leaf.description));

    card.appendChild(el("div", "detail-section-label", "Din nivå"));
    card.appendChild(el("p", "lvl-hint", "Klicka på den nivå som bäst beskriver var du är i dag."));
    card.appendChild(renderLevelLadder(leaf, animate));

    if (quizApi && quizApi.hasQuiz(quizData, leaf.id)) {
      var testBtn = el("button", "detail-test-btn");
      testBtn.type = "button";
      testBtn.setAttribute("data-quiz-open", leaf.id);
      testBtn.appendChild(svg("M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", "0 0 24 24"));
      testBtn.appendChild(document.createTextNode("Testa dig själv"));
      card.appendChild(testBtn);
    }

    pane.appendChild(card);
  }

  // ====================================================================
  // DASHBOARD view — competency radar
  // ====================================================================

  function renderRadar() {
    var pane = document.getElementById("dashboard-view");
    pane.innerHTML = "";

    var points = logic.buildRadarData(role, levels);
    var n = points.length;
    var MAX = scale[scale.length - 1].level;   // top of the scale (3)

    var head = el("div", "dash-head");
    head.appendChild(el("h2", "dash-title", "Din kompetensprofil"));
    head.appendChild(el("p", "dash-sub",
      "Spindelnätet visar din nuvarande nivå mot rollens mål, per område. " +
      "Ju närmare den yttre ringen, desto starkare står du."));
    pane.appendChild(head);

    var grid = el("div", "dash-grid");

    // ---- the radar chart ----
    var chartWrap = el("div", "radar-wrap");
    var W = 600, H = 440, cx = 300, cy = 220, R = 150;
    var s = svgEl("svg", {
      "class": "radar", viewBox: "0 0 " + W + " " + H,
      role: "img", "aria-label": "Radardiagram över kompetensområden"
    });

    // concentric grid rings (levels 1..MAX)
    for (var ring = 1; ring <= MAX; ring++) {
      var rpts = [];
      for (var ri = 0; ri < n; ri++) {
        var rp = radarXY(cx, cy, R * ring / MAX, ri, n);
        rpts.push(rp.x.toFixed(1) + "," + rp.y.toFixed(1));
      }
      s.appendChild(svgEl("polygon", { "class": "radar-ring", points: rpts.join(" ") }));
    }

    // spokes + axis labels
    for (var i = 0; i < n; i++) {
      var edge = radarXY(cx, cy, R, i, n);
      s.appendChild(svgEl("line", {
        "class": "radar-spoke", x1: cx, y1: cy,
        x2: edge.x.toFixed(1), y2: edge.y.toFixed(1)
      }));

      var lp = radarXY(cx, cy, R + 20, i, n);
      var anchor = "middle";
      if (lp.x > cx + 1) anchor = "start";
      else if (lp.x < cx - 1) anchor = "end";
      var label = svgEl("text", {
        "class": "radar-label", x: lp.x.toFixed(1), y: lp.y.toFixed(1),
        "text-anchor": anchor, "dominant-baseline": "middle",
        "data-area-index": i
      });
      label.textContent = points[i].area;
      s.appendChild(label);
    }

    // target + current polygons
    var tgt = [], cur = [];
    for (var pi = 0; pi < n; pi++) {
      var tp = radarXY(cx, cy, R * points[pi].target / MAX, pi, n);
      tgt.push(tp.x.toFixed(1) + "," + tp.y.toFixed(1));
      var cp = radarXY(cx, cy, R * points[pi].current / MAX, pi, n);
      cur.push(cp.x.toFixed(1) + "," + cp.y.toFixed(1));
    }
    s.appendChild(svgEl("polygon", { "class": "radar-target", points: tgt.join(" ") }));
    s.appendChild(svgEl("polygon", { "class": "radar-current", points: cur.join(" ") }));

    // dots on the current vertices
    for (var di = 0; di < n; di++) {
      var dp = radarXY(cx, cy, R * points[di].current / MAX, di, n);
      s.appendChild(svgEl("circle", {
        "class": "radar-dot", cx: dp.x.toFixed(1), cy: dp.y.toFixed(1), r: 3.5
      }));
    }

    chartWrap.appendChild(s);

    var leg = el("div", "radar-legend");
    [["is-current", "Din nivå"], ["is-target", "Mål"]].forEach(function (pair) {
      var item = el("span", "rl-item");
      item.appendChild(el("span", "rl-swatch " + pair[0]));
      item.appendChild(el("span", null, pair[1]));
      leg.appendChild(item);
    });
    chartWrap.appendChild(leg);
    grid.appendChild(chartWrap);

    // ---- side: key numbers + per-area breakdown ----
    var side = el("div", "dash-side");

    var roleSum = logic.summarizeRole(role, levels);
    var stats = el("div", "dash-stats");

    var stat1 = el("div", "stat");
    var n1 = el("div", "stat-num");
    n1.appendChild(el("b", null, String(roleSum.met)));
    n1.appendChild(document.createTextNode(" / " + roleSum.total));
    stat1.appendChild(n1);
    stat1.appendChild(el("div", "stat-label", "färdigheter på rekommenderad nivå"));
    stats.appendChild(stat1);

    var gapped = points
      .map(function (d) { return { area: d.area, gap: d.target - d.current }; })
      .filter(function (d) { return d.gap > 0.001; })
      .sort(function (a, b) { return b.gap - a.gap; });
    var stat2 = el("div", "stat");
    if (gapped.length) {
      stat2.appendChild(el("div", "stat-num stat-area", gapped[0].area));
      stat2.appendChild(el("div", "stat-label", "störst utvecklingsbehov just nu"));
    } else {
      stat2.appendChild(el("div", "stat-num stat-area", "Allt på nivå"));
      stat2.appendChild(el("div", "stat-label", "inga gap kvar i rollen"));
    }
    stats.appendChild(stat2);
    side.appendChild(stats);

    var list = el("div", "dash-areas");
    points.forEach(function (d, idx) {
      var row = el("button", "dash-area-row");
      row.type = "button";
      row.setAttribute("data-area-index", idx);

      var top = el("div", "dar-top");
      top.appendChild(el("span", "dar-name", d.area));
      top.appendChild(el("span", "dar-count" + (d.met === d.total ? " is-complete" : ""),
        d.met + "/" + d.total));
      row.appendChild(top);

      var bar = el("div", "dar-bar");
      var tBar = el("i", "dar-bar-target");
      tBar.style.width = (d.target / MAX * 100).toFixed(1) + "%";
      var cBar = el("i", "dar-bar-current");
      cBar.style.width = (d.current / MAX * 100).toFixed(1) + "%";
      bar.appendChild(tBar);
      bar.appendChild(cBar);
      row.appendChild(bar);

      list.appendChild(row);
    });
    side.appendChild(list);
    grid.appendChild(side);

    pane.appendChild(grid);
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
        if (nextGuide) {
          card.appendChild(el("p", "plan-next-text",
            logic.normalizeGuide(nextGuide).summary));
        }

        grid.appendChild(card);
      });
      groupEl.appendChild(grid);
      pane.appendChild(groupEl);
    });
  }

  // ====================================================================
  // QUIZ modal
  // ====================================================================

  function openQuiz(leafId) {
    var questions = quizData[leafId] || [];
    if (!questions.length) return;
    quizSession = {
      leafId: leafId, questions: questions,
      answers: [], index: 0, pending: null, revealed: false
    };
    document.getElementById("quiz-overlay").hidden = false;
    renderQuiz();
  }

  function closeQuiz() {
    quizSession = null;
    var overlay = document.getElementById("quiz-overlay");
    overlay.hidden = true;
    overlay.innerHTML = "";
    render();
  }

  function renderQuiz() {
    var overlay = document.getElementById("quiz-overlay");
    overlay.innerHTML = "";
    var leaf = findLeaf(quizSession.leafId);

    var modal = el("div", "quiz-modal");

    var head = el("div", "quiz-head");
    var heies = el("div", "quiz-headings");
    heies.appendChild(el("span", "quiz-eyebrow", "Kunskapstest"));
    heies.appendChild(el("h2", "quiz-title", leaf.title));
    head.appendChild(heies);
    var close = el("button", "quiz-close");
    close.type = "button";
    close.setAttribute("data-quiz-close", "1");
    close.setAttribute("aria-label", "Stäng test");
    close.appendChild(svg("M18 6L6 18M6 6l12 12", "0 0 24 24"));
    head.appendChild(close);
    modal.appendChild(head);

    if (quizSession.index >= quizSession.questions.length) {
      modal.appendChild(renderQuizResult(leaf));
    } else {
      modal.appendChild(renderQuizQuestion());
    }

    overlay.appendChild(modal);
  }

  function renderQuizQuestion() {
    var qs = quizSession.questions;
    var i = quizSession.index;
    var q = qs[i];
    var wrap = el("div", "quiz-body");

    var prog = el("div", "quiz-progress");
    prog.appendChild(el("span", "quiz-progress-text", "Fråga " + (i + 1) + " / " + qs.length));
    var bar = el("div", "quiz-progress-bar");
    var fill = el("i");
    fill.style.width = Math.round((i / qs.length) * 100) + "%";
    bar.appendChild(fill);
    prog.appendChild(bar);
    wrap.appendChild(prog);

    wrap.appendChild(el("p", "quiz-prompt", q.prompt));

    var opts = el("div", "quiz-options");
    q.options.forEach(function (opt, oi) {
      var cls = "quiz-option";
      if (quizSession.revealed) {
        if (oi === q.answer) cls += " is-correct";
        else if (oi === quizSession.pending) cls += " is-wrong";
      } else if (oi === quizSession.pending) {
        cls += " is-chosen";
      }
      var b = el("button", cls);
      b.type = "button";
      b.setAttribute("data-quiz-option", String(oi));
      if (quizSession.revealed) b.disabled = true;
      b.appendChild(el("span", "quiz-option-text", opt));
      opts.appendChild(b);
    });
    wrap.appendChild(opts);

    if (quizSession.revealed) {
      var correct = quizSession.pending === q.answer;
      var fb = el("div", "quiz-feedback" + (correct ? " is-correct" : " is-wrong"));
      fb.appendChild(el("strong", null, correct ? "Rätt!" : "Inte riktigt."));
      if (q.explanation) fb.appendChild(el("p", null, q.explanation));
      wrap.appendChild(fb);

      var next = el("button", "quiz-next");
      next.type = "button";
      next.setAttribute("data-quiz-next", "1");
      next.textContent = (i + 1 >= qs.length) ? "Se resultat" : "Nästa fråga";
      wrap.appendChild(next);
    } else {
      var submit = el("button", "quiz-submit");
      submit.type = "button";
      submit.setAttribute("data-quiz-answer", "1");
      submit.textContent = "Svara";
      if (quizSession.pending == null) submit.disabled = true;
      wrap.appendChild(submit);
    }

    return wrap;
  }

  function renderQuizResult(leaf) {
    var graded = quizApi.gradeQuiz(quizSession.questions, quizSession.answers);
    var level = quizApi.resultLevel(graded);
    saveQuizResult(leaf.id, level);

    var wrap = el("div", "quiz-body quiz-result");
    wrap.appendChild(el("p", "quiz-result-eyebrow", "Ditt resultat"));

    var big = el("div", "quiz-result-level");
    big.appendChild(el("b", null, String(level)));
    big.appendChild(document.createTextNode(" · " + labelForLevel(level)));
    wrap.appendChild(big);

    var breakdown = el("div", "quiz-breakdown");
    [1, 2, 3].forEach(function (L) {
      var g = graded[L] || { correct: 0, total: 0 };
      var passed = g.total > 0 && g.correct === g.total;
      var row = el("div", "quiz-bd-row" + (passed ? " is-pass" : ""));
      row.appendChild(el("span", "quiz-bd-level", "Nivå " + L));
      row.appendChild(el("span", "quiz-bd-score", g.correct + "/" + g.total + " rätt"));
      var mark = el("span", "quiz-bd-mark");
      mark.appendChild(svg(passed ? "M20 6L9 17l-5-5" : "M18 6L6 18M6 6l12 12", "0 0 24 24"));
      row.appendChild(mark);
      breakdown.appendChild(row);
    });
    wrap.appendChild(breakdown);

    var current = logic.getLevel(levels, leaf.id);
    wrap.appendChild(el("p", "quiz-result-note",
      "Din nuvarande skattning: " + labelForLevel(current) + " (nivå " + current + ")."));

    var actions = el("div", "quiz-actions");
    if (level !== current) {
      var setBtn = el("button", "quiz-set");
      setBtn.type = "button";
      setBtn.setAttribute("data-quiz-set", String(level));
      setBtn.textContent = "Sätt min nivå till " + level;
      actions.appendChild(setBtn);
    }
    var keep = el("button", "quiz-keep");
    keep.type = "button";
    keep.setAttribute("data-quiz-close", "1");
    keep.textContent = (level === current) ? "Stäng" : "Behåll nivå " + current;
    actions.appendChild(keep);

    var retry = el("button", "quiz-retry");
    retry.type = "button";
    retry.setAttribute("data-quiz-retry", "1");
    retry.textContent = "Gör om";
    actions.appendChild(retry);

    wrap.appendChild(actions);
    return wrap;
  }

  // ====================================================================
  // Render orchestration
  // ====================================================================

  function setView(next) {
    view = next;
    document.getElementById("dashboard-view").hidden = (view !== "dashboard");
    document.getElementById("overview-view").hidden = (view !== "overview");
    document.getElementById("plan-view").hidden = (view !== "plan");
  }

  function render() {
    renderRail();
    renderTopbar();
    renderRadar();
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

    if (quizSession) {
      if (t.id === "quiz-overlay") { closeQuiz(); return; }
      if (t.closest("[data-quiz-close]")) { closeQuiz(); return; }
      var opt = t.closest("[data-quiz-option]");
      if (opt && !quizSession.revealed) {
        quizSession.pending = parseInt(opt.getAttribute("data-quiz-option"), 10);
        renderQuiz(); return;
      }
      if (t.closest("[data-quiz-answer]") && quizSession.pending != null) {
        quizSession.answers[quizSession.index] = quizSession.pending;
        quizSession.revealed = true;
        renderQuiz(); return;
      }
      if (t.closest("[data-quiz-next]")) {
        quizSession.index += 1;
        quizSession.pending = null;
        quizSession.revealed = false;
        renderQuiz(); return;
      }
      var qSet = t.closest("[data-quiz-set]");
      if (qSet) {
        var lid = quizSession.leafId;
        var lvl = parseInt(qSet.getAttribute("data-quiz-set"), 10);
        setLevel(lid, lvl);
        closeQuiz();
        return;
      }
      if (t.closest("[data-quiz-retry]")) {
        openQuiz(quizSession.leafId);
        return;
      }
    }

    var quizOpen = t.closest("[data-quiz-open]");
    if (quizOpen) { openQuiz(quizOpen.getAttribute("data-quiz-open")); return; }

    var roleBtn = t.closest(".rail-role");
    if (roleBtn) { selectRole(roleBtn.getAttribute("data-role-id")); return; }

    var tab = t.closest(".tab");
    if (tab) { setView(tab.getAttribute("data-view")); render(); return; }

    var areaJump = t.closest("[data-area-index]");
    if (areaJump) {
      var node = role.nodes[parseInt(areaJump.getAttribute("data-area-index"), 10)];
      if (node) {
        var leaves = logic.collectLeaves(node);
        if (leaves.length) {
          selectLeaf(leaves[0].id, { toOverview: true, openArea: true, scrollIntoView: true });
        } else {
          openAreas[node.id] = true;
          setView("overview");
          render();
        }
      }
      return;
    }

    var areaHead = t.closest(".area-head");
    if (areaHead) {
      var aid = areaHead.getAttribute("data-area-id");
      openAreas[aid] = !openAreas[aid];
      renderAreas();
      return;
    }

    var levelStep = t.closest(".lvl-step");
    if (levelStep) {
      setLevel(levelStep.getAttribute("data-leaf-id"),
        parseInt(levelStep.getAttribute("data-level"), 10));
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
    if (e.key === "Escape" && quizSession) { closeQuiz(); return; }
    var opt = document.activeElement;
    if (!opt || !opt.classList || !opt.classList.contains("lvl-step")) return;
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
