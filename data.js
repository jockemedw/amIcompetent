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
      {
        id: "juridik",
        title: "Juridik & lagkrav",
        children: [
          {
            id: "lagkrav",
            title: "Kännedom om lagkrav",
            children: [
              { id: "pbl", title: "PBL (Plan- och bygglagen)", target: 3,
                description: "Plan- och byggprocessen, bygglov, detaljplaners rättsverkan." },
              { id: "jordabalken", title: "Jordabalken", target: 2,
                description: "Fastighetsköp, servitut, nyttjanderätt och hyresförhållanden." },
              { id: "bfs2024", title: "BFS 2024 (Boverkets byggregler)", target: 1,
                description: "Boverkets gällande byggregler och dess tillämpning." }
            ]
          }
        ]
      },
      {
        id: "ekonomi",
        title: "Ekonomi & kalkyl",
        children: [
          { id: "investeringskalkyl", title: "Investeringskalkylering", target: 3,
            description: "Nuvärde, internränta, känslighetsanalys för investeringsbeslut." },
          { id: "fastighetsvardering", title: "Fastighetsvärdering", target: 2,
            description: "Avkastnings-, orts- och produktionskostnadsmetoder." }
        ]
      },
      {
        id: "planering",
        title: "Planering & process",
        children: [
          { id: "detaljplaner", title: "Detaljplaner", target: 3,
            description: "Läsa, tolka och driva detaljplaneprocesser." },
          { id: "projektledning", title: "Projektledning", target: 3,
            description: "Driva utvecklingsprojekt: tid, budget, intressenter och risk." }
        ]
      }
    ]
  }]
};
