# Fase 0 — Baseline-audit av Florir Botanical

**Dato:** 18. august 2026 · **Commit:** `cf89693` · **Versjon:** 1B.1 Botanical
**Viewport:** 393 × 852 · **Bilder:** `design-lab/run-001/baseline-screens/`
**Verifisering:** `baseline-verification.md` — 0 feil, 0 merknader

Dette dokumentet stiller diagnose. Det foreslår ingen løsninger; det er Fase 2
og 3.

---

## 0.1 Hva som faktisk fungerer

Dette må bevares, ikke utfordres:

- **Ekte matfoto.** 24 oppskrifter med reelle, ikke-genererte bilder. Dette er
  Florirs sterkeste visuelle aktivum, og det er i dag underbrukt.
- **51 transparente ingrediens-PNG-er** i `assets/ingredients/`, brukt i
  ingredienslisten på oppskriftsdetalj. Ingen konkurrent har dette.
- **Ekte norsk innhold med stemme.** «Matstøy», «Når «sunt» blir en regel»,
  «Vi tilpasser oppgavene – vi vurderer ikke innsatsen din.» Teksten er
  presis, voksen og ikke-dømmende. Den er allerede merkevaren.
- **Produktforbedringene fra siste commit:** aktiv modul løftet til topp på
  Hjem og Moduler, onboarding kortet ned til 4 steg.
- **Teknisk disiplin.** Ett skygge-token, én spacing-skala, 48 px håndhevet,
  fokusretur i ark, aliaser for gamle dyplenker.

---

## 0.2 Diagnose: hvorfor det leses som AI-generert

Tolv funn, sortert etter hvor mye de bidrar til inntrykket. Hvert funn er
etterprøvbart mot fil og linje eller mot en måling.

### F-01 · Designsystemet lover en varme det ikke leverer *(rot-årsak)*

`#/design-fargepalett` viser en swatch «Varm støtte `#F3EEE4`» — en ekte sand.
Den er skrevet som **inline style på `index.html:1098`** og finnes ingen andre
steder i appen.

Token-blokken sier:

```css
--sand: #E5F0E9;          /* index.html:46  — mint, ikke sand */
--illustration-surface: #E5F0E9;
--primary-soft: #E5F0E9;
--soft-highlight: #F3F7F2;
```

`--sand` *er* `--primary-soft` *er* `--illustration-surface`. Tre semantiske
roller, én farge. Den varme halvdelen av paletten kollapset til grønn en gang
i historikken, og palettsiden ble aldri oppdatert. Filens egen tese på
linje 14 lover «Varm hvit, kulltekst, Botanical-grønn, salvie/mint og ekte
matfoto» — fire av fem er grønne eller nøytrale.

Målt andel grønnbiaserte flater i første viewport:

| Skjerm | Flater | Grønne | Andel |
|---|---|---|---|
| `#/onboarding-mal` | 7 | 7 | **100 %** |
| `#/oppskriftsliste` | 27 | 25 | **93 %** |
| `#/oppskrift/r-01` | 12 | 11 | **92 %** |
| `#/moduler` | 12 | 9 | 75 % |
| `#/hjem` | 7 | 4 | 57 % |

Dette er den direkte årsaken til «grønt som eneste signal på helse». Det er
ikke et fargevalg — det er et fargevalg som har mistet motvekten sin.

### F-02 · Det finnes ingen display-typografi

```css
--font-display: -apple-system, 'SF Pro Display', system-ui, sans-serif;
--font:         -apple-system, 'SF Pro Text',    system-ui, sans-serif;
```

Samme stakk, to optiske varianter av samme skrift. På Android og i alle
render-miljøer uten SF faller begge til **nøyaktig samme font**.
`#/design-fonter` hevder «En rolig redaksjonell stemme i overskrifter» og viser
«Skjermtittel · display» og «Brødtekst · sans» — satt i samme skrift på samme
side. Spesimensiden motbeviser sin egen påstand.

Hele hierarkiet bæres dermed av tre virkemidler: størrelse, `font-weight:600`
og `letter-spacing:-0.02em`. Ingen brukt skrift, ingen kontrast mellom stemme
og grensesnitt, ingen serif, ingen optisk størrelse. Det er standardoppsettet
for enhver systemfont-app, og det er den nest største enkeltårsaken til at
appen ikke har ansikt.

*(Sidefunn: `#/design-fonter` rendrer «Metadata · sans10–15 minutter» — manglende
skille mellom etikett og prøve.)*

### F-03 · Innholdsdata er en aritmetisk rampe, og det vises

`OPPSKRIFTER` i `index.html`:

- `snitt:` 3.9, 4.0, 4.1, 4.2 … 4.9 — **jevnt trinn på 0,1**
- `publisertDato:` 2026-07-28, 07-25, 07-22 … — **eksakt 3 dagers steg, 24 ganger**
- `rekkefolge:` 1, 2, 3 … 24

På `#/oppskriftsliste` står stjernetallene under hverandre som
**4,1 · 4,2 · 4,3 · 4,4 · 4,5 · 4,6 · 4,7**. En bruker som skanner listen
leser en tellerekke, ikke vurderinger. Dette er det enkeltelementet i appen
som mest direkte roper «generert», og det ligger i data, ikke i CSS.

### F-04 · Kontrast: to tokens under kravet

Målt (WCAG 2.2 kontrastformel):

| Par | Ratio | Krav | Status |
|---|---|---|---|
| `--border #DDE5DE` på `--canvas #FBFCF9` | **1,25:1** | 3:1 (1.4.11) | ✗ |
| `--text-muted #A1AAA2` på `--canvas` | **2,32:1** | 4,5:1 (1.4.3) | ✗ |
| `--primary #3F7D61` på `--canvas` | 4,72:1 | 4,5:1 | ✅ knapt |
| `--on-primary` på `--primary` | 4,86:1 | 4,5:1 | ✅ knapt |
| `--text-secondary #687269` på `--canvas` | 4,86:1 | 4,5:1 | ✅ knapt |

Kortkanten på **1,25:1** er den viktigste. Den er visuelt fraværende, så
`.card` skiller seg fra canvas kun ved at hvit ligger på nesten-hvit. Det er
grunnen til at skjermene leser som ett udifferensiert lyst felt selv om
markupen har tydelig struktur. Tre av de bestående parene ligger på 4,7–4,9 —
det er ikke margin, det er flaks.

### F-05 · Første viewport er tom der den skal selge

`#/hjem` har `scrollHeight` 758 px i et 758 px klientområde: skjermen ruller
ikke. Innholdet slutter på 654 px. **104 px død luft** står mellom siste kort
og bunnmenyen — 14 % av skjermen, uten funksjon.

Samtidig er dette Florirs viktigste skjerm, og den viser i dag én modul, ett
innsiktskort og ingenting annet. Hverken mat, plan, fremdrift over tid eller
en grunn til å komme tilbake i morgen.

### F-06 · Hero-en er en plassholder som later som den er innhold

Modulkortet på `#/hjem` og `#/moduler` bruker `.thumb` — `aspect-ratio:16/9`,
`--illustration-surface` (mint), et diagonalt stripemønster på 0,55 alfa, og
en konsentrisk sirkel med en play-trekant i midten. Kommentaren i koden er
ærlig: *«Bildeplassholder i fortsett-kortet. Ekte thumbnail kommer hit
senere.»*

Problemet er ikke at plassholderen finnes. Det er at den er **dekorert som om
den var ferdig** — abstrakt grønn form, myk gradient, sentrert glyf. Det er
formspråket generert grensesnittkunst har, og det opptar 235 px øverst på
appens to viktigste skjermer. En ærlig grå boks hadde lest som ufullstendig;
denne leser som ferdig og tom.

### F-07 · Matfotoet er kastet bort på listen

`#/oppskriftsliste` viser 24 ekte matbilder som **64 px sirkulære miniatyrer**
til venstre for en tekstrad. Appens beste aktivum er krympet til et ikon.
Detaljskjermen `#/oppskrift/r-01` gjør det motsatte og riktige — men også der
er bildet **inset med 20 px marg og 24 px radius**, ikke i full bredde. Fotoet
holdes konsekvent på armlengdes avstand av containeren.

### F-08 · Alt er et kort, og alle kort er like avrundede

Målte radier på synlige flater ≥ 24 px, per skjerm:

- `#/oppskriftsliste`: `14px` × 26, `24px` × 24, `999px` × 1, `4px` × 1
- `#/oppskrift/r-01`: `14px` × 10, `24px` × 4, `999px` × 4, `16px` × 1
- `#/onboarding-mal`: `16px` × 6, `999px` × 1, `14px` × 1

Token-listen har 13 radiusverdier (`--r-small` … `--r-video`), men flere er
duplikater: `--r-media`, `--r-thumb`, `--r-card-large` og `--r-video` er alle
`24px`; `--r-control`, `--r-chip`, `--r-list-icon` og `--r-input` er alle
`14px`. Tretten navn, seks verdier. Systemet later som det har et
radiushierarki som ikke finnes, og resultatet er at radius ikke lenger bærer
mening: en knapp, en chip, et ikonfelt og et inputfelt er visuelt samme objekt.

### F-09 · Én skygge på alt, og den er nesten usynlig

`--shadow: 0 8px 24px rgba(28,36,31,0.06)` — brukt 13 steder. På 6 % alfa mot
en nesten-hvit canvas gir den ingen målbar separasjon. Kombinert med F-04 har
appen verken kant eller skygge som skiller lag. Disiplinen (én skygge) er
riktig; verdien gjør den til ingenting.

### F-10 · Onboarding-kontrakten holder ikke

`#/onboarding-mal` sier: *«Velg ett hovedmål og opptil to ting til.»*

Kontrollen er en flat multi-select (`flere:true`, seks identiske
`.onboarding-option` med `aria-pressed`). Tre er forhåndsvalgte, og de tre ser
**helt like ut**. Det finnes ingen hovedmål-tilstand, ingen rangering, ingen
teller, og ingen håndheving av «opptil to». Teksten lover en prioritering
grensesnittet ikke kan uttrykke.

Dette er det eneste rene UX-funnet i settet, og det er verdt å merke at det er
et *innholdsproblem løst med feil komponent* — ikke et stilproblem.

### F-11 · Låste moduler er tegnet i nesten-usynlig grønt

Modulradene på `#/moduler` bruker 40 px ikonflater i `--illustration-surface`
(#E5F0E9) med grafikk i `--illo-mid` (#9FC3AE). Lys mint på lys mint. Ikonene
— vektstang, dør, kompass, sirkler — er nærmest uleselige ved faktisk
størrelse, og de fem «Kommer»-radene er derfor visuelt identiske. Listen har
ingen skanne-verdi.

Radene har dessuten ujevn høyde fordi beskrivelsen bryter til én eller to
linjer, så listen mangler rytme.

### F-12 · Skjermkromet er standard, på alle fem skjermer

- Flytende pille-dock, 4 faner, ikon over etikett, grønn aktiv.
- Sentrert tittel med chevron til venstre og én handling til høyre.
- Segmentkontroll som pille-i-pille (`Ingredienser / Slik gjør du`).
- Full bredde 56 px primær-CTA nederst.

Hvert element er isolert sett riktig. Samlet er de standardoppsettet enhver
generator produserer først. Det er ingenting her en bruker ville kjent igjen
som Florir.

### F-13 · Den sticky modusvelgeren dekker innhold, også primær-CTA-en

`.recipe-tabs` er `position:sticky; top:0` med ugjennomsiktig
`--primary-soft`-bakgrunn (`index.html:610`). Den festes ikke til seksjonen
den styrer — den følger med **hele veien ned**, forbi ingredienser, metode,
plan-CTA, vurderinger, kommentarer og «Flere som denne». Innholdet ruller
under den uten kompensasjon i `padding` eller `scroll-margin`.

Målt overlapp mot ekte tekst, `#/oppskrift/r-01`:

| `scrollTop` | Hva pillen dekker |
|---|---|
| 900 | ingrediensraden «salt · en klype» |
| 1400 | **«Legg i matplanen»** — skjermens primærhandling |
| 1496 | «Kommentarer», sorteringsvelgeren «Mest nyttig», «Maria» |
| 1900 | en kommentars vurdering «5,0» og brødtekst |

To ting er galt samtidig. Kontrollen **skjuler innhold**, og den er
**meningsløs der den havner**: «Ingredienser / Slik gjør du» styrer ingenting
i kommentarfeltet, men opptar 56 px av skjermen der.

Verifiseringssveipet fanger ikke dette. Det måler at flater finnes, har høyde
og er ≥ 48 px — ikke om to flater dekker hverandre. Kontrollen er lagt til i
porten som punkt 6, og **baselinen stryker på den**. Se
`baseline-verification.md`.

---

## 0.3 Sammenfatning

Funnene er ikke tolv uavhengige feil. De er **tre rot-årsaker** med
følgefeil:

**A. Paletten mistet motvekten sin (F-01 → F-04, F-06, F-11).**
Da `--sand` ble grønn, forsvant kontrastparet appen var tegnet for. Alt som
skulle skille seg fra bakgrunnen — kanter, ikonflater, plassholdere, låste
tilstander — havnet i samme lyse grønne bånd.

**B. Systemet har ikke en typografisk stemme (F-02 → F-08, F-12).**
Uten skriftkontrast må hierarkiet bæres av flater. Da blir alt et kort, alle
kort blir like avrundede, og kromet må hentes fra standardbiblioteket.

**C. Innholdet er behandlet som fyll (F-03, F-05, F-07, F-10, F-13).**
Rampede vurderinger, tomt førsteskjermbilde, 64 px matfoto og en
onboarding-kontroll som ikke kan uttrykke sin egen tekst, og en sticky
modusvelger som legger seg over primærhandlingen. Appens ekte innhold
— foto, ingredienser, norsk stemme — er der, men designet er ikke bygget rundt
det.

**Konsekvens for Fase 3:** en retning som bare bytter accentfarge løser
ingenting. Minimumskravet til en kandidat er at den svarer på alle tre:
et fargesystem med reell motvekt, en typografisk stemme som ikke er
systemfonten, og en layout som er bygget rundt foto og ekte tall.

---

## 0.4 Målepunkter å slå

Tall Fase 4 skal evaluere kandidatene mot:

| Metrikk | Baseline | Krav til kandidat |
|---|---|---|
| Grønnandel, første viewport (snitt 5 skjermer) | 83 % | ≤ 55 % |
| Kortkant-kontrast | 1,25:1 | ≥ 3:1 |
| Svakeste tekstkontrast i bruk | 2,32:1 | ≥ 4,5:1 |
| Død luft, `#/hjem` | 104 px | ≤ 24 px |
| Distinkte radier i bruk per skjerm | 4 | ≤ 3, med regel |
| Skriftfamilier i bruk | 1 (system) | ≥ 2, minst én ikke-system |
| Matfoto-bredde, listerad | 64 px | begrunnet valg, dokumentert |
| Vurderingsdata | aritmetisk rampe | uregelmessig, troverdig |
| Sticky flate over innhold | 4 overlapp | 0 |
| Verifiseringssveip | 0 feil (av 11 kontroller) | 0 feil (av 12) |
