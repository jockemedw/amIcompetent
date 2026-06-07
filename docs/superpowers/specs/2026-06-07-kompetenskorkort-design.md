# Kompetenskörkort — testläge för självskattning

**Datum:** 2026-06-07
**Status:** Godkänd design, redo för plan
**Projekt:** amIcompetent (kompetensverktyget för Lejonfastigheter)

## Bakgrund & syfte

Verktyget bygger idag helt på **självskattning**: användaren väljer själv nivå 0–3
per färdighet, och nivåerna driver radarn och utvecklingsplanen. Den svaga punkten
är att det är svårt att sätta sin egen nivå ärligt — man vet inte alltid om man är
en 1, 2 eller 3.

Kompetenskörkortet är ett **testläge** som hjälper till just där: ett kort
kunskapsprov (flerval, rätt/fel) som du tar för en enskild färdighet när du fastnar
på en självskattning. Provet räknar fram en föreslagen nivå som du sedan väljer att
acceptera eller avböja.

## Beslut (från brainstorming)

| Fråga | Beslut |
|---|---|
| Vad mäter provet? | **Faktakunskap** (rätt/fel) med facit → poäng → nivå |
| Provets enhet | **Per färdighet** (leaf), inte per område/roll |
| Frågeformat | **Flerval, exakt ett rätt svar** (4 alternativ) |
| Resultatets effekt | **Föreslår nivå, användaren bekräftar** (rör aldrig skattningen automatiskt) |
| Innehållsscope (v1) | **Pilotområde först**: undergruppen "Kännedom om lagkrav" i Fastighetsutvecklare |

## Pilotomfång

Område **"Juridik & lagkrav"** → undergrupp **"Kännedom om lagkrav"** = 5 färdigheter:

- `pbl` — PBL (Plan- och bygglagen), target 3
- `jordabalken` — Jordabalken, target 2
- `bfs2024` — Boverkets byggregler (BBR/BFS), target 2
- `lou` — LOU (Lag om offentlig upphandling), target 3
- `miljobalken` — Miljöbalken, target 2

Alla fem har redan fulla `levelGuide` med `summary` + `indicators` per nivå 1–3,
vilka används som specifikation för vad varje fråga ska bevisa.

**Frågor per färdighet:** 2 frågor per nivå, nivåerna 1–3, **oavsett `target`**.
6 frågor × 5 färdigheter = **~30 frågor** i piloten. Att alltid täcka upp till nivå
3 gör att provet kan placera även den som är expert på en target-2-färdighet.

## Arkitektur

Tre tydligt åtskilda delar, i linje med befintlig kodstruktur:

- **`quiz-data.js`** (ny) — frågeinnehåll. `data.js` förblir orörd.
- **`quiz-logic.js`** (ny) — ren graderingslogik, ingen DOM. Dubbelnatur
  (browser-global `window.QuizLogic` + Node-modul) precis som `logic.js`, så den
  kan testas med `node --test`.
- **`app.js`** (ändras) — DOM: "Testa dig själv"-knapp, modal, resultatskärm, samt
  koppling resultat → samma `setLevel`-väg som självskattningen.

`logic.js`, `data.js` och deras 35 befintliga tester förblir orörda.

### Datamodell — `quiz-data.js`

```js
window.QUIZ_DATA = {
  pbl: [
    {
      level: 1,
      prompt: "Vad styr vad som får byggas på en plats?",
      options: ["Bygglovet", "Detaljplanen", "Startbeskedet", "Miljöbalken"],
      answer: 1,
      explanation: "Detaljplanen reglerar markanvändning; bygglovet prövas mot den."
    }
    // ... 2 frågor per nivå (1, 2, 3)
  ]
  // jordabalken, bfs2024, lou, miljobalken
};
```

Varje fråga: `level` (1/2/3), `prompt`, `options` (exakt 4), `answer` (index 0–3),
`explanation` (facit som visas efter svar).

### Logik — `quiz-logic.js`

Rena funktioner:

- `hasQuiz(leafId)` → boolean. Styr om "Testa dig själv"-knappen visas.
- `gradeQuiz(questions, answers)` → per nivå `{ correct, total }`. `answers` är
  användarens valda index per fråga.
- `resultLevel(graded)` → **högsta sammanhängande nivån** som klarats.
  - Klara en nivå = **alla** dess frågor rätt (med 2 frågor: båda rätt).
  - Faller du på nivå 1 → resultat **0**.
  - Faller du på nivå 2 (men klarade 1) → resultat **1**. Rätt på nivå 3 räknas
    **inte** om nivå 2 brast — gap tyder på gissning.

Tröskeln "alla rätt per nivå" är medvetet enkel och justerbar; den lever som en
parameter i logiken så den kan tunas utan att röra UI.

### UI & flöde — `app.js` + `styles.css`

1. I detaljpanelen, vid nivåtrappan: knapp **"Testa dig själv"**, visas bara när
   `hasQuiz(leafId)` är sant.
2. Knappen öppnar ett **overlay-modal**:
   - En fråga i taget med progress ("Fråga 3/6").
   - 4 svarsalternativ som radioknappar + **Svara**-knapp.
   - Efter svar: omedelbar **rätt/fel-markering + facit** (`explanation`), sen
     **Nästa**. Provet lär ut, inte bara mäter.
3. **Resultatskärm** när alla frågor besvarats:
   - Nivå-för-nivå-utfall (Nivå 1 ✓ · Nivå 2 ✓ · Nivå 3 ✗).
   - Föreslagen nivå + din nuvarande skattning.
   - **[Sätt nivå till X]** och **[Behåll]**, samt **[Gör om]**.
   - "Sätt nivå" går genom **exakt samma väg** som självskattningen idag
     (uppdaterar `levels`, sparar till localStorage, ritar om radar + plan).

Modalen byggs i JS (ingen ny markup i `index.html` utöver ett tomt
overlay-rotelement). Tangentbordsnav och `[hidden]`-mönstret återanvänds från
befintlig kod.

### Persistens

Lätt minne per testad färdighet:

- Nyckel: `amicompetent:quiz:<roleId>:<leafId>`
- Värde: `{ resultLevel, date }`

Ger en liten **"Testad ✓"**-markering i nivåtrappan så användaren ser vad hen
verifierat med prov vs gissat. Detta minne **rör aldrig självskattningen
automatiskt** — det är bara en markering. Nivån ändras enbart när användaren klickar
"Sätt nivå".

## Tester (TDD)

`tests/quiz-logic.test.js`:

- `gradeQuiz`: räknar rätt per nivå korrekt.
- `resultLevel`: sammanhängande-nivå-regeln — alla fel → 0, allt rätt → 3, gap i
  mitten (klarar 1 + 3 men inte 2) → 1, klarar bara 1 → 1.
- `hasQuiz`: sant för pilotens leafs, falskt för okända.

Validering av `quiz-data.js` (kan ligga i samma testfil eller `tests/quiz-data.test.js`):

- Varje fråga har `options.length === 4`.
- `answer` är ett heltal 0–3 inom `options`.
- Varje färdighet i banken har frågor på nivå 1, 2 och 3.
- `level` är 1, 2 eller 3.

## Avgränsningar (YAGNI)

- Ingen aggregering till "roll-körkort" i v1 (kan byggas senare ovanpå per-skill-minnet).
- Inget separat resultat-spår vid sidan av skattningen (valt: föreslår + bekräftar).
- Ingen tidtagning, inga poängpooler, ingen slumpning av frågeordning i v1.
- Frågebanker byggs bara för pilotens 5 färdigheter; övriga visar ingen testknapp.

## Filer

**Nya:** `quiz-data.js`, `quiz-logic.js`, `tests/quiz-logic.test.js`
**Ändrade:** `index.html` (ladda nya script + ett overlay-rotelement), `app.js`
(knapp, modal, resultat, koppling till setLevel), `styles.css` (modal + provstil)
