# Kompetenskörkort Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-skill knowledge quiz ("kompetenskörkort") that grades the user on levels 1–3 and proposes a self-assessment level they can accept or decline.

**Architecture:** Three clearly separated parts mirroring the existing codebase: `quiz-data.js` (content), `quiz-logic.js` (pure grading, dual browser-global/Node-module like `logic.js`), and additions to `app.js` (modal UI + result → existing `setLevel` path). `data.js`, `logic.js`, and their 35 tests are untouched.

**Tech Stack:** Vanilla HTML/CSS/JS (no build, runs over `file://` or http). Tests via `node --test`. Browser verification via Playwright over http.

---

## File Structure

- **Create `quiz-logic.js`** — pure functions: `hasQuiz`, `gradeQuiz`, `resultLevel`, `validateQuizData`. No DOM. `window.QuizLogic` + `module.exports`.
- **Create `quiz-data.js`** — `window.QUIZ_DATA`: map of `leafId` → question array. Pilot content for 5 skills.
- **Create `tests/quiz-logic.test.js`** — TDD tests for the logic + validation of `quiz-data.js`.
- **Modify `index.html`** — load `quiz-data.js` + `quiz-logic.js` before `app.js`; add an empty quiz overlay root element.
- **Modify `app.js`** — "Testa dig själv" button, modal flow (question → feedback → result), result → `setLevel`, per-skill "Testad"-marker + persistence.
- **Modify `styles.css`** — overlay/modal/question/result styling.

**Pilot scope:** skills `pbl`, `jordabalken`, `bfs2024`, `lou`, `miljobalken` (the "Kännedom om lagkrav" subgroup of Fastighetsutvecklare). 2 questions per level, levels 1–3 → 6 questions each, 30 total.

---

## Task 1: `quiz-logic.js` — `hasQuiz`

**Files:**
- Create: `quiz-logic.js`
- Test: `tests/quiz-logic.test.js`

- [ ] **Step 1: Write the failing test**

```js
const test = require("node:test");
const assert = require("node:assert");
const quiz = require("../quiz-logic.js");

const sampleData = {
  alpha: [
    { level: 1, prompt: "q", options: ["a", "b", "c", "d"], answer: 0 }
  ]
};

test("hasQuiz: true when leaf has at least one question", () => {
  assert.strictEqual(quiz.hasQuiz(sampleData, "alpha"), true);
});

test("hasQuiz: false for unknown leaf", () => {
  assert.strictEqual(quiz.hasQuiz(sampleData, "nope"), false);
});

test("hasQuiz: false when leaf maps to empty array", () => {
  assert.strictEqual(quiz.hasQuiz({ beta: [] }, "beta"), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quiz-logic.test.js`
Expected: FAIL — `Cannot find module '../quiz-logic.js'`.

- [ ] **Step 3: Write minimal implementation**

```js
// Pure logic for the quiz/körkort. No DOM access.
// Works as a browser global (window.QuizLogic) and as a Node module.
(function (root) {
  function hasQuiz(quizData, leafId) {
    var qs = quizData && quizData[leafId];
    return !!(qs && qs.length);
  }

  var api = {
    hasQuiz: hasQuiz
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.QuizLogic = api;
  }
})(typeof self !== "undefined" ? self : this);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quiz-logic.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add quiz-logic.js tests/quiz-logic.test.js
git commit -m "Add quiz-logic hasQuiz"
```

---

## Task 2: `quiz-logic.js` — `gradeQuiz`

**Files:**
- Modify: `quiz-logic.js`
- Test: `tests/quiz-logic.test.js`

- [ ] **Step 1: Write the failing test** (append to `tests/quiz-logic.test.js`)

```js
const gradeQuestions = [
  { level: 1, answer: 0 }, { level: 1, answer: 2 },
  { level: 2, answer: 1 }, { level: 2, answer: 3 },
  { level: 3, answer: 0 }, { level: 3, answer: 1 }
];

test("gradeQuiz: tallies correct/total per level", () => {
  // all correct
  const g = quiz.gradeQuiz(gradeQuestions, [0, 2, 1, 3, 0, 1]);
  assert.deepStrictEqual(g[1], { correct: 2, total: 2 });
  assert.deepStrictEqual(g[2], { correct: 2, total: 2 });
  assert.deepStrictEqual(g[3], { correct: 2, total: 2 });
});

test("gradeQuiz: counts wrong answers", () => {
  // miss one level-2 and one level-3
  const g = quiz.gradeQuiz(gradeQuestions, [0, 2, 1, 0, 9, 1]);
  assert.deepStrictEqual(g[1], { correct: 2, total: 2 });
  assert.deepStrictEqual(g[2], { correct: 1, total: 2 });
  assert.deepStrictEqual(g[3], { correct: 1, total: 2 });
});

test("gradeQuiz: missing answer counts as wrong", () => {
  const g = quiz.gradeQuiz(gradeQuestions, [0, 2, 1, 3, 0]); // last omitted
  assert.deepStrictEqual(g[3], { correct: 1, total: 2 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quiz-logic.test.js`
Expected: FAIL — `quiz.gradeQuiz is not a function`.

- [ ] **Step 3: Write minimal implementation** (add `gradeQuiz` and export it)

```js
  // answers[i] = the option index the user picked for questions[i].
  // Returns { <level>: { correct, total } } for every level present.
  function gradeQuiz(questions, answers) {
    var out = {};
    questions.forEach(function (q, i) {
      if (!out[q.level]) out[q.level] = { correct: 0, total: 0 };
      out[q.level].total += 1;
      if (answers[i] === q.answer) out[q.level].correct += 1;
    });
    return out;
  }
```

Add to `api`:

```js
  var api = {
    hasQuiz: hasQuiz,
    gradeQuiz: gradeQuiz
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quiz-logic.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add quiz-logic.js tests/quiz-logic.test.js
git commit -m "Add quiz-logic gradeQuiz"
```

---

## Task 3: `quiz-logic.js` — `resultLevel`

**Files:**
- Modify: `quiz-logic.js`
- Test: `tests/quiz-logic.test.js`

- [ ] **Step 1: Write the failing test** (append)

```js
test("resultLevel: highest contiguous fully-correct level", () => {
  const graded = {
    1: { correct: 2, total: 2 },
    2: { correct: 2, total: 2 },
    3: { correct: 0, total: 2 }
  };
  assert.strictEqual(quiz.resultLevel(graded), 2);
});

test("resultLevel: all correct => 3", () => {
  const graded = {
    1: { correct: 2, total: 2 },
    2: { correct: 2, total: 2 },
    3: { correct: 2, total: 2 }
  };
  assert.strictEqual(quiz.resultLevel(graded), 3);
});

test("resultLevel: fail level 1 => 0", () => {
  const graded = {
    1: { correct: 1, total: 2 },
    2: { correct: 2, total: 2 },
    3: { correct: 2, total: 2 }
  };
  assert.strictEqual(quiz.resultLevel(graded), 0);
});

test("resultLevel: gap in the middle stops at last contiguous pass", () => {
  // passed 1, failed 2, 'passed' 3 — level 3 does not count
  const graded = {
    1: { correct: 2, total: 2 },
    2: { correct: 1, total: 2 },
    3: { correct: 2, total: 2 }
  };
  assert.strictEqual(quiz.resultLevel(graded), 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quiz-logic.test.js`
Expected: FAIL — `quiz.resultLevel is not a function`.

- [ ] **Step 3: Write minimal implementation** (add `resultLevel`, export it)

```js
  // The level the quiz places you at: the highest L such that every level
  // 1..L was answered fully correctly. A gap caps you below it (a later
  // level passing after an earlier one failed reads as guessing).
  function resultLevel(graded) {
    var level = 0;
    for (var L = 1; L <= 3; L++) {
      var g = graded[L];
      if (g && g.total > 0 && g.correct === g.total) level = L;
      else break;
    }
    return level;
  }
```

Add `resultLevel: resultLevel` to `api`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quiz-logic.test.js`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add quiz-logic.js tests/quiz-logic.test.js
git commit -m "Add quiz-logic resultLevel"
```

---

## Task 4: `quiz-logic.js` — `validateQuizData`

**Files:**
- Modify: `quiz-logic.js`
- Test: `tests/quiz-logic.test.js`

- [ ] **Step 1: Write the failing test** (append)

```js
test("validateQuizData: clean data has no errors", () => {
  const data = {
    foo: [
      { level: 1, prompt: "p", options: ["a","b","c","d"], answer: 0 },
      { level: 2, prompt: "p", options: ["a","b","c","d"], answer: 3 },
      { level: 3, prompt: "p", options: ["a","b","c","d"], answer: 1 }
    ]
  };
  assert.deepStrictEqual(quiz.validateQuizData(data), []);
});

test("validateQuizData: flags wrong option count, bad answer, missing level", () => {
  const data = {
    bar: [
      { level: 1, prompt: "p", options: ["a","b","c"], answer: 0 }, // 3 options
      { level: 2, prompt: "p", options: ["a","b","c","d"], answer: 9 } // bad answer; no level 3
    ]
  };
  const errors = quiz.validateQuizData(data);
  assert.ok(errors.some(e => e.includes("4 options")));
  assert.ok(errors.some(e => e.includes("answer")));
  assert.ok(errors.some(e => e.includes("level 3")));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quiz-logic.test.js`
Expected: FAIL — `quiz.validateQuizData is not a function`.

- [ ] **Step 3: Write minimal implementation** (add `validateQuizData`, export it)

```js
  // Structural checks reused by the data test. Returns an array of strings.
  function validateQuizData(quizData) {
    var errors = [];
    Object.keys(quizData).forEach(function (leafId) {
      var qs = quizData[leafId];
      var levelsSeen = {};
      qs.forEach(function (q, i) {
        var where = leafId + "[" + i + "]";
        if (!q.options || q.options.length !== 4) {
          errors.push(where + ": must have exactly 4 options");
        }
        if (typeof q.answer !== "number" || q.answer < 0 || q.answer > 3) {
          errors.push(where + ": answer must be an index 0-3");
        }
        if (q.level !== 1 && q.level !== 2 && q.level !== 3) {
          errors.push(where + ": level must be 1, 2 or 3");
        } else {
          levelsSeen[q.level] = true;
        }
      });
      [1, 2, 3].forEach(function (L) {
        if (!levelsSeen[L]) errors.push(leafId + ": missing a question for level " + L);
      });
    });
    return errors;
  }
```

Add `validateQuizData: validateQuizData` to `api`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quiz-logic.test.js`
Expected: PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add quiz-logic.js tests/quiz-logic.test.js
git commit -m "Add quiz-logic validateQuizData"
```

---

## Task 5: `quiz-data.js` — pilot question banks

**Files:**
- Create: `quiz-data.js`
- Test: `tests/quiz-logic.test.js` (add a data-validation test)

- [ ] **Step 1: Write the failing test** (append to `tests/quiz-logic.test.js`)

```js
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadQuizData() {
  const code = fs.readFileSync(path.join(__dirname, "..", "quiz-data.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  return sandbox.window.QUIZ_DATA;
}

test("quiz-data.js: covers the five pilot skills", () => {
  const data = loadQuizData();
  ["pbl", "jordabalken", "bfs2024", "lou", "miljobalken"].forEach(id => {
    assert.ok(data[id] && data[id].length >= 6, "missing/short bank: " + id);
  });
});

test("quiz-data.js: passes structural validation", () => {
  const data = loadQuizData();
  assert.deepStrictEqual(quiz.validateQuizData(data), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quiz-logic.test.js`
Expected: FAIL — `ENOENT` reading `quiz-data.js`.

- [ ] **Step 3: Write `quiz-data.js`**

Create `quiz-data.js` with this exact content (questions grounded in each skill's `levelGuide.indicators`; correct-answer positions are varied):

```js
// Frågebank för kompetenskörkortet. Map: leafId → lista av frågor.
// Varje fråga: { level (1-3), prompt, options (4 st), answer (index 0-3),
// explanation }. data.js förblir orörd; detta är en separat innehållsfil.
// Pilot: undergruppen "Kännedom om lagkrav" i rollen Fastighetsutvecklare.
window.QUIZ_DATA = {

  pbl: [
    { level: 1,
      prompt: "Vad styr i första hand vad som får byggas på en viss plats?",
      options: ["Bygglovet", "Startbeskedet", "Detaljplanen", "Bygganmälan"],
      answer: 2,
      explanation: "Detaljplanen reglerar markanvändningen; bygglovet prövas mot planen." },
    { level: 1,
      prompt: "Vad krävs normalt innan en bygglovspliktig åtgärd får påbörjas?",
      options: ["Startbesked", "Slutbesked", "Energideklaration", "Lagfart"],
      answer: 0,
      explanation: "Startbeskedet ger klartecken att börja bygga; slutbesked kommer först när allt är klart." },
    { level: 2,
      prompt: "En önskad åtgärd är planstridig. Vad är den normala vägen framåt?",
      options: ["Den får alltid beviljas ändå", "Den kräver planändring eller prövning av avvikelse",
                "Den avgörs av entreprenören", "Den är alltid förbjuden"],
      answer: 1,
      explanation: "Är åtgärden planstridig krävs planändring, eller prövning av om det är en tillåten avvikelse." },
    { level: 2,
      prompt: "Vad bör du säkerställa när du tidsätter ett projekt med bygglov?",
      options: ["Att lovet hanteras efter byggstart", "Att lov inte påverkar tidplanen",
                "Att lovskedet läggs in realistiskt i tidplanen", "Att entreprenören söker lovet"],
      answer: 2,
      explanation: "Lov- och anmälningsskeden tar tid och måste in i projektets tidplan från början." },
    { level: 3,
      prompt: "När bör planrelaterade risker helst identifieras?",
      options: ["Vid slutbesiktning", "I tidiga skeden, innan de blir dyra förseningar",
                "Efter byggstart", "När bygglovet avslås"],
      answer: 1,
      explanation: "Tidig identifiering gör att planrisker kan hanteras innan de blir kostsamma förseningar." },
    { level: 3,
      prompt: "Vad är ett planbesked?",
      options: ["Ett beslut om bygglov", "Ett startbesked för bygge",
                "Kommunens besked om man är beredd att pröva en detaljplan", "Ett miljötillstånd"],
      answer: 2,
      explanation: "Ett planbesked är kommunens besked om den är beredd att inleda en planläggning." }
  ],

  jordabalken: [
    { level: 1,
      prompt: "Vilken rättighet kan belasta en fastighet och ge någon annan rätt att använda en del av den?",
      options: ["Bygglov", "Servitut", "Bolagsordning", "Detaljplan"],
      answer: 1,
      explanation: "Ett servitut ger en fastighet rätt att använda en del av en annan fastighet." },
    { level: 1,
      prompt: "Var regleras köp av fast egendom?",
      options: ["Köplagen", "Avtalslagen", "Jordabalken", "Plan- och bygglagen"],
      answer: 2,
      explanation: "Köp av fast egendom (fastighet) regleras i jordabalken." },
    { level: 2,
      prompt: "Var hittar du tillförlitligt vilka rättigheter som belastar en fastighet?",
      options: ["I bygglovet", "I fastighetsregistret", "I detaljplanen", "Hos entreprenören"],
      answer: 1,
      explanation: "Fastighetsregistret visar belastande och förmånliga rättigheter på en fastighet." },
    { level: 2,
      prompt: "Vilken aktör beställer du åtgärder från för att bilda eller ändra servitut och fastighetsgränser?",
      options: ["Boverket", "Skatteverket", "Lantmäteriet", "Länsstyrelsen"],
      answer: 2,
      explanation: "Lantmäteriet hanterar fastighetsbildning, servitut och gränser." },
    { level: 3,
      prompt: "Vad kännetecknar ett väl utformat servitutsupplägg?",
      options: ["Att det gäller bara ett år", "Att det håller över tid trots ändrat ägande",
                "Att det bara gynnar säljaren", "Att det inte behöver registreras"],
      answer: 1,
      explanation: "Ett hållbart upplägg fungerar även när ägande och verksamhet förändras över tid." },
    { level: 3,
      prompt: "Hur förebygger man bäst framtida gräns- och rättighetstvister?",
      options: ["Genom att avvakta tills tvist uppstår", "Genom muntliga överenskommelser",
                "Genom tydliga avtal och servitut från början", "Genom att överlåta frågan till entreprenören"],
      answer: 2,
      explanation: "Tvister förebyggs genom hur avtal och servitut skrivs redan från början." }
  ],

  bfs2024: [
    { level: 1,
      prompt: "Vad reglerar Boverkets byggregler bland annat?",
      options: ["Endast fasadfärg", "Brand, energi och tillgänglighet m.m.",
                "Markpriser", "Upphandlingsförfaranden"],
      answer: 1,
      explanation: "BBR/BFS reglerar bl.a. utformning, brand, energi och tillgänglighet." },
    { level: 1,
      prompt: "Skiljer sig kraven i byggreglerna mellan olika typer av verksamheter?",
      options: ["Nej, samma krav alltid", "Ja, de skiljer mellan verksamhetsklasser",
                "Bara för bostäder", "Bara för industri"],
      answer: 1,
      explanation: "Kraven skiljer sig mellan olika verksamhetsklasser." },
    { level: 2,
      prompt: "Vad bör du som beställare göra med projekteringshandlingar i förhållande till BBR?",
      options: ["Lita helt på entreprenören", "Granska att de uppfyller BBR-kraven",
                "Ignorera dem", "Vänta till slutbesiktning"],
      answer: 1,
      explanation: "Du granskar att handlingarna följer brand-, energi- och tillgänglighetskrav." },
    { level: 2,
      prompt: "När bör en sakkunnig (t.ex. brand eller tillgänglighet) kopplas in?",
      options: ["Aldrig", "Endast efter slutbesked",
                "När projektet kräver särskild brand- eller tillgänglighetsbedömning", "Bara om kommunen kräver det skriftligt"],
      answer: 2,
      explanation: "Sakkunnig kopplas in när projektet kräver särskild bedömning av sådana krav." },
    { level: 3,
      prompt: "Hur hanteras ett motiverat avsteg från en byggregel på ett hållbart sätt?",
      options: ["Det görs muntligt", "Det motiveras och dokumenteras",
                "Det undviks att nämnas", "Det beslutas av entreprenören ensam"],
      answer: 1,
      explanation: "Avsteg ska motiveras och dokumenteras på ett hållbart sätt." },
    { level: 3,
      prompt: "Vad innebär det att vara intern referens i regeltolkning?",
      options: ["Att du skriver reglerna", "Att du beslutar bygglov",
                "Att kollegor rådfrågar dig i svåra tolkningar", "Att du ersätter Boverket"],
      answer: 2,
      explanation: "Du är den kollegorna vänder sig till i svåra regeltolkningar." }
  ],

  lou: [
    { level: 1,
      prompt: "Vad gäller för kommunala inköp enligt LOU?",
      options: ["De är alltid fria", "De omfattas av upphandlingsplikt",
                "De beslutas av entreprenören", "De kräver aldrig konkurrens"],
      answer: 1,
      explanation: "Offentliga inköp omfattas av upphandlingsplikt enligt LOU." },
    { level: 1,
      prompt: "Vad är en direktupphandlingsgräns?",
      options: ["En gräns för byggnadshöjd", "En tidsgräns för bygglov",
                "Ett beloppstak under vilket direktupphandling får ske", "En miljögräns"],
      answer: 2,
      explanation: "Under direktupphandlingsgränsen får inköp ske utan formellt förfarande." },
    { level: 2,
      prompt: "Vad avgör i första hand vilket upphandlingsförfarande som ska väljas?",
      options: ["Entreprenörens önskemål", "Värdet och behovet",
                "Väderleken", "Slumpen"],
      answer: 1,
      explanation: "Förfarandet väljs utifrån upphandlingens värde och behov." },
    { level: 2,
      prompt: "Vad bör du planera in i projektets tidplan kopplat till upphandling?",
      options: ["Inget, upphandling tar ingen tid", "Upphandlingens ledtider",
                "Endast byggtiden", "Endast garantitiden"],
      answer: 1,
      explanation: "Upphandlingens ledtider måste planeras in i projektets tidplan." },
    { level: 3,
      prompt: "Vad minimerar risken för överprövning i en upphandling?",
      options: ["Att hoppa över annonsering", "Att förkorta anbudstiden maximalt",
                "Ett genomarbetat förfrågningsunderlag", "Att välja billigaste utan kriterier"],
      answer: 2,
      explanation: "Ett tydligt, genomarbetat förfrågningsunderlag minskar risken för överprövning." },
    { level: 3,
      prompt: "Vad balanseras i en upphandlingsstrategi för stora, komplexa projekt?",
      options: ["Endast pris", "Pris, kvalitet och risk",
                "Endast leveranstid", "Endast entreprenörens vinst"],
      answer: 1,
      explanation: "Strategin väger pris, kvalitet och risk för överprövning mot varandra." }
  ],

  miljobalken: [
    { level: 1,
      prompt: "Vad kan finnas i marken på en plats och påverka ett projekts tid och kostnad?",
      options: ["Detaljplaner", "Markföroreningar", "Bygglov", "Servitut"],
      answer: 1,
      explanation: "Markföroreningar kan kräva sanering och påverkar tid och kostnad." },
    { level: 1,
      prompt: "Vad kan vissa åtgärder kräva enligt miljöbalken?",
      options: ["Bara bygglov", "Anmälan eller tillstånd",
                "Inget alls", "Endast startbesked"],
      answer: 1,
      explanation: "Miljöfarlig verksamhet och vissa åtgärder är anmälnings- eller tillståndspliktiga." },
    { level: 2,
      prompt: "Vad beställer du för att ta reda på om mark är förorenad?",
      options: ["En detaljplan", "En miljöteknisk markundersökning",
                "Ett bygglov", "En energideklaration"],
      answer: 1,
      explanation: "En miljöteknisk markundersökning visar om och hur marken är förorenad." },
    { level: 2,
      prompt: "Var bör saneringsåtgärder hanteras i projektet?",
      options: ["Utanför projektet", "I tidplan och budget",
                "Först efter inflyttning", "Av entreprenören utan beställarens vetskap"],
      answer: 1,
      explanation: "Sanering och miljöåtgärder läggs in i projektets tidplan och budget." },
    { level: 3,
      prompt: "Vad gör man med miljörisk i ett beslutsunderlag på expertnivå?",
      options: ["Ignorerar den", "Värderar miljörisk mot affärsnytta",
                "Överlåter allt till konsult", "Skjuter upp den till efter bygget"],
      answer: 1,
      explanation: "Man väger miljörisk mot affärsnytta i beslutsunderlaget." },
    { level: 3,
      prompt: "Varför vill man fånga miljörisker tidigt?",
      options: ["För att slippa bygglov", "För att de inte ska spräcka projektet senare",
                "För att höja priset", "Det spelar ingen roll när"],
      answer: 1,
      explanation: "Tidigt fångade miljörisker undviker dyra överraskningar som spräcker projektet." }
  ]

};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quiz-logic.test.js`
Expected: PASS (14 tests).

- [ ] **Step 5: Commit**

```bash
git add quiz-data.js tests/quiz-logic.test.js
git commit -m "Add pilot quiz question banks (Kännedom om lagkrav)"
```

---

## Task 6: Wire scripts + overlay root into `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the overlay root element**

In `index.html`, after the `<div class="grain" aria-hidden="true"></div>` line (currently line 27), add:

```html
  <div class="quiz-overlay" id="quiz-overlay" hidden></div>
```

- [ ] **Step 2: Load the new scripts before `app.js`**

Replace the script block (currently lines 28–30):

```html
  <script src="data.js"></script>
  <script src="logic.js"></script>
  <script src="app.js"></script>
```

with:

```html
  <script src="data.js"></script>
  <script src="logic.js"></script>
  <script src="quiz-data.js"></script>
  <script src="quiz-logic.js"></script>
  <script src="app.js"></script>
```

- [ ] **Step 3: Verify load (manual)**

Run: `python -m http.server 8765` (from repo root), open `http://localhost:8765/` in a browser, open DevTools console.
Expected: no errors; `window.QUIZ_DATA` and `window.QuizLogic` are defined. The app still renders as before (no visible change yet).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Load quiz scripts and add quiz overlay root"
```

---

## Task 7: `app.js` — state, persistence, and the "Testa dig själv" button

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add module references and quiz state**

In `app.js`, after the existing `var scaleHelp = ...` line (line 7), add:

```js
  var quizData = window.QUIZ_DATA || {};
  var quizApi = window.QuizLogic;
```

After the existing `var lastDetailLeaf = null;` line (line 22), add:

```js
  var quizSession = null;   // { leafId, questions, answers:[], index, pending, revealed }
```

- [ ] **Step 2: Add quiz persistence helpers**

After the `saveLevels` function (ends line 42), add:

```js
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
```

- [ ] **Step 3: Show a "Testad"-marker in the detail meta**

In `renderDetail`, immediately after the block that appends the gap/done badge to `meta` and before `card.appendChild(meta);` (line 459), add:

```js
    var qr = loadQuizResult(leaf.id);
    if (qr) {
      var tested = el("span", "meta-badge is-tested");
      tested.appendChild(svg("M20 6L9 17l-5-5", "0 0 24 24"));
      tested.appendChild(document.createTextNode("Testad: nivå " + qr.resultLevel));
      meta.appendChild(tested);
    }
```

- [ ] **Step 4: Add the "Testa dig själv" button after the ladder**

In `renderDetail`, after `card.appendChild(renderLevelLadder(leaf, animate));` (line 465) and before `pane.appendChild(card);`, add:

```js
    if (quizApi.hasQuiz(quizData, leaf.id)) {
      var testBtn = el("button", "detail-test-btn");
      testBtn.type = "button";
      testBtn.setAttribute("data-quiz-open", leaf.id);
      testBtn.appendChild(svg("M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", "0 0 24 24"));
      testBtn.appendChild(document.createTextNode("Testa dig själv"));
      card.appendChild(testBtn);
    }
```

- [ ] **Step 5: Verify (manual)**

Run: serve over http (`python -m http.server 8765`), open the app, go to **Färdigheter**, pick **PBL** under Juridik & lagkrav.
Expected: a "Testa dig själv" button shows under the level ladder. A skill without a bank (e.g. one in another area) shows no button. Clicking does nothing yet (handler comes next).

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "Add quiz state, persistence, and Testa dig själv button"
```

---

## Task 8: `app.js` — quiz modal: question flow

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add open/close + question rendering**

In `app.js`, just before the `// Render orchestration` section (before `function setView` on line 699), add:

```js
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
    render();   // refresh detail so the "Testad"-marker / new level shows
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
```

- [ ] **Step 2: Add a placeholder `renderQuizResult` so the file parses**

Still before `setView`, add (it will be fully implemented in Task 9):

```js
  function renderQuizResult(leaf) {
    var wrap = el("div", "quiz-body");
    wrap.appendChild(el("p", "quiz-prompt", "Resultat för " + leaf.title));
    var close = el("button", "quiz-next");
    close.type = "button";
    close.setAttribute("data-quiz-close", "1");
    close.textContent = "Stäng";
    wrap.appendChild(close);
    return wrap;
  }
```

- [ ] **Step 3: Wire quiz clicks into the delegated click handler**

In the `document.addEventListener("click", ...)` handler, immediately after `var t = e.target;` (line 767), add:

```js
    if (quizSession) {
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
    }

    var quizOpen = t.closest("[data-quiz-open]");
    if (quizOpen) { openQuiz(quizOpen.getAttribute("data-quiz-open")); return; }
```

- [ ] **Step 4: Close the quiz on Escape**

In the `document.addEventListener("keydown", ...)` handler, add at the very top of the callback (before the `var opt = document.activeElement;` line):

```js
    if (e.key === "Escape" && quizSession) { closeQuiz(); return; }
```

- [ ] **Step 5: Verify (manual)**

Run: serve over http, open app → Färdigheter → PBL → "Testa dig själv".
Expected: modal opens, "Fråga 1 / 6", four options. Click an option → it highlights; "Svara" enables. Click "Svara" → correct option turns green, a wrong pick turns red, feedback text + "Nästa fråga" appear. Walk to the end → placeholder result with "Stäng" closes the modal. Escape and the ✕ also close it.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "Add quiz modal question flow"
```

---

## Task 9: `app.js` — quiz result screen + apply level

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace the placeholder `renderQuizResult` with the real one**

Replace the entire placeholder `renderQuizResult` function added in Task 8 with:

```js
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
```

- [ ] **Step 2: Handle "Sätt nivå" and "Gör om" clicks**

In the delegated click handler, inside the `if (quizSession) { ... }` block (added in Task 8), add these BEFORE the closing `}` of that block:

```js
      var qSet = t.closest("[data-quiz-set]");
      if (qSet) {
        var lid = quizSession.leafId;
        var lvl = parseInt(qSet.getAttribute("data-quiz-set"), 10);
        setLevel(lid, lvl);   // persists + re-renders the app
        closeQuiz();
        return;
      }
      if (t.closest("[data-quiz-retry]")) {
        openQuiz(quizSession.leafId);
        return;
      }
```

- [ ] **Step 3: Verify (manual)**

Run: serve over http, open app → Färdigheter → PBL → test.
- Answer all 6 correctly → result shows "3 · Expert", every level row green ✓, "Sätt min nivå till 3".
- Click "Sätt min nivå till 3" → modal closes, PBL ladder now shows level 3 selected, detail meta shows "Testad: nivå 3", radar/plan update.
- Re-open, answer level-1 questions wrong → result "0 · Ingen", level 1 row red.
- "Gör om" restarts at Fråga 1 / 6. "Behåll nivå X" closes without changing the level.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "Add quiz result screen and apply-level action"
```

---

## Task 10: `styles.css` — overlay, modal, question, result styling

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append the quiz styles**

Add to the end of `styles.css`:

```css
/* ============ Quiz / kompetenskörkort ============ */

.detail-test-btn {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--line, #d8d6cf);
  border-radius: 10px;
  background: var(--surface, #fff);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, border-color .15s, transform .05s;
}
.detail-test-btn svg { width: 18px; height: 18px; }
.detail-test-btn:hover { border-color: var(--accent, #2f5d4f); background: #f4f6f2; }
.detail-test-btn:active { transform: translateY(1px); }

.meta-badge.is-tested { background: #eef3ee; color: var(--accent, #2f5d4f); }
.meta-badge.is-tested svg { width: 14px; height: 14px; }

.quiz-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(28, 32, 28, 0.45);
  backdrop-filter: blur(3px);
  animation: quiz-fade .15s ease;
}
.quiz-overlay[hidden] { display: none; }

@keyframes quiz-fade { from { opacity: 0; } to { opacity: 1; } }

.quiz-modal {
  width: min(560px, 100%);
  max-height: 88vh;
  overflow-y: auto;
  background: var(--surface, #fff);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  animation: quiz-rise .2s ease;
}
@keyframes quiz-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

.quiz-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px 12px;
}
.quiz-eyebrow {
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--accent, #2f5d4f);
  font-weight: 700;
}
.quiz-title { margin: 4px 0 0; font-size: 22px; }
.quiz-close {
  flex: none;
  width: 36px; height: 36px;
  display: grid; place-items: center;
  border: none; border-radius: 9px;
  background: transparent; cursor: pointer;
}
.quiz-close svg { width: 20px; height: 20px; }
.quiz-close:hover { background: #eee; }

.quiz-body { padding: 6px 24px 24px; }

.quiz-progress { margin-bottom: 18px; }
.quiz-progress-text { font-size: 13px; color: #6b6f68; font-weight: 600; }
.quiz-progress-bar {
  margin-top: 6px; height: 6px; border-radius: 3px;
  background: #e7e9e3; overflow: hidden;
}
.quiz-progress-bar i {
  display: block; height: 100%;
  background: var(--accent, #2f5d4f);
  transition: width .25s ease;
}

.quiz-prompt { font-size: 18px; font-weight: 600; line-height: 1.4; margin: 0 0 16px; }

.quiz-options { display: grid; gap: 10px; }
.quiz-option {
  text-align: left;
  padding: 14px 16px;
  border: 1.5px solid var(--line, #d8d6cf);
  border-radius: 12px;
  background: var(--surface, #fff);
  font: inherit;
  cursor: pointer;
  transition: border-color .12s, background .12s;
}
.quiz-option:hover { border-color: var(--accent, #2f5d4f); }
.quiz-option.is-chosen { border-color: var(--accent, #2f5d4f); background: #eef3ee; }
.quiz-option.is-correct { border-color: #2e7d52; background: #e7f4ec; }
.quiz-option.is-wrong { border-color: #c0492f; background: #f8e8e3; }
.quiz-option[disabled] { cursor: default; }

.quiz-feedback {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.45;
}
.quiz-feedback.is-correct { background: #e7f4ec; }
.quiz-feedback.is-wrong { background: #f8e8e3; }
.quiz-feedback strong { display: block; margin-bottom: 4px; }
.quiz-feedback p { margin: 0; }

.quiz-submit, .quiz-next {
  margin-top: 18px;
  width: 100%;
  padding: 13px 16px;
  border: none;
  border-radius: 11px;
  background: var(--accent, #2f5d4f);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.quiz-submit[disabled] { background: #b9c2bb; cursor: default; }
.quiz-submit:not([disabled]):hover, .quiz-next:hover { filter: brightness(1.05); }

/* result screen */
.quiz-result-eyebrow {
  margin: 4px 0 0;
  font-size: 13px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: #6b6f68;
}
.quiz-result-level { font-size: 40px; font-weight: 700; margin: 4px 0 18px; }
.quiz-result-level b { color: var(--accent, #2f5d4f); }

.quiz-breakdown { display: grid; gap: 8px; }
.quiz-bd-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f4f3ee;
}
.quiz-bd-row.is-pass { background: #e7f4ec; }
.quiz-bd-level { font-weight: 600; }
.quiz-bd-score { font-size: 14px; color: #555; }
.quiz-bd-mark svg { width: 18px; height: 18px; }
.quiz-bd-row.is-pass .quiz-bd-mark { color: #2e7d52; }
.quiz-bd-row:not(.is-pass) .quiz-bd-mark { color: #c0492f; }

.quiz-result-note { margin: 16px 0 0; font-size: 14px; color: #555; }

.quiz-actions { display: grid; gap: 10px; margin-top: 18px; }
.quiz-set {
  padding: 13px 16px; border: none; border-radius: 11px;
  background: var(--accent, #2f5d4f); color: #fff;
  font: inherit; font-weight: 700; cursor: pointer;
}
.quiz-keep, .quiz-retry {
  padding: 12px 16px; border: 1px solid var(--line, #d8d6cf);
  border-radius: 11px; background: var(--surface, #fff);
  font: inherit; font-weight: 600; cursor: pointer;
}
.quiz-keep:hover, .quiz-retry:hover { background: #f4f6f2; }
```

- [ ] **Step 2: Close the modal when clicking the backdrop**

In `app.js`, inside the `if (quizSession) { ... }` block in the click handler, add as the FIRST check inside the block:

```js
      if (t.id === "quiz-overlay") { closeQuiz(); return; }
```

- [ ] **Step 3: Verify (manual)**

Run: serve over http, open app → Färdigheter → PBL → test.
Expected: modal is centered with a dimmed backdrop, progress bar fills as you advance, options colour correctly on reveal, result screen shows the big level + per-level breakdown + action buttons. Clicking outside the modal closes it. Check it looks right on a narrow window too.

- [ ] **Step 4: Commit**

```bash
git add styles.css app.js
git commit -m "Style quiz modal, result screen, and backdrop close"
```

---

## Task 11: Full verification + final commit

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `node --test`
Expected: all tests pass — the 35 existing logic/data tests plus the 14 new quiz tests.

- [ ] **Step 2: Browser smoke test (Playwright or manual over http)**

Serve over http (`python -m http.server 8765`) and confirm end to end:
- The four pilot skills besides PBL (`jordabalken`, `bfs2024`, `lou`, `miljobalken`) each show "Testa dig själv" and run a full 6-question test.
- A skill in another area (e.g. one under "Ekonomi & affär") shows NO test button.
- Taking a test, accepting the proposed level, updates the ladder, the "Testad"-marker, the radar, and the development plan.
- Reload the page → the set level and "Testad"-marker persist (localStorage).
- Switching role and back keeps each role's quiz results separate (the key is namespaced by role id).

- [ ] **Step 3: Confirm `data.js` / `logic.js` untouched**

Run: `git log --oneline -- data.js logic.js` and confirm no commits from this plan touched them.
Expected: their last commit predates this work.

- [ ] **Step 4: Final summary commit (if any stray changes)**

```bash
git status
# commit anything outstanding, otherwise nothing to do
```

---

## Notes for the implementer

- **Run everything over http**, not `file://` — the Playwright MCP browser blocks `file://` (per project history).
- **Deploy:** `main` auto-deploys to amicompetent.vercel.app. Commit straight to `main` (this project's workflow — no branches/PRs).
- **Correct-answer positions are varied** in `quiz-data.js` so the test can't be gamed by always picking the same slot. Keep that property if you add questions.
- **The `data-quiz-*` attributes** are the click contract between render functions and the delegated handler — keep them in sync if you rename anything.
