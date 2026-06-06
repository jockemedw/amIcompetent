// Kompetensmodell för Lejonfastigheter.
//
// Strukturen är ett rekursivt träd: en nod har antingen `children` (gruppering)
// eller saknar `children` (ett LÖV som skattas och har en rekommenderad nivå
// `target`). Löv kan dessutom ha en `levelGuide` — en nivåtrappa som beskriver
// vad varje steg på skalan konkret innebär för just den färdigheten. Det är
// nivåtrappan som gör skillnaden mellan en nybörjare och en skicklig medarbetare
// tydlig och pedagogisk.
//
// scale: 0 Ingen · 1 Grundläggande · 2 Kompetent · 3 Expert
//
// Förstarollen — Fastighetsutvecklare — är fullt utbyggd med nivåtrappor på
// varje färdighet och fungerar som ett genuint stöd för en utvecklingsplan.
// Övriga roller speglar Lejonfastigheters organisation: utveckla, bygga,
// förvalta, drifta och stödja Linköpings samhällsfastigheter.

window.COMPETENCY_DATA = {
  scale: [
    { level: 0, label: "Ingen" },
    { level: 1, label: "Grundläggande" },
    { level: 2, label: "Kompetent" },
    { level: 3, label: "Expert" }
  ],

  // Generell betydelse av skalan, oberoende av färdighet. Visas som ledtext.
  scaleHelp: [
    { level: 1, text: "Känner till grunderna och kan bidra under handledning." },
    { level: 2, text: "Arbetar självständigt och löser vardagens problem på egen hand." },
    { level: 3, text: "Sätter standarden, leder andra och anlitas som rådgivare." }
  ],

  roles: [

    // ================================================================
    // ROLL 1 — FASTIGHETSUTVECKLARE  (förstaroll, fullt utbyggd)
    // ================================================================
    {
      id: "fastighetsutvecklare-lejon",
      title: "Fastighetsutvecklare",
      org: "Lejonfastigheter",
      summary: "Driver fastighetsutvecklingsprojekt från behov och tidiga skeden " +
        "till färdig, överlämnad lokal. Är projektledare i de tidiga faserna, " +
        "håller ihop juridik, ekonomi, teknik och kundens verksamhet, och bygger " +
        "långsiktiga utvecklingsplaner tillsammans med kunden.",
      nodes: [

        {
          id: "juridik",
          title: "Juridik & lagkrav",
          children: [
            {
              id: "lagkrav",
              title: "Kännedom om lagkrav",
              children: [
                {
                  id: "pbl",
                  title: "PBL (Plan- och bygglagen)",
                  target: 3,
                  description: "Plan- och byggprocessen, bygglov, detaljplaners rättsverkan.",
                  levelGuide: {
                    1: "Vet att bygglov krävs och känner igen begreppen detaljplan och bygglov.",
                    2: "Driver lov- och anmälningsärenden självständigt och bedömer vad en detaljplan medger.",
                    3: "Förutser planrelaterade risker tidigt, för dialog med kommunen om planbesked och vänder hinder till möjligheter."
                  }
                },
                {
                  id: "jordabalken",
                  title: "Jordabalken",
                  target: 2,
                  description: "Fastighetsköp, servitut, nyttjanderätt och hyresförhållanden.",
                  levelGuide: {
                    1: "Förstår skillnaden mellan att äga och att hyra och vad ett servitut är.",
                    2: "Hanterar servitut, nyttjanderätter och gränsdragningar i ett projekt utan stöd.",
                    3: "Strukturerar komplexa rättighetsupplägg mellan fastigheter och förebygger framtida tvister."
                  }
                },
                {
                  id: "bfs2024",
                  title: "Boverkets byggregler (BBR/BFS)",
                  target: 2,
                  description: "Boverkets gällande byggregler och deras tillämpning.",
                  levelGuide: {
                    1: "Vet att BBR finns och styr utformning, brand, energi och tillgänglighet.",
                    2: "Tillämpar relevanta krav i ett projekt och granskar att projekteringen följer dem.",
                    3: "Tolkar gränsfall, motiverar avsteg och håller sig à jour med regeländringar för hela organisationen."
                  }
                },
                {
                  id: "lou",
                  title: "LOU (Lag om offentlig upphandling)",
                  target: 3,
                  description: "Upphandlingsplikt, förfaranden och de vanligaste fallgroparna.",
                  levelGuide: {
                    1: "Förstår att offentliga inköp måste upphandlas och att direktupphandling har gränser.",
                    2: "Väljer rätt förfarande och tar fram kravunderlag tillsammans med upphandlare.",
                    3: "Designar upphandlingsstrategin för stora projekt och balanserar pris, kvalitet och risk för överprövning."
                  }
                },
                {
                  id: "miljobalken",
                  title: "Miljöbalken",
                  target: 2,
                  description: "Markföroreningar, miljöfarlig verksamhet, anmälan och tillstånd.",
                  levelGuide: {
                    1: "Känner till att mark kan vara förorenad och att vissa åtgärder är anmälningspliktiga.",
                    2: "Beställer och tolkar miljötekniska markundersökningar och hanterar saneringsbehov i projektet.",
                    3: "Leder miljöprövning i komplexa ärenden och väger miljörisk mot tid och kostnad i affärsbeslut."
                  }
                }
              ]
            },
            {
              id: "avtalsjuridik",
              title: "Avtals- & entreprenadjuridik",
              children: [
                {
                  id: "entreprenadformer",
                  title: "Entreprenadformer (AB 04 / ABT 06)",
                  target: 3,
                  description: "Utförande- och totalentreprenad, ansvarsfördelning och ÄTA.",
                  levelGuide: {
                    1: "Vet skillnaden mellan utförande- och totalentreprenad på en övergripande nivå.",
                    2: "Väljer entreprenadform medvetet och hanterar ÄTA-arbeten och ansvarsgränser i löpande projekt.",
                    3: "Lägger upp kontraktsstrukturen strategiskt för att fördela risk rätt och undvika tvister."
                  }
                },
                {
                  id: "abk09",
                  title: "Konsultavtal (ABK 09)",
                  target: 2,
                  description: "Upphandling och styrning av projektörer och tekniska konsulter.",
                  levelGuide: {
                    1: "Vet att konsulter anlitas på avtal och att uppdraget behöver avgränsas.",
                    2: "Skriver tydliga uppdragsbeskrivningar och styr konsulter mot leverans och kvalitet.",
                    3: "Bygger konsultteam och avtal som ger rätt kompetens, incitament och ansvar genom hela projektet."
                  }
                },
                {
                  id: "bestallarrollen",
                  title: "Beställarrollen & avtalsrätt",
                  target: 2,
                  description: "Att vara en tydlig, affärsmässig och rättssäker beställare.",
                  levelGuide: {
                    1: "Förstår beställarens grundläggande rättigheter och skyldigheter i ett avtal.",
                    2: "Agerar trygg beställare: följer upp avtal, dokumenterar och hanterar avvikelser korrekt.",
                    3: "Sätter beställarkulturen, förebygger konflikter och får leverantörer att prestera över förväntan."
                  }
                }
              ]
            }
          ]
        },

        {
          id: "ekonomi",
          title: "Ekonomi & kalkyl",
          children: [
            {
              id: "investeringskalkyl",
              title: "Investeringskalkylering",
              target: 3,
              description: "Nuvärde, internränta och känslighetsanalys för investeringsbeslut.",
              levelGuide: {
                1: "Läser en färdig investeringskalkyl och förstår vad den visar.",
                2: "Bygger egna kalkyler med nuvärde och internränta och prövar olika antaganden.",
                3: "Formar investeringsbeslut, gör känslighetsanalyser och försvarar kalkylen för styrelse och ägare."
              }
            },
            {
              id: "fastighetsvardering",
              title: "Fastighetsvärdering",
              target: 2,
              description: "Avkastnings-, orts- och produktionskostnadsmetoder.",
              levelGuide: {
                1: "Förstår att en fastighet har ett värde och vilka grova faktorer som styr det.",
                2: "Gör översiktliga värderingar med rätt metod och tolkar externa värderingsutlåtanden.",
                3: "Bedömer värde i svåra fall och använder värdering som verktyg i affärs- och investeringsbeslut."
              }
            },
            {
              id: "projektbudget",
              title: "Projektbudget & kostnadsstyrning",
              target: 3,
              description: "Kalkyl, prognos och styrning av projektets ekonomi över tid.",
              levelGuide: {
                1: "Läser en projektbudget och förstår vad posterna betyder.",
                2: "Upprättar och följer upp projektets budget, prognostiserar och förklarar avvikelser.",
                3: "Styr ekonomin proaktivt genom hela projektet och håller ramar även när förutsättningar ändras."
              }
            },
            {
              id: "lcc",
              title: "Livscykelkostnad (LCC)",
              target: 2,
              description: "Att väga investering mot drift- och underhållskostnad över husets liv.",
              levelGuide: {
                1: "Förstår att billigast i inköp inte är billigast över tid.",
                2: "Använder LCC-resonemang för att jämföra tekniska lösningar och materialval.",
                3: "Gör LCC till en självklar del av besluten och optimerar för lägsta totalkostnad över livscykeln."
              }
            },
            {
              id: "hyresmodell",
              title: "Hyresmodell & självkostnad",
              target: 2,
              description: "Kommunal självkostnadshyra och hur investeringar slår mot kundens hyra.",
              levelGuide: {
                1: "Vet att hyran ska täcka kostnaderna och inte sätts på en fri marknad.",
                2: "Räknar fram hur en investering påverkar kundens hyra och kan förklara det begripligt.",
                3: "Utformar hyresupplägg som är hållbara för både kund och bolag på lång sikt."
              }
            }
          ]
        },

        {
          id: "tidiga-skeden",
          title: "Tidiga skeden & behovsanalys",
          children: [
            {
              id: "behovsanalys",
              title: "Behovsanalys & lokalförsörjning",
              target: 3,
              description: "Att förstå verksamhetens verkliga behov bakom en lokalbeställning.",
              levelGuide: {
                1: "Tar emot ett uttryckt behov och dokumenterar det.",
                2: "Gräver i det verkliga behovet, utmanar beställningen och översätter verksamhet till lokal.",
                3: "Ser behov flera år fram, kopplar dem till kommunens lokalförsörjning och styr utvecklingen proaktivt."
              }
            },
            {
              id: "forstudie",
              title: "Förstudie & utredning",
              target: 3,
              description: "Att utreda alternativ och ge beslutsunderlag inför ett projekt.",
              levelGuide: {
                1: "Bidrar med underlag till en förstudie som någon annan leder.",
                2: "Leder förstudier självständigt och presenterar tydliga handlingsalternativ.",
                3: "Designar utredningar som ställer rätt frågor och ger ledning och kund ett tryggt beslutsunderlag."
              }
            },
            {
              id: "lokalprogram",
              title: "Lokal- & rumsfunktionsprogram",
              target: 2,
              description: "Att översätta verksamhetens behov till ytor, rum och funktioner.",
              levelGuide: {
                1: "Läser och förstår ett lokalprogram.",
                2: "Tar fram lokalprogram tillsammans med verksamheten och kvalitetssäkrar ytor och funktioner.",
                3: "Utmanar och optimerar program så att lokalerna blir effektiva, flexibla och hållbara över tid."
              }
            },
            {
              id: "platsanalys",
              title: "Plats- & markanalys",
              target: 2,
              description: "Att bedöma en plats förutsättningar: läge, mark, infrastruktur, risker.",
              levelGuide: {
                1: "Förstår att olika platser har olika förutsättningar.",
                2: "Bedömer en plats lämplighet och samlar in rätt underlag (geo, ledningar, risk).",
                3: "Väger samman platsens möjligheter och risker till ett tydligt ställningstagande inför beslut."
              }
            }
          ]
        },

        {
          id: "planering",
          title: "Planering & samhällsbyggnad",
          children: [
            {
              id: "detaljplaner",
              title: "Detaljplaner",
              target: 3,
              description: "Läsa, tolka och driva detaljplaneprocesser.",
              levelGuide: {
                1: "Kan läsa en plankarta och förstå vad som får byggas.",
                2: "Tolkar planbestämmelser och driver planfrågor mot kommunen i ett projekt.",
                3: "Driver planbesked och planändringar och vänder planprocessen till en möjliggörare för projektet."
              }
            },
            {
              id: "markfragor",
              title: "Markfrågor & fastighetsbildning",
              target: 2,
              description: "Fastighetsbildning, exploatering, mark- och exploateringsavtal.",
              levelGuide: {
                1: "Känner till begrepp som avstyckning och fastighetsreglering.",
                2: "Hanterar fastighetsbildning och markfrågor i ett projekt med stöd av experter.",
                3: "Lägger upp mark- och exploateringsupplägg som säkrar projektets förutsättningar långsiktigt."
              }
            },
            {
              id: "kommunala-processer",
              title: "Kommunala beslutsprocesser",
              target: 2,
              description: "Hur beslut fattas i kommun och bolag, och hur man navigerar dem.",
              levelGuide: {
                1: "Förstår grovt hur kommun och kommunalt bolag hänger ihop.",
                2: "Vet vem som beslutar om vad och förbereder ärenden så de går igenom.",
                3: "Navigerar tjänstemanna- och politiknivå skickligt och tajmar beslut för att driva projekt framåt."
              }
            }
          ]
        },

        {
          id: "projektering",
          title: "Projektering & teknik",
          children: [
            {
              id: "byggteknik",
              title: "Byggteknik & konstruktion",
              target: 2,
              description: "Stomme, klimatskal, grundläggning och vanliga byggtekniska lösningar.",
              levelGuide: {
                1: "Förstår grundläggande byggtekniska begrepp och husets delar.",
                2: "Bedömer tekniska lösningar, ställer kvalificerade frågor och upptäcker brister i handlingar.",
                3: "Värderar konstruktionsval mot kostnad, risk och förvaltningsbarhet och styr projekteringen rätt."
              }
            },
            {
              id: "installationsteknik",
              title: "Installationsteknik (VVS, el, styr)",
              target: 2,
              description: "Värme, ventilation, el och styr — det som gör huset användbart.",
              levelGuide: {
                1: "Känner till de tekniska systemen och vad de gör.",
                2: "Förstår samspelet mellan systemen och granskar att lösningarna håller ihop.",
                3: "Driver helhetssyn på installationer för låg energi, god inomhusmiljö och enkel drift."
              }
            },
            {
              id: "projekteringsledning",
              title: "Projekteringsledning & BIM",
              target: 2,
              description: "Att samordna projektörer och modeller mot ett komplett bygghandlingsskede.",
              levelGuide: {
                1: "Vet vad projektering är och vilka discipliner som ingår.",
                2: "Samordnar projektörer, granskar handlingar och håller projekteringen på tid och kvalitet.",
                3: "Leder projekteringen strategiskt, använder BIM för samordning och säkrar buildbara handlingar."
              }
            },
            {
              id: "tillganglighet",
              title: "Tillgänglighet & utformningskrav",
              target: 2,
              description: "Att lokalerna fungerar för alla — barn, äldre och personer med behov.",
              levelGuide: {
                1: "Känner till att tillgänglighet är ett lagkrav.",
                2: "Säkerställer att tillgänglighetskrav är uppfyllda i program och projektering.",
                3: "Driver utformning som går utöver minimikrav och skapar verkligt inkluderande samhällslokaler."
              }
            }
          ]
        },

        {
          id: "projektledning",
          title: "Projektledning & genomförande",
          children: [
            {
              id: "projektmetodik",
              title: "Projektmetodik (tid, kostnad, kvalitet)",
              target: 3,
              description: "Att planera och styra ett projekt mot mål med rätt metod.",
              levelGuide: {
                1: "Förstår vad ett projekt är och deltar strukturerat i det.",
                2: "Leder egna projekt med plan, milstolpar och uppföljning av tid, kostnad och kvalitet.",
                3: "Leder stora, komplexa projekt och anpassar metodiken efter situation, risk och intressenter."
              }
            },
            {
              id: "upphandling-entreprenad",
              title: "Upphandling av entreprenader",
              target: 3,
              description: "Att handla upp rätt entreprenör med rätt förfrågningsunderlag.",
              levelGuide: {
                1: "Förstår stegen i en entreprenadupphandling.",
                2: "Tar fram förfrågningsunderlag och utvärderar anbud tillsammans med upphandlare.",
                3: "Utformar upphandlingsstrategin för att få rätt entreprenör, rätt pris och rätt risknivå."
              }
            },
            {
              id: "byggledning",
              title: "Bygg- & produktionsuppföljning",
              target: 2,
              description: "Att följa entreprenaden i produktion: tid, ekonomi, kvalitet, möten.",
              levelGuide: {
                1: "Förstår vad som händer på ett bygge och deltar i byggmöten.",
                2: "Följer upp entreprenören mot avtal och hanterar ÄTA, tid och betalplan självständigt.",
                3: "Styr produktionen proaktivt, ligger steget före problem och håller leverans även vid störningar."
              }
            },
            {
              id: "riskhantering",
              title: "Riskhantering",
              target: 2,
              description: "Att identifiera, värdera och hantera projektets risker över tid.",
              levelGuide: {
                1: "Kan peka ut uppenbara risker i ett projekt.",
                2: "Arbetar systematiskt med riskanalys och åtgärder genom projektets faser.",
                3: "Bygger en riskmedveten kultur och fattar avvägda beslut under osäkerhet."
              }
            },
            {
              id: "arbetsmiljo",
              title: "Arbetsmiljö & BAS-P/BAS-U",
              target: 2,
              description: "Byggherrens arbetsmiljöansvar och rollerna BAS-P och BAS-U.",
              levelGuide: {
                1: "Vet att byggherren har ett arbetsmiljöansvar i byggprojekt.",
                2: "Säkerställer att BAS-P/BAS-U finns och fullgör byggherrens ansvar i projektet.",
                3: "Driver arbetsmiljö som en självklar del av planering och kultur, inte bara en formalitet."
              }
            }
          ]
        },

        {
          id: "hallbarhet",
          title: "Hållbarhet & kvalitet",
          children: [
            {
              id: "miljocertifiering",
              title: "Miljöcertifiering (Miljöbyggnad m.fl.)",
              target: 2,
              description: "System för att certifiera byggnaders miljöprestanda.",
              levelGuide: {
                1: "Känner till att byggnader kan miljöcertifieras och varför.",
                2: "Driver certifiering i ett projekt och vet vad de olika nivåerna kräver.",
                3: "Väljer certifieringsstrategi som ger verklig miljönytta utan onödig administration."
              }
            },
            {
              id: "energi",
              title: "Energi & klimatpåverkan",
              target: 2,
              description: "Energiprestanda och klimatpåverkan i både bygg- och driftskede.",
              levelGuide: {
                1: "Förstår att hus förbrukar energi och påverkar klimatet.",
                2: "Ställer energikrav i projekt och förstår klimatberäkning för byggskedet.",
                3: "Driver låg energi och låg klimatpåverkan som affärs- och samhällsnytta över hela livscykeln."
              }
            },
            {
              id: "kvalitetssakring",
              title: "Kvalitets- & miljösäkring",
              target: 2,
              description: "Egenkontroll, granskning och rutiner som säkrar leveransen.",
              levelGuide: {
                1: "Förstår varför egenkontroll och granskning behövs.",
                2: "Tillämpar kvalitets- och miljörutiner systematiskt i sina projekt.",
                3: "Förbättrar organisationens rutiner och bygger en kultur där kvalitet sitter i ryggraden."
              }
            }
          ]
        },

        {
          id: "kund-ledarskap",
          title: "Kundsamverkan & ledarskap",
          children: [
            {
              id: "kunddialog",
              title: "Kunddialog & verksamhetsförståelse",
              target: 3,
              description: "Att förstå skolans, omsorgens och idrottens vardag bakom lokalerna.",
              levelGuide: {
                1: "Lyssnar på kunden och vidarebefordrar önskemål.",
                2: "Förstår kundens verksamhet på djupet och översätter den till bra lokallösningar.",
                3: "Är kundens betrodda rådgivare och hjälper dem se behov de inte själva formulerat."
              }
            },
            {
              id: "kommunikation",
              title: "Kommunikation & förankring",
              target: 3,
              description: "Att förklara, förankra och få med sig människor genom hela projektet.",
              levelGuide: {
                1: "Kommunicerar tydligt i tal och skrift i vardagliga situationer.",
                2: "Anpassar budskap till olika mottagare och förankrar beslut hos berörda.",
                3: "Får ihop motstående intressen, skapar förtroende och leder genom kommunikation även i svåra lägen."
              }
            },
            {
              id: "intressenthantering",
              title: "Intressent- & politikhantering",
              target: 2,
              description: "Att hantera kunder, brukare, politik, grannar och media i samhällsprojekt.",
              levelGuide: {
                1: "Identifierar vilka intressenter ett projekt har.",
                2: "Planerar och genomför intressentdialog och hanterar olika förväntningar.",
                3: "Navigerar politiskt känsliga projekt och bygger brett stöd även där intressen krockar."
              }
            },
            {
              id: "affarsmassighet",
              title: "Affärsmässighet & förhandling",
              target: 2,
              description: "Att skapa värde för kund och bolag och förhandla goda affärer.",
              levelGuide: {
                1: "Förstår att besluten ska vara affärsmässiga och kostnadseffektiva.",
                2: "Väger nytta mot kostnad och förhandlar bra villkor i avtal och projekt.",
                3: "Ser och skapar affärsvärde där andra inte ser det och förhandlar starka, hållbara uppgörelser."
              }
            },
            {
              id: "sjalvledarskap",
              title: "Självledarskap & struktur",
              target: 2,
              description: "Att driva många projekt parallellt med ordning, prioritering och driv.",
              levelGuide: {
                1: "Håller ordning på sina egna uppgifter.",
                2: "Prioriterar, strukturerar och driver flera projekt parallellt utan att tappa kvalitet.",
                3: "Är en trygg, självgående kraft som andra lutar sig mot när det blir komplext och pressat."
              }
            }
          ]
        }
      ]
    },

    // ================================================================
    // ROLL 2 — LOKALUTVECKLARE
    // ================================================================
    {
      id: "lokalutvecklare-lejon",
      title: "Lokalutvecklare",
      org: "Lejonfastigheter",
      summary: "Utvecklar samhällslokaler utifrån kundens verksamhet — fångar behov " +
        "i tidigt skede och omsätter dem till genomtänkta lokal- och anpassningslösningar.",
      nodes: [
        {
          id: "lu-kund",
          title: "Kund & behov",
          children: [
            { id: "lu-behovsanalys", title: "Behovsanalys", target: 3,
              description: "Att fånga verksamhetens verkliga behov bakom en beställning.",
              levelGuide: {
                1: "Dokumenterar uttalade behov.",
                2: "Utmanar och fördjupar behovsbilden tillsammans med kunden.",
                3: "Förutser framtida behov och styr lokalutvecklingen proaktivt." } },
            { id: "lu-verksamhetsforstaelse", title: "Verksamhetsförståelse", target: 3,
              description: "Förståelse för skola, omsorg, idrott och kultur som verksamheter.",
              levelGuide: {
                1: "Känner till kundgrupperna översiktligt.",
                2: "Förstår verksamheternas vardag och krav på lokaler.",
                3: "Är en uppskattad bollplank som ser samband kunden själv inte ser." } },
            { id: "lu-lokalprogram", title: "Lokalprogram", target: 2,
              description: "Att översätta behov till ytor, rum och funktioner.",
              levelGuide: {
                1: "Läser och förstår ett lokalprogram.",
                2: "Tar fram lokalprogram med verksamheten.",
                3: "Optimerar program för effektiva, flexibla lokaler." } }
          ]
        },
        {
          id: "lu-utformning",
          title: "Lokaler & utformning",
          children: [
            { id: "lu-lokalanpassning", title: "Lokalanpassning", target: 2,
              description: "Att anpassa befintliga lokaler till nya behov.",
              levelGuide: {
                1: "Förstår vad en lokalanpassning innebär.",
                2: "Driver anpassningsärenden självständigt från behov till färdigt.",
                3: "Hittar smarta lösningar som möter behovet till låg kostnad och störning." } },
            { id: "lu-arbetsplatsutformning", title: "Funktion & arbetsmiljö", target: 2,
              description: "Att utforma lokaler som fungerar i daglig drift och arbetsmiljö.",
              levelGuide: {
                1: "Känner till grundläggande krav på arbetsmiljö i lokaler.",
                2: "Väger in funktion, flöden och arbetsmiljö i utformningen.",
                3: "Skapar lokaler som verkligen lyfter verksamhetens vardag." } },
            { id: "lu-tillganglighet", title: "Tillgänglighet", target: 2,
              description: "Att lokalerna fungerar för alla brukare.",
              levelGuide: {
                1: "Känner till att tillgänglighet är ett krav.",
                2: "Säkerställer tillgänglighet i utformningen.",
                3: "Driver inkluderande lösningar utöver minimikrav." } }
          ]
        },
        {
          id: "lu-ekonomi",
          title: "Ekonomi",
          children: [
            { id: "lu-hyreskalkyl", title: "Hyres- & investeringskalkyl", target: 2,
              description: "Hur en anpassning eller investering påverkar kundens hyra.",
              levelGuide: {
                1: "Läser en enkel hyreskalkyl.",
                2: "Räknar fram hyrespåverkan och förklarar den för kunden.",
                3: "Bygger upplägg som är hållbara för både kund och bolag." } },
            { id: "lu-investeringsunderlag", title: "Beslutsunderlag", target: 2,
              description: "Att ta fram tydliga underlag inför investeringsbeslut.",
              levelGuide: {
                1: "Bidrar med delar till ett beslutsunderlag.",
                2: "Tar fram kompletta, tydliga underlag självständigt.",
                3: "Formar underlag som ger ledning trygghet att besluta." } }
          ]
        },
        {
          id: "lu-process",
          title: "Process & juridik",
          children: [
            { id: "lu-pbl", title: "Bygglov & PBL-kännedom", target: 2,
              description: "Grundläggande lov- och planprocess.",
              levelGuide: {
                1: "Vet att bygglov kan krävas.",
                2: "Bedömer lovbehov och driver enklare ärenden.",
                3: "Förutser plan- och lovrisker tidigt." } },
            { id: "lu-lou", title: "LOU-kännedom", target: 2,
              description: "Grundläggande förståelse för offentlig upphandling.",
              levelGuide: {
                1: "Vet att inköp måste upphandlas.",
                2: "Tar fram kravunderlag med upphandlare.",
                3: "Väljer rätt upphandlingsväg för anpassningar." } },
            { id: "lu-hyresjuridik", title: "Hyresjuridik", target: 2,
              description: "Hyresavtal och vad som gäller vid förändring av lokaler.",
              levelGuide: {
                1: "Känner till grunderna i ett hyresavtal.",
                2: "Hanterar hyresfrågor kopplade till anpassningar.",
                3: "Lägger upp avtal som håller över tid." } }
          ]
        },
        {
          id: "lu-samverkan",
          title: "Samverkan",
          children: [
            { id: "lu-kunddialog", title: "Kunddialog", target: 3,
              description: "Att bygga förtroende och samarbete med kunden.",
              levelGuide: {
                1: "För en saklig dialog med kunden.",
                2: "Bygger goda relationer och hanterar förväntningar.",
                3: "Är kundens självklara, betrodda partner." } },
            { id: "lu-kommunikation", title: "Kommunikation", target: 2,
              description: "Att förklara och förankra lösningar tydligt.",
              levelGuide: {
                1: "Kommunicerar tydligt i vardagen.",
                2: "Anpassar budskap och förankrar beslut.",
                3: "Får med sig människor även i svåra frågor." } },
            { id: "lu-samordning", title: "Samordning", target: 2,
              description: "Att hålla ihop interna och externa parter i ett ärende.",
              levelGuide: {
                1: "Håller ordning på sina egna delar.",
                2: "Samordnar flera parter mot gemensamt mål.",
                3: "Driver komplex samordning utan att tappa tråden." } }
          ]
        }
      ]
    },

    // ================================================================
    // ROLL 3 — PROJEKTLEDARE BYGG
    // ================================================================
    {
      id: "projektledare-bygg-lejon",
      title: "Projektledare bygg",
      org: "Lejonfastigheter",
      summary: "Leder genomförandet av bygg- och ombyggnadsprojekt — från upphandlad " +
        "entreprenad till färdig, besiktad och överlämnad byggnad, med styrning på " +
        "tid, kostnad, kvalitet och arbetsmiljö.",
      nodes: [
        {
          id: "pl-ledning",
          title: "Projektledning",
          children: [
            { id: "pl-metodik", title: "Projektmetodik", target: 3,
              description: "Planering, styrning och uppföljning mot projektmål.",
              levelGuide: {
                1: "Deltar strukturerat i projekt.",
                2: "Leder egna projekt med plan och uppföljning.",
                3: "Leder stora komplexa projekt och anpassar metodiken." } },
            { id: "pl-tid", title: "Tidsstyrning", target: 3,
              description: "Tidplanering, kritisk linje och uppföljning av tid.",
              levelGuide: {
                1: "Läser en tidplan.",
                2: "Bygger och följer upp tidplaner aktivt.",
                3: "Styr tid proaktivt och tar igen förseningar." } },
            { id: "pl-kostnad", title: "Kostnadsstyrning", target: 3,
              description: "Budget, prognos och ekonomisk uppföljning i produktion.",
              levelGuide: {
                1: "Läser en projektbudget.",
                2: "Följer upp och prognostiserar ekonomin självständigt.",
                3: "Håller ramar även när förutsättningar ändras." } },
            { id: "pl-risk", title: "Riskhantering", target: 2,
              description: "Att identifiera och hantera risker i genomförandet.",
              levelGuide: {
                1: "Pekar ut uppenbara risker.",
                2: "Arbetar systematiskt med risk och åtgärder.",
                3: "Ligger steget före och beslutar tryggt under osäkerhet." } }
          ]
        },
        {
          id: "pl-entreprenad",
          title: "Entreprenad & upphandling",
          children: [
            { id: "pl-entreprenadformer", title: "Entreprenadformer (AB/ABT)", target: 3,
              description: "Utförande- och totalentreprenad, ÄTA och ansvar.",
              levelGuide: {
                1: "Känner till entreprenadformerna.",
                2: "Hanterar ÄTA och ansvarsgränser i löpande projekt.",
                3: "Använder kontraktsstrukturen strategiskt för rätt risk." } },
            { id: "pl-lou", title: "Upphandling (LOU)", target: 2,
              description: "Förfrågningsunderlag och utvärdering av entreprenörer.",
              levelGuide: {
                1: "Förstår stegen i en upphandling.",
                2: "Tar fram underlag och utvärderar anbud.",
                3: "Formar upphandling för rätt entreprenör och pris." } },
            { id: "pl-kontrakt", title: "Kontraktsuppföljning", target: 2,
              description: "Att följa upp entreprenören mot avtal.",
              levelGuide: {
                1: "Förstår vad avtalet kräver.",
                2: "Följer upp avtal och hanterar avvikelser.",
                3: "Får leverantörer att leverera över förväntan." } }
          ]
        },
        {
          id: "pl-teknik",
          title: "Byggteknik",
          children: [
            { id: "pl-byggteknik", title: "Byggteknik", target: 2,
              description: "Stomme, klimatskal och vanliga byggtekniska lösningar.",
              levelGuide: {
                1: "Förstår grundläggande byggteknik.",
                2: "Bedömer lösningar och upptäcker brister.",
                3: "Värderar val mot kostnad, risk och förvaltning." } },
            { id: "pl-installation", title: "Installationsteknik", target: 2,
              description: "VVS, el och styr i genomförandet.",
              levelGuide: {
                1: "Känner till systemen.",
                2: "Granskar att lösningarna håller ihop.",
                3: "Driver helhetssyn för drift och energi." } },
            { id: "pl-besiktning", title: "Besiktning & överlämning", target: 2,
              description: "Slutbesiktning, garantier och överlämning till förvaltning.",
              levelGuide: {
                1: "Vet vad en besiktning är.",
                2: "Driver besiktning och hanterar anmärkningar.",
                3: "Säkrar en ren överlämning och garantiuppföljning." } }
          ]
        },
        {
          id: "pl-amk",
          title: "Arbetsmiljö & kvalitet",
          children: [
            { id: "pl-baspu", title: "Arbetsmiljö (BAS-P/BAS-U)", target: 2,
              description: "Byggherrens arbetsmiljöansvar i produktion.",
              levelGuide: {
                1: "Vet att byggherren har arbetsmiljöansvar.",
                2: "Säkerställer BAS-P/BAS-U i projektet.",
                3: "Gör arbetsmiljö till en självklar del av kulturen." } },
            { id: "pl-kma", title: "Kvalitet & miljö (KMA)", target: 2,
              description: "Kvalitets-, miljö- och arbetsmiljöstyrning i projekt.",
              levelGuide: {
                1: "Förstår varför KMA behövs.",
                2: "Tillämpar KMA-rutiner systematiskt.",
                3: "Förbättrar rutiner och bygger kvalitetskultur." } },
            { id: "pl-egenkontroll", title: "Egenkontroll", target: 2,
              description: "Att säkra att entreprenörens egenkontroll fungerar.",
              levelGuide: {
                1: "Vet vad egenkontroll är.",
                2: "Granskar och följer upp egenkontroller.",
                3: "Driver att egenkontroll ger verklig kvalitet, inte papper." } }
          ]
        },
        {
          id: "pl-ledarskap",
          title: "Ledarskap & kommunikation",
          children: [
            { id: "pl-ledarskap2", title: "Ledarskap", target: 2,
              description: "Att leda projektteam och entreprenörer mot mål.",
              levelGuide: {
                1: "Bidrar i ett projektteam.",
                2: "Leder team och entreprenörer i vardagen.",
                3: "Får olika parter att prestera som ett lag." } },
            { id: "pl-kommunikation", title: "Kommunikation", target: 2,
              description: "Tydlig kommunikation med kund, brukare och entreprenör.",
              levelGuide: {
                1: "Kommunicerar tydligt i vardagen.",
                2: "Anpassar budskap och förankrar beslut.",
                3: "Löser konflikter och skapar förtroende i svåra lägen." } },
            { id: "pl-intressent", title: "Intressenthantering", target: 2,
              description: "Att hantera brukare, grannar och verksamhet under bygget.",
              levelGuide: {
                1: "Identifierar projektets intressenter.",
                2: "Planerar och genomför intressentdialog.",
                3: "Hanterar känsliga intressen och bygger stöd." } }
          ]
        }
      ]
    },

    // ================================================================
    // ROLL 4 — FASTIGHETSFÖRVALTARE
    // ================================================================
    {
      id: "fastighetsforvaltare-lejon",
      title: "Fastighetsförvaltare",
      org: "Lejonfastigheter",
      summary: "Har det långsiktiga ansvaret för ett fastighetsbestånd — teknik, " +
        "ekonomi, kund och regelverk — så att husen fungerar, kunderna trivs och " +
        "värdet utvecklas över tid.",
      nodes: [
        {
          id: "ff-teknisk",
          title: "Teknisk förvaltning",
          children: [
            { id: "ff-drift-underhall", title: "Drift & underhåll", target: 3,
              description: "Att styra drift och underhåll så att husen fungerar.",
              levelGuide: {
                1: "Förstår skillnaden mellan drift och underhåll.",
                2: "Styr drift och avhjälpande underhåll självständigt.",
                3: "Optimerar drift och underhåll för funktion och totalekonomi." } },
            { id: "ff-underhallsplan", title: "Underhållsplanering", target: 3,
              description: "Långsiktig planering av planerat underhåll och reinvestering.",
              levelGuide: {
                1: "Läser en underhållsplan.",
                2: "Upprättar och uppdaterar underhållsplaner.",
                3: "Styr reinvesteringar strategiskt över beståndets livscykel." } },
            { id: "ff-system", title: "Fastighetssystem", target: 2,
              description: "Att använda förvaltnings- och driftsystem som arbetsverktyg.",
              levelGuide: {
                1: "Hittar grundläggande information i systemen.",
                2: "Arbetar effektivt i systemen i vardagen.",
                3: "Använder data ur systemen för att fatta bättre beslut." } }
          ]
        },
        {
          id: "ff-ekonomi",
          title: "Ekonomi",
          children: [
            { id: "ff-driftbudget", title: "Drift- & underhållsbudget", target: 3,
              description: "Att äga och styra beståndets ekonomi.",
              levelGuide: {
                1: "Läser en driftbudget.",
                2: "Upprättar och följer upp budget och prognos.",
                3: "Styr ekonomin proaktivt och förklarar avvikelser tryggt." } },
            { id: "ff-uppfoljning", title: "Ekonomisk uppföljning", target: 2,
              description: "Att följa upp utfall, nyckeltal och driftnetto.",
              levelGuide: {
                1: "Läser ett enkelt utfall.",
                2: "Analyserar utfall och nyckeltal självständigt.",
                3: "Använder analysen för att förbättra resultatet." } },
            { id: "ff-hyresadmin", title: "Hyresadministration", target: 2,
              description: "Hyresavisering, indexering och avtalsuppföljning.",
              levelGuide: {
                1: "Förstår grunderna i hyresadministration.",
                2: "Hanterar avisering och avtalsuppföljning självständigt.",
                3: "Säkrar korrekta, effektiva flöden över hela beståndet." } }
          ]
        },
        {
          id: "ff-kund",
          title: "Kund & avtal",
          children: [
            { id: "ff-kundrelation", title: "Kundrelation", target: 3,
              description: "Att vara kundens kontakt och bygga långsiktigt förtroende.",
              levelGuide: {
                1: "Besvarar kundens frågor sakligt.",
                2: "Bygger goda relationer och löser problem proaktivt.",
                3: "Är kundens betrodda partner i lokalfrågor över tid." } },
            { id: "ff-hyresavtal", title: "Hyresavtal", target: 2,
              description: "Att upprätta, tolka och förvalta hyresavtal.",
              levelGuide: {
                1: "Läser och förstår ett hyresavtal.",
                2: "Hanterar och följer upp avtal självständigt.",
                3: "Förhandlar och utformar avtal som håller över tid." } },
            { id: "ff-lokalanpassning", title: "Lokalanpassning", target: 2,
              description: "Att möta kundens förändrade behov i befintliga lokaler.",
              levelGuide: {
                1: "Förstår vad en lokalanpassning innebär.",
                2: "Driver anpassningar i förvaltat bestånd.",
                3: "Hittar kostnadseffektiva lösningar med minimal störning." } }
          ]
        },
        {
          id: "ff-juridik",
          title: "Juridik & regelverk",
          children: [
            { id: "ff-hyreslagen", title: "Hyreslagen", target: 2,
              description: "Hyresförhållandets regler för lokaler.",
              levelGuide: {
                1: "Känner till grunderna i hyreslagen.",
                2: "Tillämpar reglerna korrekt i vardagen.",
                3: "Hanterar svåra hyresrättsliga frågor tryggt." } },
            { id: "ff-sba", title: "Systematiskt brandskyddsarbete", target: 2,
              description: "Att säkra brandskyddet i förvaltat bestånd (SBA).",
              levelGuide: {
                1: "Vet att SBA krävs.",
                2: "Driver SBA systematiskt i sitt bestånd.",
                3: "Säkrar en levande brandskyddskultur med kunderna." } },
            { id: "ff-ovk", title: "OVK & myndighetskrav", target: 2,
              description: "Återkommande besiktningar och lagstadgade kontroller.",
              levelGuide: {
                1: "Känner till OVK och liknande krav.",
                2: "Håller koll på och åtgärdar besiktningskrav i tid.",
                3: "Säkrar full regelefterlevnad över hela beståndet." } }
          ]
        },
        {
          id: "ff-hallbarhet",
          title: "Hållbarhet",
          children: [
            { id: "ff-energi", title: "Energiuppföljning", target: 2,
              description: "Att följa och minska energianvändningen i beståndet.",
              levelGuide: {
                1: "Läser en energistatistik.",
                2: "Följer upp och driver energibesparingar.",
                3: "Optimerar energin strategiskt över beståndet." } },
            { id: "ff-avfall", title: "Avfall & miljö i drift", target: 1,
              description: "Att miljöfrågor i daglig drift hanteras rätt.",
              levelGuide: {
                1: "Känner till grundläggande miljökrav i drift.",
                2: "Säkrar att avfall och miljöfrågor hanteras rätt.",
                3: "Driver ständig miljöförbättring i förvaltningen." } }
          ]
        }
      ]
    },

    // ================================================================
    // ROLL 5 — AVTALSFÖRVALTARE INHYRDA LOKALER
    // ================================================================
    {
      id: "avtalsforvaltare-lejon",
      title: "Avtalsförvaltare inhyrda lokaler",
      org: "Lejonfastigheter",
      summary: "Håller ihop de lokaler Lejonfastigheter hyr in åt sina kunder — " +
        "löpande avtalsfrågor, lokalanpassningar och hyresförhandlingar mot externa " +
        "fastighetsägare, i en koordinerande roll med många kontaktytor.",
      nodes: [
        {
          id: "af-avtal",
          title: "Avtal & förhandling",
          children: [
            { id: "af-hyresavtal", title: "Hyresavtal", target: 3,
              description: "Att tolka, förvalta och utveckla hyresavtal för inhyrda lokaler.",
              levelGuide: {
                1: "Läser och förstår ett hyresavtal.",
                2: "Hanterar och följer upp avtal självständigt.",
                3: "Utformar avtal som skyddar bolagets och kundens intressen." } },
            { id: "af-forhandling", title: "Hyresförhandling", target: 3,
              description: "Att förhandla nya och befintliga kontrakt mot externa ägare.",
              levelGuide: {
                1: "Förstår vad som är förhandlingsbart.",
                2: "Driver förhandlingar med stöd och når goda villkor.",
                3: "Förhandlar starka, hållbara uppgörelser även i svåra lägen." } },
            { id: "af-uppfoljning", title: "Avtalsuppföljning", target: 2,
              description: "Att bevaka villkor, tider, index och optioner i avtalen.",
              levelGuide: {
                1: "Vet vilka villkor som behöver bevakas.",
                2: "Följer systematiskt upp tider, index och optioner.",
                3: "Förebygger missade frister och förlorade förhandlingslägen." } }
          ]
        },
        {
          id: "af-lokal",
          title: "Lokalanpassning",
          children: [
            { id: "af-anpassning", title: "Anpassningsärenden", target: 2,
              description: "Att hantera beställda lokalanpassningar i inhyrda lokaler.",
              levelGuide: {
                1: "Förstår vad ett anpassningsärende innehåller.",
                2: "Driver anpassningar mot extern ägare och kund.",
                3: "Hittar lösningar som möter behovet till rätt kostnad och risk." } },
            { id: "af-kravstallning", title: "Kravställning", target: 2,
              description: "Att formulera tydliga krav mot externa fastighetsägare.",
              levelGuide: {
                1: "Förstår behovet av tydliga krav.",
                2: "Formulerar krav som går att följa upp.",
                3: "Sätter krav som ger rätt resultat utan tvist." } }
          ]
        },
        {
          id: "af-samverkan",
          title: "Samverkan & koordinering",
          children: [
            { id: "af-hyresgast", title: "Hyresgästdialog", target: 3,
              description: "Att vara lyhörd kontakt mot bolagets hyresgäst.",
              levelGuide: {
                1: "För en saklig dialog med hyresgästen.",
                2: "Bygger förtroende och hanterar förväntningar.",
                3: "Är hyresgästens självklara, betrodda kontakt." } },
            { id: "af-externa", title: "Externa fastighetsägare", target: 2,
              description: "Att samordna och driva frågor mot externa ägare.",
              levelGuide: {
                1: "Förstår ägarnas roll och intressen.",
                2: "Driver frågor mot externa ägare självständigt.",
                3: "Bygger relationer som ger smidiga affärer över tid." } },
            { id: "af-koordinering", title: "Koordinering", target: 2,
              description: "Att hålla många bollar i luften mellan flera parter.",
              levelGuide: {
                1: "Håller ordning på sina egna delar.",
                2: "Koordinerar flera parter och ärenden parallellt.",
                3: "Driver komplex koordinering strukturerat och tryggt." } }
          ]
        },
        {
          id: "af-juridik",
          title: "Juridik",
          children: [
            { id: "af-hyresjuridik", title: "Hyresjuridik", target: 2,
              description: "Hyreslagens regler för lokaler och inhyrning.",
              levelGuide: {
                1: "Känner till grunderna.",
                2: "Tillämpar reglerna korrekt i vardagen.",
                3: "Hanterar svåra hyresrättsliga frågor tryggt." } },
            { id: "af-lou", title: "LOU-kännedom", target: 1,
              description: "När inhyrning och anpassning berör upphandlingsregler.",
              levelGuide: {
                1: "Vet att LOU kan beröra inhyrning.",
                2: "Bedömer när upphandling krävs och agerar rätt.",
                3: "Navigerar gränsdragningen mot LOU säkert." } }
          ]
        },
        {
          id: "af-struktur",
          title: "Struktur & system",
          children: [
            { id: "af-dokumentation", title: "Dokumentation", target: 2,
              description: "Att hålla avtal, ärenden och beslut ordnade och spårbara.",
              levelGuide: {
                1: "Dokumenterar sina egna ärenden.",
                2: "Håller en strukturerad, spårbar dokumentation.",
                3: "Sätter ordning som hela teamet litar på." } },
            { id: "af-system", title: "Fastighets- & avtalssystem", target: 2,
              description: "Att arbeta effektivt i digitala system.",
              levelGuide: {
                1: "Hittar grundläggande information i systemen.",
                2: "Arbetar effektivt i systemen i vardagen.",
                3: "Använder systemen för överblick och bättre beslut." } }
          ]
        }
      ]
    },

    // ================================================================
    // ROLL 6 — DRIFTTEKNIKER
    // ================================================================
    {
      id: "drifttekniker-lejon",
      title: "Drifttekniker",
      org: "Lejonfastigheter",
      summary: "Håller husen igång i vardagen — sköter tekniska system, felsöker och " +
        "åtgärdar, optimerar energi och ger kunderna en trygg, fungerande inomhusmiljö.",
      nodes: [
        {
          id: "dt-drift",
          title: "Teknisk drift",
          children: [
            { id: "dt-vvs", title: "VVS & värme", target: 3,
              description: "Drift av värme-, kyl- och tappvattensystem.",
              levelGuide: {
                1: "Känner till systemen och deras delar.",
                2: "Driftar och justerar systemen självständigt.",
                3: "Optimerar systemen för komfort och låg energi." } },
            { id: "dt-el", title: "El & belysning", target: 2,
              description: "Drift av el- och belysningssystem inom behörighet.",
              levelGuide: {
                1: "Känner till anläggningens elsystem.",
                2: "Hanterar driftåtgärder inom sin behörighet.",
                3: "Ser samband och förebygger elrelaterade fel." } },
            { id: "dt-styr", title: "Styr & övervakning", target: 3,
              description: "Att använda styr- och övervakningssystem (SÖ/DUC).",
              levelGuide: {
                1: "Läser av larm och värden i styrsystemet.",
                2: "Felsöker och justerar via styrsystemet.",
                3: "Trimmar styrning för optimal drift och energi." } },
            { id: "dt-ventilation", title: "Ventilation", target: 2,
              description: "Drift och skötsel av ventilationssystem.",
              levelGuide: {
                1: "Känner till ventilationssystemens funktion.",
                2: "Driftar och felsöker ventilation självständigt.",
                3: "Optimerar luftflöden för bra klimat och energi." } }
          ]
        },
        {
          id: "dt-fel",
          title: "Felavhjälpning",
          children: [
            { id: "dt-felsokning", title: "Felsökning", target: 3,
              description: "Att systematiskt hitta orsaken till tekniska fel.",
              levelGuide: {
                1: "Identifierar uppenbara fel.",
                2: "Felsöker systematiskt och hittar grundorsaken.",
                3: "Löser svåra, sammansatta fel snabbt och säkert." } },
            { id: "dt-avhjalpande", title: "Avhjälpande underhåll", target: 2,
              description: "Att åtgärda fel så att funktion återställs.",
              levelGuide: {
                1: "Utför enklare åtgärder.",
                2: "Åtgärdar de flesta fel självständigt.",
                3: "Prioriterar och löser åtgärder med minimal störning." } },
            { id: "dt-akut", title: "Akuthantering & jour", target: 2,
              description: "Att agera rätt vid akuta händelser och i jour.",
              levelGuide: {
                1: "Vet hur akuta larm ska eskaleras.",
                2: "Hanterar akuta händelser lugnt och korrekt.",
                3: "Leder akuthantering och tryggar verksamheten snabbt." } }
          ]
        },
        {
          id: "dt-energi",
          title: "Energi",
          children: [
            { id: "dt-energioptimering", title: "Energioptimering", target: 2,
              description: "Att sänka energianvändningen utan att tumma på komforten.",
              levelGuide: {
                1: "Förstår vad som driver energianvändning.",
                2: "Genomför energiåtgärder i sina anläggningar.",
                3: "Driver systematisk energioptimering med mätbar effekt." } },
            { id: "dt-matning", title: "Mätning & uppföljning", target: 2,
              description: "Att läsa, tolka och agera på mätdata.",
              levelGuide: {
                1: "Läser av mätvärden.",
                2: "Analyserar trender och agerar på avvikelser.",
                3: "Använder data för att förutse och förebygga problem." } }
          ]
        },
        {
          id: "dt-sakerhet",
          title: "Säkerhet & regelverk",
          children: [
            { id: "dt-arbetsmiljo", title: "Arbetsmiljö & säkerhet", target: 2,
              description: "Att arbeta säkert med tekniska system.",
              levelGuide: {
                1: "Känner till grundläggande säkerhetsregler.",
                2: "Arbetar säkert och följer rutiner konsekvent.",
                3: "Är en förebild som höjer säkerheten i teamet." } },
            { id: "dt-brand", title: "Brandskydd i drift", target: 2,
              description: "Att brandskyddstekniken fungerar i drift.",
              levelGuide: {
                1: "Känner till brandskyddets driftaspekter.",
                2: "Sköter och kontrollerar brandskyddstekniken.",
                3: "Säkrar fullt fungerande brandskydd i anläggningarna." } },
            { id: "dt-koldmedia", title: "Köldmedia & regelverk", target: 1,
              description: "Regler kring köldmedia och kylanläggningar.",
              levelGuide: {
                1: "Känner till att köldmedia är reglerat.",
                2: "Följer regelverket i den dagliga driften.",
                3: "Säkrar full efterlevnad och rapportering." } }
          ]
        },
        {
          id: "dt-kund",
          title: "Kund & service",
          children: [
            { id: "dt-kundbemotande", title: "Kundbemötande", target: 2,
              description: "Att möta verksamheten professionellt på plats.",
              levelGuide: {
                1: "Är vänlig och saklig mot kunden.",
                2: "Skapar trygghet och löser kundens behov på plats.",
                3: "Är ansiktet utåt som kunderna verkligen uppskattar." } },
            { id: "dt-dokumentation", title: "Driftdokumentation", target: 2,
              description: "Att dokumentera åtgärder och anläggningsdata.",
              levelGuide: {
                1: "Dokumenterar sina egna åtgärder.",
                2: "Håller dokumentation aktuell och användbar.",
                3: "Bygger dokumentation som hela teamet drar nytta av." } }
          ]
        }
      ]
    },

    // ================================================================
    // ROLL 7 — HÅLLBARHETSSTRATEG
    // ================================================================
    {
      id: "hallbarhetsstrateg-lejon",
      title: "Hållbarhetsstrateg",
      org: "Lejonfastigheter",
      summary: "Driver bolagets hållbarhetsarbete utifrån ägardirektiv och Agenda 2030 " +
        "— från strategi och mål till klimat, energi, certifiering och uppföljning.",
      nodes: [
        {
          id: "hs-strategi",
          title: "Strategi & styrning",
          children: [
            { id: "hs-strategi2", title: "Hållbarhetsstrategi", target: 3,
              description: "Att forma och driva bolagets hållbarhetsstrategi.",
              levelGuide: {
                1: "Förstår vad en hållbarhetsstrategi är.",
                2: "Bidrar aktivt till strategi och handlingsplaner.",
                3: "Formar strategin och får hela organisationen att leva den." } },
            { id: "hs-agardirektiv", title: "Ägardirektiv & uppdrag", target: 2,
              description: "Att koppla hållbarhet till kommunens ägardirektiv.",
              levelGuide: {
                1: "Känner till ägardirektivens roll.",
                2: "Översätter direktiv till konkreta mål.",
                3: "Driver hållbarhet som en del av bolagets samhällsuppdrag." } },
            { id: "hs-malstyrning", title: "Målstyrning", target: 2,
              description: "Att sätta, mäta och följa upp hållbarhetsmål.",
              levelGuide: {
                1: "Förstår hur mål och mätetal hänger ihop.",
                2: "Sätter och följer upp mål självständigt.",
                3: "Bygger målstyrning som verkligen flyttar verksamheten." } }
          ]
        },
        {
          id: "hs-klimat",
          title: "Miljö & klimat",
          children: [
            { id: "hs-klimatberakning", title: "Klimatberäkning", target: 2,
              description: "Klimatpåverkan från bygg och drift (LCA, klimatdeklaration).",
              levelGuide: {
                1: "Förstår vad en klimatberäkning visar.",
                2: "Beställer och tolkar klimatberäkningar.",
                3: "Använder klimatdata för att styra beslut och minska utsläpp." } },
            { id: "hs-energistrategi", title: "Energistrategi", target: 2,
              description: "Strategi för energianvändning och energiförsörjning.",
              levelGuide: {
                1: "Känner till bolagets energifrågor.",
                2: "Tar fram och driver energiåtgärder.",
                3: "Formar energistrategin för hela beståndet." } },
            { id: "hs-cirkularitet", title: "Cirkularitet & material", target: 2,
              description: "Återbruk, materialval och resurseffektivitet.",
              levelGuide: {
                1: "Förstår grunderna i cirkulärt byggande.",
                2: "Driver återbruk och hållbara materialval i projekt.",
                3: "Sätter cirkulära principer som standard i organisationen." } }
          ]
        },
        {
          id: "hs-cert",
          title: "Certifiering & ledning",
          children: [
            { id: "hs-miljobyggnad", title: "Miljöcertifiering", target: 2,
              description: "Certifieringssystem för byggnader (Miljöbyggnad m.fl.).",
              levelGuide: {
                1: "Känner till certifieringssystemen.",
                2: "Stödjer projekt i att certifiera byggnader.",
                3: "Väljer certifieringsstrategi med verklig miljönytta." } },
            { id: "hs-iso14001", title: "Miljöledning (ISO 14001)", target: 2,
              description: "Att driva ett systematiskt miljöledningssystem.",
              levelGuide: {
                1: "Förstår vad ett miljöledningssystem är.",
                2: "Driver delar av miljöledningssystemet.",
                3: "Äger och utvecklar hela miljöledningssystemet." } }
          ]
        },
        {
          id: "hs-social",
          title: "Social hållbarhet",
          children: [
            { id: "hs-social2", title: "Social hållbarhet", target: 2,
              description: "Trygghet, inkludering och samhällsnytta i lokalerna.",
              levelGuide: {
                1: "Förstår vad social hållbarhet innebär.",
                2: "Driver sociala aspekter i projekt och förvaltning.",
                3: "Gör samhällsnytta till en mätbar del av verksamheten." } },
            { id: "hs-agenda2030", title: "Agenda 2030", target: 1,
              description: "Att koppla arbetet till de globala målen.",
              levelGuide: {
                1: "Känner till Agenda 2030 och de globala målen.",
                2: "Kopplar bolagets arbete till relevanta mål.",
                3: "Använder ramverket för att driva och kommunicera nytta." } }
          ]
        },
        {
          id: "hs-uppfoljning",
          title: "Uppföljning & kommunikation",
          children: [
            { id: "hs-rapportering", title: "Hållbarhetsrapportering", target: 2,
              description: "Att rapportera hållbarhet trovärdigt och enligt krav.",
              levelGuide: {
                1: "Förstår vad som ska rapporteras.",
                2: "Tar fram hållbarhetsrapportering självständigt.",
                3: "Säkrar trovärdig, granskningsbar och kommunicerbar rapportering." } },
            { id: "hs-datadriven", title: "Datadriven uppföljning", target: 2,
              description: "Att använda data för att styra hållbarhetsarbetet.",
              levelGuide: {
                1: "Läser hållbarhetsdata.",
                2: "Analyserar data och drar slutsatser.",
                3: "Bygger datadriven styrning som ger verklig effekt." } }
          ]
        }
      ]
    },

    // ================================================================
    // ROLL 8 — UPPHANDLARE
    // ================================================================
    {
      id: "upphandlare-lejon",
      title: "Upphandlare",
      org: "Lejonfastigheter",
      summary: "Ansvarar för bolagets upphandlingar enligt LOU — från behov och " +
        "strategi till förfrågningsunderlag, utvärdering och avtal som ger rätt " +
        "kvalitet, affär och hållbarhet.",
      nodes: [
        {
          id: "up-juridik",
          title: "Upphandlingsjuridik",
          children: [
            { id: "up-lou", title: "LOU på djupet", target: 3,
              description: "Lagen om offentlig upphandling i alla dess delar.",
              levelGuide: {
                1: "Känner till LOU:s grunder och förfaranden.",
                2: "Genomför upphandlingar rättssäkert självständigt.",
                3: "Hanterar de svåraste frågorna och är organisationens expert." } },
            { id: "up-avtalsratt", title: "Avtalsrätt", target: 2,
              description: "Att utforma och tolka avtal korrekt.",
              levelGuide: {
                1: "Förstår grundläggande avtalsrätt.",
                2: "Utformar och granskar avtal självständigt.",
                3: "Hanterar komplexa avtalsfrågor och förebygger tvister." } },
            { id: "up-overprovning", title: "Överprövning & risk", target: 2,
              description: "Att förebygga och hantera överprövningar.",
              levelGuide: {
                1: "Vet att upphandlingar kan överprövas.",
                2: "Bygger underlag som minskar risken för överprövning.",
                3: "Hanterar överprövningar och vänder lärdomar till bättre upphandling." } }
          ]
        },
        {
          id: "up-process",
          title: "Upphandlingsprocess",
          children: [
            { id: "up-behov", title: "Behovs- & marknadsanalys", target: 2,
              description: "Att förstå behovet och marknaden inför en upphandling.",
              levelGuide: {
                1: "Samlar in uttalat behov.",
                2: "Analyserar behov och marknad inför upphandling.",
                3: "Formar strategin utifrån djup behovs- och marknadsinsikt." } },
            { id: "up-ffu", title: "Förfrågningsunderlag", target: 3,
              description: "Att skriva tydliga, utvärderingsbara underlag.",
              levelGuide: {
                1: "Förstår delarna i ett förfrågningsunderlag.",
                2: "Tar fram kompletta underlag självständigt.",
                3: "Skriver underlag som ger rätt anbud och få frågetecken." } },
            { id: "up-utvardering", title: "Anbudsutvärdering", target: 2,
              description: "Att utvärdera anbud korrekt och transparent.",
              levelGuide: {
                1: "Förstår hur anbud utvärderas.",
                2: "Genomför utvärdering rättssäkert och dokumenterat.",
                3: "Designar utvärderingsmodeller som premierar rätt kvalitet." } }
          ]
        },
        {
          id: "up-avtal",
          title: "Avtal & leverantör",
          children: [
            { id: "up-avtalsforvaltning", title: "Avtalsförvaltning", target: 2,
              description: "Att förvalta avtal så att värdet realiseras.",
              levelGuide: {
                1: "Förstår vad avtalet kräver.",
                2: "Följer upp avtal och hanterar avvikelser.",
                3: "Driver avtalsförvaltning som tar ut hela det avtalade värdet." } },
            { id: "up-leverantor", title: "Leverantörsuppföljning", target: 2,
              description: "Att följa upp och utveckla leverantörer.",
              levelGuide: {
                1: "Vet vad som ska följas upp.",
                2: "Genomför leverantörsuppföljning systematiskt.",
                3: "Bygger relationer som höjer leverantörernas prestation." } }
          ]
        },
        {
          id: "up-affar",
          title: "Affär & kategori",
          children: [
            { id: "up-kategori", title: "Kategoristyrning", target: 2,
              description: "Att styra inköp strategiskt per kategori.",
              levelGuide: {
                1: "Förstår vad kategoristyrning är.",
                2: "Arbetar kategoribaserat i sina upphandlingar.",
                3: "Formar kategoristrategier som ger affärsnytta över tid." } },
            { id: "up-hallbar", title: "Hållbar upphandling", target: 2,
              description: "Att väva in miljö och socialt ansvar i upphandlingar.",
              levelGuide: {
                1: "Känner till hållbarhetskrav i upphandling.",
                2: "Ställer och följer upp hållbarhetskrav.",
                3: "Använder upphandling som hävstång för verklig hållbarhet." } }
          ]
        },
        {
          id: "up-samverkan",
          title: "Samverkan",
          children: [
            { id: "up-bestallardialog", title: "Beställardialog", target: 2,
              description: "Att samarbeta med verksamheten som beställer.",
              levelGuide: {
                1: "För en saklig dialog med beställaren.",
                2: "Översätter verksamhetens behov till upphandling.",
                3: "Är beställarens betrodda rådgivare i inköpsfrågor." } },
            { id: "up-forhandling", title: "Förhandling", target: 2,
              description: "Att förhandla där LOU medger det.",
              levelGuide: {
                1: "Förstår vad som är förhandlingsbart.",
                2: "Förhandlar goda villkor inom regelverket.",
                3: "Når starka uppgörelser även i svåra förhandlingar." } }
          ]
        }
      ]
    },

    // ================================================================
    // ROLL 9 — EKONOM / CONTROLLER
    // ================================================================
    {
      id: "controller-lejon",
      title: "Ekonom / Controller",
      org: "Lejonfastigheter",
      summary: "Säkrar bolagets ekonomiska styrning och redovisning — budget, prognos, " +
        "analys och fastighetsekonomi som ger ledning och styrelse ett tryggt " +
        "beslutsunderlag.",
      nodes: [
        {
          id: "co-redovisning",
          title: "Redovisning",
          children: [
            { id: "co-redovisning2", title: "Löpande redovisning", target: 3,
              description: "Att säkra korrekt löpande redovisning.",
              levelGuide: {
                1: "Förstår grundläggande redovisning.",
                2: "Hanterar löpande redovisning självständigt.",
                3: "Säkrar korrekthet och effektivitet i hela flödet." } },
            { id: "co-bokslut", title: "Bokslut", target: 2,
              description: "Att upprätta månads-, kvartals- och årsbokslut.",
              levelGuide: {
                1: "Bidrar med delar till bokslutet.",
                2: "Upprättar bokslut självständigt.",
                3: "Leder bokslutsprocessen och kvalitetssäkrar den." } },
            { id: "co-k3", title: "Regelverk (K3)", target: 2,
              description: "Tillämpning av relevant redovisningsregelverk.",
              levelGuide: {
                1: "Känner till regelverket.",
                2: "Tillämpar regelverket korrekt i vardagen.",
                3: "Hanterar svåra bedömningsfrågor tryggt." } }
          ]
        },
        {
          id: "co-styrning",
          title: "Ekonomistyrning",
          children: [
            { id: "co-budget", title: "Budget", target: 3,
              description: "Att driva budgetprocessen.",
              levelGuide: {
                1: "Bidrar med underlag till budget.",
                2: "Upprättar budget självständigt.",
                3: "Leder budgetprocessen och utmanar antaganden." } },
            { id: "co-prognos", title: "Prognos", target: 2,
              description: "Att prognostisera utfall under året.",
              levelGuide: {
                1: "Läser en prognos.",
                2: "Tar fram prognoser självständigt.",
                3: "Gör träffsäkra prognoser som ledningen litar på." } },
            { id: "co-uppfoljning", title: "Uppföljning & analys", target: 3,
              description: "Att följa upp utfall och förklara avvikelser.",
              levelGuide: {
                1: "Läser ett utfall.",
                2: "Analyserar avvikelser och förklarar dem.",
                3: "Översätter siffror till insikter som styr beslut." } }
          ]
        },
        {
          id: "co-analys",
          title: "Analys",
          children: [
            { id: "co-nyckeltal", title: "Nyckeltal", target: 2,
              description: "Att använda relevanta nyckeltal för styrning.",
              levelGuide: {
                1: "Förstår vanliga nyckeltal.",
                2: "Tar fram och tolkar nyckeltal självständigt.",
                3: "Väljer de nyckeltal som verkligen driver verksamheten." } },
            { id: "co-investering", title: "Investeringsanalys", target: 2,
              description: "Att analysera investeringar (nuvärde, internränta).",
              levelGuide: {
                1: "Läser en investeringskalkyl.",
                2: "Bygger investeringskalkyler självständigt.",
                3: "Utmanar och kvalitetssäkrar stora investeringsbeslut." } },
            { id: "co-lonsamhet", title: "Lönsamhets- & känslighetsanalys", target: 2,
              description: "Att pröva resultatets robusthet mot olika antaganden.",
              levelGuide: {
                1: "Förstår vad en känslighetsanalys är.",
                2: "Genomför lönsamhets- och känslighetsanalyser.",
                3: "Använder analysen för att synliggöra risk och möjlighet." } }
          ]
        },
        {
          id: "co-fastighet",
          title: "Fastighetsekonomi",
          children: [
            { id: "co-hyresmodell", title: "Hyresmodell & självkostnad", target: 2,
              description: "Kommunal självkostnadshyra och dess mekanik.",
              levelGuide: {
                1: "Förstår principen om självkostnadshyra.",
                2: "Räknar och förklarar hyresmodellen.",
                3: "Utvecklar hyresmodeller som är hållbara över tid." } },
            { id: "co-driftnetto", title: "Driftnetto & fastighetskalkyl", target: 2,
              description: "Att analysera fastigheters ekonomi och driftnetto.",
              levelGuide: {
                1: "Förstår vad driftnetto är.",
                2: "Analyserar driftnetto och fastighetskalkyler.",
                3: "Använder analysen för att styra beståndets ekonomi." } }
          ]
        },
        {
          id: "co-system",
          title: "System & kontroll",
          children: [
            { id: "co-system2", title: "Ekonomisystem", target: 2,
              description: "Att arbeta effektivt i ekonomisystem och BI-verktyg.",
              levelGuide: {
                1: "Hittar grundläggande information i systemen.",
                2: "Arbetar effektivt i systemen i vardagen.",
                3: "Bygger rapporter och flöden som hela bolaget drar nytta av." } },
            { id: "co-internkontroll", title: "Intern kontroll", target: 2,
              description: "Att säkra ordning, spårbarhet och kontroll.",
              levelGuide: {
                1: "Förstår varför intern kontroll behövs.",
                2: "Tillämpar kontrollrutiner i vardagen.",
                3: "Utvecklar intern kontroll som förebygger fel och risk." } }
          ]
        }
      ]
    }

  ]
};
