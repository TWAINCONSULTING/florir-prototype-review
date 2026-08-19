# Fase 1 — Avgrenset 2026-research

**Cutoff:** 18. august 2026 · **Kilder:** 138 unike, avduplisert på URL
**Vinkler:** 6 uavhengige · **Funn:** 62 · **Kildeindeks:** `reference-index.json`

| Kildetype | Antall |
|---|---|
| Bransje-artikkel | 47 |
| Plattform-offisiell | 43 |
| Shipped produkt | 25 |
| Community | 13 |
| Forskning (fagfellevurdert) | 10 |

Fordeling av funn: 45 adopter · 12 test · 5 unngå.
Egenvurdert sikkerhet: 33 sterk · 25 moderat · 4 svak.

---

## 1.0 Les dette først

En syvende agent fikk i oppdrag å finne hull i de seks andre, uten å
oppsummere dem. Den fant ett problem som er viktigere enn alle funnene til
sammen, og som treffer denne kjøringens eget arbeid:

> Researchen leverer et tett **negativt** vokabular og et tynt **positivt** —
> og det negative vokabularet er selv 2026-defaulten. Summen av seks vinkler
> er én felles avvisningsliste: ikke grønt, ikke kort, ikke glass, ikke
> skygge, ikke score, ikke gamification, ikke Inter, ikke gradient, ikke
> sirkulære miniatyrer. Restmengden etter den listen er **én eneste retning**
> — varm off-white papirflate, én ikke-grønn aksent, redaksjonell
> display-serif, generøs luft, store foto, rolig typografi — og det er
> nøyaktig der ethvert velbrieftet designteam og enhver modell med tilgang
> til de samme anti-slop-listene lander i 2026.
>
> Å bytte den gamle generiske (grønne velværekort) mot den nye generiske
> (varmt papir og Fraunces) er en sidelengs bevegelse, og den farligste
> sorten, fordi den er tungt forsvart med kilder og derfor ikke blir
> utfordret.
>
> **Beviset ligger allerede i repoet: kandidat A kjører Fraunces,
> grønnandel 0 og én radius — konvergensen har skjedd FØR researchen rakk å
> påvirke noe.**

Kritikken er korrekt. Kandidat A ble skrevet før denne researchen var
ferdig, og landet uavhengig på nøyaktig den profilen. Det er ikke en
bekreftelse på at A er riktig; det er en observasjon om at profilen er
forutsigbar.

Konsekvens for Fase 4: evalueringen skal ikke bare rangere de fire. Den skal
først teste om de fire **er fire**.

---

## 1.1 Funn med sterkest belegg

Sortert etter hvor mye de faktisk endrer en Florir-beslutning.

### R-01 · Dynamic Type komprimerer typehierarkiet til 1,5×

Fra Apples egne tabeller: ved standardstørrelse er Large Title 34 pt og
Caption 2 11 pt — forhold **3,09**. Ved AX5 er Large Title 60 og Caption 2
40 — forhold **1,50**. Body vokser 3,12×, Large Title bare 1,76×. HIG krever
samtidig: *«maintain the relative hierarchy and visual distinction of text
elements when people adjust text sizes.»*

**Dette gjør F-02 til mer enn et smaksspørsmål.** Et hierarki som bare bæres
av punktstørrelse kollapser matematisk. Uten en ekstra akse — eget
display-snitt, vekt, farge, casing — har Florir ingen lesbar
informasjonsstruktur for brukere med forstørret tekst. I en helse- og
velværeapp er det en overrepresentert gruppe.

*Kilde: Apple HIG «Typography», endringslogg 16.12.2025 og 07.03.2025.*

### R-02 · Begge plattformer dokumenterer et display-nivå over overskriftsnivået

Material 3 sin typeskala har 15 stiler i 5 kategorier, der Display er
øverste og adskilt fra Headline: Display Large 57/64 mot Body Large 16/24 =
**3,6×**. Apple leverer to familier til iOS — SF Pro **og** New York
(serif) — med regelen *«Minimize the number of typefaces you use»*.

At `--font-display` og `--font` er identiske er altså et brudd på begge
plattformenes dokumenterte skala. **To** snitt er plattformens egen
anbefaling; tre er det ikke.

*Kilde: developer.android.com, Material Design 3 type scale, oppdatert
14.08.2026. Apple HIG «Typography».*

### R-03 · Ett lag har lov til å flyte. Alt annet er innholdslag

Apple opererer nå med en to-lags modell: *«Don't use Liquid Glass in the
content layer… Instead, use standard materials for elements in the content
layer»* og *«Controls and navigation components like sidebars and tab bars
appear on top of content rather than on the same plane.»*

**Dette er hierarkiregelen F-08 manglet.** «Alt er kort» løses ikke ved å
variere radius, men ved å slutte å behandle innholdsflater som flytende
objekter. Nøyaktig én flate — bunnmenyen — har lov til å ligge over.

*Kilde: Apple HIG «Materials» og «Layout», oppdatert 09.09.2025.*

### R-04 · Tre minstemål gjelder samtidig, og de er ikke like

| Kilde | Krav |
|---|---|
| Apple HIG, default kontrollstørrelse | 44 × 44 pt |
| Apple HIG, absolutt minimum | 28 × 28 pt |
| Material 3 / Android | 48 × 48 dp |
| WCAG 2.2 SC 2.5.8 (AA) | 24 × 24 px, med fem unntak |
| WCAG 2.2 SC 2.5.5 (AAA) | 44 × 44 px, ingen unntak |

Florirs eksisterende 48 px-regel er altså riktig valgt, ikke overdrevet: den
treffer Android-normen og gir AAA gratis. Apple gir i tillegg et
avstandstall som er separat fra størrelse: **12 pt luft rundt elementer med
synlig ramme, 24 pt rundt elementer uten.**

*Kilde: Apple HIG «Accessibility» og «Buttons». WCAG 2.2, W3C Recommendation
05.10.2023, ISO-standard 21.10.2025.*

### R-05 · Lav kontrast er en målt signatur på AI-generert grensesnitt

Fagfellevurdert (W4A 2026): **29,0 %** samlet WCAG-etterlevelse i
AI-genererte grensesnitt, med fargekontrast som verste kategori på
**26,8 %**. Å be eksplisitt om tilgjengelighet i prompten *senket*
etterlevelsen.

Florirs 1,25:1 kortkant og 2,32:1 `--text-muted` ligger midt i den målte
fordelingen. Å fikse kontrasten er dobbeltvirkende: tilgjengelighet **og**
ikke-generert-signal.

*Advarsel: tallene er hentet via søkesammendrag; dl.acm.org var blokkert.
Kilden bør åpnes manuelt før den siteres utad.*

### R-06 · Ekte matfoto er blitt et aktivt tillitssignal — men bare hvis ektheten er synlig

AI-matfoto fikk sin offentlige skandale i 2025–2026 (Forkable, en
San Francisco-restaurant som måtte fjerne AI-menybilder, HuffPost og Know
Your Meme-dekning). Den avgjørende nyansen: **publikum kan ikke se
forskjellen** — 73 % bommet på en AI-margherita, 69 % på cacio e pepe.

Ekthet virker derfor bare når den gjøres synlig: uperfekt anretning, ekte
skygge, mat som brytes av kanten. **Sirkelmasken er selve problemet** — den
fjerner komposisjon og gjør fotoet til et ikon.

### R-07 · «Rolig» og «flat» er ikke det samme

Material 3 Expressive ble bygget på 46 studier med over 18 000 deltakere.
Deltakerne fant nøkkelelementer **opptil fire ganger raskere** i ekspressive
versjoner. Roen skal komme fra fargedisiplin, luft og rytme — ikke fra å
gjøre all tekst liten og grå.

*Merk kildens partiskhet: Google måler sitt eget system. Vinkel 1 avviser
samtidig Expressive som alpha-API og advarer mot å kalle det
2026-konvensjon. Forskningen og API-modenheten er to forskjellige ting.*

### R-08 · Den nordiske gesten er ikke beige minimalisme

Nasjonalmuseet fikk av Metric sammen med Displaay to eksklusive skrifter —
Museet Sans og Museet Serif — med bokstavformer avledet fra verk i museets
egen samling. Munchmuseet fikk av North en **bakoverskrå** skrift, en
bevisst feilvending. Monokrom (Oslo) lager Satyr med modulerte,
**asymmetriske** serifer. Store Norske Skriftkompani bygger på dokumentasjon
av Oslos skilthistorie.

Gesten å hente er (1) serif+sans-**paret** framfor én sans i to roller, og
(2) bokstavform med bevisst uregelmessighet. Ikke sage og beige — den
lesningen er en ettermontert eksportmyte.

*Merk: Munch er fra 2020 og Nasjonalmuseet fra 2022. Begge er utenfor
researchvinduet, og begge er trykk-/institusjonsidentiteter, ikke apper.*

---

## 1.2 Der vinklene motsier hverandre

Kritikeren fant tolv direkte motsigelser. Disse fire endrer Florir-beslutninger:

### M-01 · Display-serif motsies av korpusets eneste harde måling

Vinkel 2 og 6 vil ha redaksjonell serif i display-rollen. **Vinkel 4 målte
at NYT Cooking bruker sans på oppskriftskort-titler og reserverer serif til
redaksjonelt innhold — og at MatPrat har null serif.** Vinkel 6 lister i
tillegg «kursiv i overskrifter» som egen slop-gate.

Tre av fire kandidater kjører display-serif. Det er ikke belagt for
oppskriftsflater; det er belagt for redaksjonelle flater. Florir er begge
deler samtidig, og ingen kilde løser den spenningen.

### M-02 · «Vekk fra grønt» er én av tre lesninger, ikke en konvergens

Vinkel 3 fant **ingen** lærings- eller velværeprodukt som har flyttet
paletten vekk fra grønt i 2025/26. Vinkel 4 fant at Norges største matmerke
bruker grønt som **blekk** i 166 tilfeller mot 23 flater. Vinkel 2 kaller
grønt en kategori-default fra kaloriapper.

Begrunnelsen for å redusere grønn må derfor være **hierarki og lesbarhet**,
ikke fargepsykologi — og «grønt som blekk framfor som flate» er en
tredje mulighet ingen kandidat prøver.

### M-03 · Radius: fire tall, ingen begrunnelse for hvilket som gjelder

Vinkel 1 og 3: konsentrisitet, ytre kort ~39 pt. Vinkel 4, målt: MatPrat
10 px på medier, NYT 4 px dominant. Vinkel 6: maks to radier totalt.
Avviket mellom vinkel 1 og 4 er en faktor 4–10 på samme elementtype.

### M-04 · Skjermkromet: researchen legitimerer det baselinen avviste

Baseline F-12 avviser den flytende pille-docken som «standardoppsettet
enhver generator produserer først». **Vinkel 1 sier at nøyaktig ett lag skal
flyte, og at det laget er tab baren** — altså at Florirs flytende dock er
plattformriktig.

Alle fire kandidater fjernet den flytende docken. Det er ikke belagt av
researchen; det er en estetisk beslutning som bør erkjennes som det.

---

## 1.3 Hva researchen IKKE svarte på

Kritikeren identifiserte elleve manglende modaliteter. De fire som betyr mest:

**Norske og nordiske designsystemer.** Designsystemet.no (Digdir), NAV
Aksel, Entur, Vy, Ruter, DNB, Vipps — åpne, dokumenterte, norske, med
ferdige og begrunnede beslutninger om radius, kontrast, elevasjon, tokens og
norsk UI-språk. **Ingen av seks vinkler nevner dem.** For en norsk
forbrukerapp er dette den mest åpenbare uteblitte kilden i hele oppdraget.

**Juridisk modalitet.** EUs European Accessibility Act gjelder
forbrukerapper fra juni 2025. Norsk forskrift om universell utforming av IKT
og EN 301 549 gjelder. Vinkel 1 diskuterte om WCAG 1.4.11 «gjelder» — for en
norsk forbrukerapp er det lovkrav, ikke en prioriteringsøvelse.

**Ingen åpnet en eneste app.** All «shipped mobile»-evidens er tekst *om*
produkter. Korpusets eneste harde måling er responsiv **web**. Florir er en
app og sammenlignes med nettsider, uten at noen sier det.

**Mørk modus.** Ingen av seks vinkler nevner `prefers-color-scheme`. En varm
papirflate med varm nær-sort tekst er nøyaktig den retningen som kollapser i
mørk modus, og korpuset anbefaler den uten ett ord om motparten.

Ett funn til er verdt å merke seg: **fritlagte objekter på flat flate er i
seg selv et stock-/AI-signal**, som kritikeren mener vinkel 6 burde ha testet
mot sin egen gateliste. Det treffer kandidat D direkte, og evalueringen i
Fase 4 skal prøve nettopp det.

---

## 1.4 Mønstre Florir bør adoptere, teste og unngå

### Adopter

1. **To skriftsnitt, ikke ett og ikke tre.** Plattformenes egen anbefaling,
   og den eneste måten å holde hierarkiet ved AX5-tekst (R-01, R-02).
2. **Ett flytende lag.** Bunnmenyen. Alt annet er opakt innholdslag (R-03).
3. **48 px trykkflater, 12/24 pt luft.** Allerede riktig i Florir; behold
   det og legg til avstandsregelen (R-04).
4. **Ingen sekundærtekst under 4,5:1, ingen strukturskille under 3:1.**
   Lovkrav, ikke preferanse (R-05, EAA).
5. **Matfoto stort nok til at ujevnhet er synlig.** Ingen sirkelmasker (R-06).
6. **Hard typografisk kontrast.** Display 32–44 px mot brødtekst 15–16 px.
   Roen kommer fra fargedisiplin, ikke fra små grå bokstaver (R-07).

### Test

7. **Grønt som blekk framfor som flate.** M-02 sin tredje mulighet. Ingen
   kandidat prøver den, og den er den eneste lesningen som både senker
   grønnandelen og beholder kategorigjenkjennelsen.
8. **Sans på oppskriftsflater, serif på redaksjonelle flater.** M-01. Ville
   gitt Florir én app med to registre — som er nøyaktig det produktet er.
9. **Tredje register for tall.** Tabellsifre eller mono på mengder, tider og
   porsjoner. Vinkel 4 anbefaler det; vinkel 6 kaller >3 familier en gate.
   `font-variant-numeric` løser det uten en tredje familie.

### Unngå

10. **Glassmorphism og blur som varmesignal.** Brent fra to kanter: hver
    slop-liste, og NN/g sin kritikk av Liquid Glass med iOS 26.1 sin
    «Tinted»-retrett.
11. **Å bytte gammel generisk mot ny generisk.** Se 1.0.

---

## 1.5 Hva som ikke er belagt

Ærlighet om egen kildekvalitet, fra kritikeren:

- **Hallmarks 58 slop-gates** er ett GitHub-repo av én forfatter.
  4 600 stjerner er popularitet, ikke validitet. Det finnes **ingen
  kontrollert studie** som viser at brukere faktisk bedømmer et grensesnitt
  som AI-generert ut fra spesifikke visuelle trekk. Behandle «dette leses
  som AI» som en velbegrunnet hypotese, ikke som et funn.
- **Tillitsstraffen** (20 % → 39 %) kommer fra en byråblogg som siterer
  Klaviyo/Datalily. Markedsføringsdata uten metodebeskrivelse.
- **Palettene og skriftnavnene** for Headspace, Oura og Lifesum er
  rekonstruksjoner fra tredjepartsaggregatorer. Ingen brand book, ingen
  skjermbilde, ingen primærkilde.
- **«Det finnes ikke et etablert mønster for rangert flervalg»** (F-10) er
  et argument fra fravær, med alle mønsterbibliotek blokkert. Det kan ikke
  bære beslutningen om å dele onboardingvalget i to steg.
