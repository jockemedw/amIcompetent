# Kompetensöverblick & självskattning — designspec

**Datum:** 2026-06-06
**Status:** Godkänd för planering

## Syfte

Ett litet, fristående HTML-verktyg som för en yrkesroll visar vad man behöver
kunna (färdigheter och kunskap), låter användaren skatta sig själv mot kraven,
och lyfter fram gapet som en konkret utvecklingsplan.

Innehållet redovisas i övergripande kategorier som man klickar sig ner i, ända
ner till lägsta nivå (t.ex. enskilda lagkrav som PBL, Jordabalken, BFS 2024).

Verktyget byggs så att det klarar flera roller, men fylls med en roll först:
**Fastighetsutvecklare på Lejonfastigheter.**

## Mål och icke-mål

**Mål**
- Visa en rolls kompetensmodell i ett expanderbart träd (kategori → … → löv).
- Låta användaren skatta sig själv på en nivåskala per löv.
- Visa gap mot rekommenderad nivå, både per kategori och som samlad
  utvecklingsplan.
- Fungera genom att bara dubbelklicka på en fil — ingen server, ingen
  inloggning, ingen build.

**Icke-mål (medvetet utanför scope nu)**
- Redigering av roller/färdigheter i gränssnittet.
- Flera användare, inloggning, server eller databas.
- Export/import av skattning.
- Jämförelse mellan roller.

Strukturen ska inte hindra något av detta i framtiden, men det byggs inte nu.

## Teknik och filstruktur

Ren HTML/CSS/JavaScript. Inget ramverk, ingen byggprocess.

| Fil | Ansvar |
|-----|--------|
| `index.html` | Sidans struktur |
| `styles.css` | Utseende |
| `app.js` | Rendering och logik |
| `data.js` | Allt innehåll (roller, kategorier, färdigheter, lagkrav, nivåer) |

`data.js` exponerar innehållet som ett globalt JavaScript-objekt
(`window.COMPETENCY_DATA`) och laddas via en vanlig `<script>`-tagg — **inte**
som en `.json` som hämtas med `fetch`. Detta är ett medvetet val: det gör att
verktyget fungerar när `index.html` öppnas direkt från filsystemet (`file://`),
utan att webbläsarens säkerhetsspärrar för filhämtning blockerar innehållet.
Filen är ändå lättläst och lätt att redigera.

## Datamodell

Strukturen är ett rekursivt träd. En nod har antingen `children` (är en
gruppering) eller saknar `children` (är ett **löv** som skattas och har en
rekommenderad nivå `target`). Principen är: *ett löv är där trädet tar slut i
just den grenen* — författaren bestämmer djupet per gren beroende på vad som är
meningsfullt.

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
      { id: "juridik", title: "Juridik & lagkrav", children: [
        { id: "lagkrav", title: "Kännedom om lagkrav", children: [
          { id: "pbl", title: "PBL (Plan- och bygglagen)", target: 3, description: "..." },
          { id: "jordabalken", title: "Jordabalken", target: 2 },
          { id: "bfs2024", title: "BFS 2024", target: 1 }
        ]}
      ]},
      { id: "ekonomi", title: "Ekonomi & kalkyl", children: [
        { id: "investeringskalkyl", title: "Investeringskalkylering", target: 3 },
        { id: "fastighetsvardering", title: "Fastighetsvärdering", target: 2 }
      ]},
      { id: "projektledning", title: "Projektledning", target: 3 }
    ]
  }]
};
```

**Regler**
- Ett löv (nod utan `children`) har `target` och kan skattas av användaren.
- En förälder (nod med `children`) skattas aldrig; den summerar sina löv.
- `id` ska vara unikt inom rollen (används som nyckel för sparad skattning).
- `description` är valfri.
- `scale` ligger i datafilen så att indelningen är lätt att justera. Standard är
  4 steg: Ingen / Grundläggande / Kompetent / Expert (nivå 0–3).

## Gränssnitt

**Topp**
- Rollens titel och organisation.
- En samlad överblick, t.ex. "8 av 14 färdigheter på rekommenderad nivå".

**Huvudvy — expanderbart träd (accordion)**
- Klick på en kategori fäller ut dess innehåll; man klickar sig vidare neråt
  till löven.
- Varje förälder visar en kort summering av sina löv, t.ex. "3 av 5 löv på
  rekommenderad nivå", med tydlig markering av hur många som ligger under mål.

**Löv**
- Titel, ev. beskrivning, rekommenderad nivå.
- En enkel nivåväljare för användarens egen skattning
  (Ingen / Grundläggande / Kompetent / Expert).
- Visuell markering när användarens nivå ligger under `target`.

**Utvecklingsplan**
- En knapp/flik som filtrerar fram enbart de löv där användarens nivå <
  `target`.
- Grupperat per kategori, sorterat efter störst gap först.
- Utgör den konkreta "att utveckla"-listan.

## Summering och gap (logik)

- **Gap för ett löv** = `target − användarens nivå` (≤ 0 betyder uppnått mål).
- **Förälderns summering** = antal löv (rekursivt under noden) vars nivå ≥ deras
  `target`, av totala antalet löv under noden.
- **Rollens överblick** = samma summering räknad över rollens alla löv.

## Sparning

- Användarens skattning sparas automatiskt i webbläsarens `localStorage`.
- Nyckel per roll + löv-id (t.ex. `rollId:lövId → nivå`).
- Innehållet i `data.js` ändras aldrig av verktyget — kompetensmodell och
  personlig data hålls isär.
- Begränsning (medvetet accepterad): skattning följer inte med vid byte av
  dator/webbläsare. Export/import kan läggas till senare.

## Öppna frågor

Inga. Skala (4 steg) och enbart lokal lagring är bekräftade.
