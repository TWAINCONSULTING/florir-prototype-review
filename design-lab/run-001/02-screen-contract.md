# Fase 2 — Låst screen contract

**Dato:** 18. august 2026 · **Gjelder:** Run 001, fem pilotskjermer
**Status:** LÅST for Fase 3–7

Dette dokumentet låser **hva** hver skjerm skal gjøre. Det sier ingenting om
**hvordan** den skal se ut. Alle fire designretninger i Fase 3 skal levere
nøyaktig dette innholdet, de samme handlingene og omtrent den samme
informasjonsmengden — ellers sammenligner vi fem produktidéer i stedet for
fire designretninger.

## Slik leses kontrakten

- **MÅ** — innholdet/handlingen skal finnes i alle fire retninger.
- **KAN** — retningen bestemmer selv om den tar det med.
- **FRI** — plassering, størrelse, form og rekkefølge er designbeslutninger.
- **⚠ ÅPENT** — et kjent problem fra Fase 0 som retningen *skal* svare på.
  Dette er de eneste stedene der kontrakten inviterer til endring.

Alle tekster er ekte Florir-tekst fra `index.html` og skal beholdes ordrett med
mindre en ⚠-post sier noe annet.

---

## P1 · Hjem — `#/hjem`

**Rolle:** appens landingsflate. Én tydelig neste handling, og en grunn til å
komme tilbake i morgen.

### Innhold

| # | Element | Krav | Kilde |
|---|---|---|---|
| 1 | Hilsen: «Hei, Ingrid» | MÅ | `state.profil.navn` |
| 2 | Ukesmål: «Denne uka: løsne på én matregel.» | MÅ | statisk |
| 3 | Aktiv modul: navn «Matstøy» | MÅ | `MODULES[0].n` |
| 4 | Aktiv modul: beskrivelse «Hvorfor tankene om mat kan ta så mye plass.» | MÅ | statisk |
| 5 | Aktiv modul: fremdrift «2 av 5 deler» + andel 45 % | MÅ | statisk |
| 6 | Aktiv modul: statusmerke «Pågår» | KAN | statisk |
| 7 | Aktiv modul: medieflate | MÅ | ⚠ se A-01 |
| 8 | Innsiktskort: «Når «sunt» blir en regel» + brødtekst | MÅ | statisk |

### Handlinger

- **Primær:** «Fortsett» → `#/video`. Hele modulflaten er trykkflaten
  (`<button class="active-module">`), CTA-en inni er `aria-hidden`. MÅ bevares.
- **Sekundær:** ingen i dag. KAN legges til, men bare fra data som finnes.
- **Navigasjon:** bunnmeny, 4 faner — Hjem · Moduler · Mat · Meg. Hjem aktiv. MÅ.

### States

| State | Krav |
|---|---|
| Normal (modul påbegynt) | MÅ |
| Pressed på modulflaten | MÅ |
| Fokusring, tastatur | MÅ |
| Fremdrift 0 % / 100 % | KAN vises som variant |

### ⚠ Åpne punkter retningen skal svare på

- **A-01 · Medieflaten.** Det finnes ikke ekte modulbilder. Dagens løsning er
  en dekorert plassholder (abstrakt grønn sirkelfigur + play-glyf, 235 px) som
  leser som ferdig og tom (Fase 0, F-06). Retningen skal foreslå hva som står
  der når bildet ikke finnes. Å fjerne medieflaten helt er et gyldig svar.
- **A-02 · 104 px død luft.** Skjermen ruller ikke og slutter 104 px over
  bunnmenyen (F-05). Retningen skal enten fylle plassen med noe som finnes i
  data, eller stramme layouten så tomrommet blir et valg. Nytt innhold må
  komme fra ekte kilder: `DATA.oppskrifter`, `state.plan`, `state.lagret`,
  `MODULES`. Ikke oppdiktede tall.
- **A-03 · Hjem og Moduler deler hele overdelen.** `.active-module`-blokken er
  duplisert ordrett mellom `#s-hjem` og `#s-moduler`; bare `h2`/`h1` og
  CTA-teksten skiller. Retningen skal si hvordan de to skjermene skiller seg,
  eller forsvare at de er like.

---

## P2 · Moduler — `#/moduler`

**Rolle:** hele læringsløpet. Hvor er jeg, hva er neste, hva finnes.

### Innhold

| # | Element | Krav | Kilde |
|---|---|---|---|
| 1 | Skjermtittel «Moduler» | MÅ | statisk |
| 2 | Aktiv modul, samme datasett som P1 (3–7) | MÅ | `MODULES[0]` |
| 3 | Seksjonstittel «Neste moduler» | MÅ | statisk |
| 4 | Seksjonstekst «Fortsett i ditt tempo når du er klar.» | MÅ | statisk |
| 5 | 5 låste moduler, i rekkefølge | MÅ | `MODULES.slice(1)` |
| 6 | Per modul: navn, beskrivelse, låst-markering «Kommer» | MÅ | `MODULES` |
| 7 | Per modul: illustrasjon | KAN | ⚠ se B-01 |

De fem låste modulene, ordrett:

1. **Balanse** — «Alt eller ingenting, og veien ut av det.»
2. **Regler** — «Hvor kommer de egentlig fra?»
3. **Kroppssignaler** — «Sult og metthet som informasjon.»
4. **Sammen med andre** — «Mat i sosiale situasjoner.»
5. **Språket om mat** — «Ordene som strammer til.»

### Handlinger

- **Primær:** «Fortsett med Matstøy» → `#/video`. MÅ.
- **Sekundær:** tilbake-chevron i header. MÅ.
- **Låste rader:** ikke trykkbare i dag. MÅ forbli ikke-trykkbare, eller få en
  ærlig respons hvis retningen gjør dem trykkbare (se B-02).
- **Navigasjon:** bunnmeny, Moduler aktiv. MÅ.

### States

| State | Krav |
|---|---|
| Aktiv modul, påbegynt | MÅ |
| Låst modul | MÅ — og skal være lesbar, se B-01 |
| Fullført modul | KAN vises som variant |
| Fokusring | MÅ |

### ⚠ Åpne punkter

- **B-01 · Låste rader er visuelt identiske og nesten usynlige.** Ikonflatene
  er `--illustration-surface` (#E5F0E9) med grafikk i `--illo-mid` (#9FC3AE) —
  lys mint på lys mint (F-11). Fem rader uten skanne-verdi. Retningen skal
  gjøre listen lesbar. Å droppe illustrasjonene er et gyldig svar.
- **B-02 · «Kommer» forklarer ingenting.** Det står ikke hvor lange modulene
  er, hva som låser dem opp, eller hvorfor de kommer i denne rekkefølgen.
  Retningen KAN foreslå metadata — men bare felter som finnes eller som
  Florir realistisk kan fylle. Ikke oppfunne datoer.
- **B-03 · Ujevn radhøyde.** Beskrivelsene bryter til én eller to linjer, så
  listen mangler rytme (F-11). Retningen skal ha en regel for dette.

---

## P3 · Oppskriftsbibliotek — `#/oppskriftsliste`

**Rolle:** finne noe bestemt i 24 oppskrifter. Høy tetthet, rask skanning.
Oppdagelse bor på `#/oppskrifter`, ikke her.

### Innhold

| # | Element | Krav | Kilde |
|---|---|---|---|
| 1 | Skjermtittel «Alle oppskrifter» | MÅ | statisk |
| 2 | Søkefelt, placeholder «Søk etter oppskrift eller råvare» | MÅ | statisk |
| 3 | Filter-/sorteringsknapp → ark | MÅ | `[data-ark="sorter-oppskrifter"]` |
| 4 | Resultattelling «24 oppskrifter» / «N treff på «q»» | MÅ | beregnet |
| 5 | Aktivt filter, kort form «Alle · Anbefalt» | MÅ | `MALTIDER` + `OPPSKRIFT_SORTERING` |
| 6 | 24 oppskriftsrader | MÅ | `DATA.oppskrifter` |
| 7 | Per rad: matfoto | MÅ | ⚠ se C-01 |
| 8 | Per rad: navn | MÅ | `o.navn` |
| 9 | Per rad: vurdering | MÅ | ⚠ se C-02 |
| 10 | Per rad: lagre-knapp, egen 48 px trykkflate | MÅ | `state.lagret` |

Filtre (`MALTIDER`): Alle · Frokost · Lunsj · Middag · Snacks.
Sortering (`OPPSKRIFT_SORTERING`): Anbefalt *(default)* · Populært ·
Høyest vurdert · Nyeste. Alle fire MÅ bevares — de er eksplisitte
capabilities appen deler med en framtidig oppskriftsweb.

### Handlinger

- **Primær:** åpne oppskrift → `#/oppskrift/{id}`. Hele bilde-/tekstflaten. MÅ.
- **Sekundær:** lagre/fjern — søsken til navigasjonsknappen, aldri nøstet. MÅ.
- **Tertiær:** søk (filter, aldri relevanssortering), filter-/sorteringsark,
  tilbake. MÅ.
- **Navigasjon:** ingen bunnmeny — dette er en dypere flate. MÅ.

### States

| State | Krav |
|---|---|
| 24 resultater, ingen filtre | MÅ |
| Søketreff | MÅ |
| **Null treff** («pizza») | MÅ — tom tilstand med tekst |
| Filter aktivt (prikk-markør på filterknappen) | MÅ |
| Lagret / ikke lagret rad | MÅ |
| Fokusring | MÅ |

### ⚠ Åpne punkter

- **C-01 · 64 px sirkulært matfoto.** Appens beste aktivum vist som ikon
  (F-07). Retningen skal ta et begrunnet standpunkt: større rader, full-bredde
  kort, 2-kolonne grid — eller bevisst beholde tett liste. Standpunktet skal
  skrives ned, ikke bare tegnes.
- **C-02 · Vurderingene er en aritmetisk rampe.** `snitt` går 3,9 → 4,9 i
  0,1-steg, og listen viser 4,1 · 4,2 · 4,3 · 4,4 · 4,5 · 4,6 · 4,7 under
  hverandre (F-03). Dette er en **datafeil, ikke en designfeil**, men den er
  synlig i alle fire retninger og skal fikses i data før Fase 3 rendres.
  Retningen skal i tillegg si om stjerner i det hele tatt er riktig
  virkemiddel her.
- **C-03 · Raden har bare vurdering som metadata.** Ingen tid, måltidstype
  eller kategori (`meta = o => vurdering(...)`). Retningen KAN legge til
  metadata fra felter som finnes: `kategori`, `maltid`, `tags`,
  `ingredienser.length`, `porsjoner`.

---

## P4 · Oppskrift — `#/oppskrift/r-01`

**Rolle:** lage retten. Langt innhold, hero-foto, to modi.
Testoppskrift: **Mochagrøt**.

### Innhold

| # | Element | Krav | Kilde |
|---|---|---|---|
| 1 | Header med tilbake + lagre (`aria-pressed`) | MÅ | `state.lagret` |
| 2 | Hero-foto | MÅ | ⚠ se D-01 |
| 3 | Tittel «Mochagrøt» | MÅ | `o.navn` |
| 4 | Beskrivelse «Havregrøt med kakao og et streif av kaffe. Toppes med bær og peanøttsmør.» | MÅ | `o.beskrivelse` |
| 5 | Vurdering 4,1 | MÅ | ⚠ se C-02 |
| 6 | Kreditering «Livsstilsdagboken MariaClausen» | MÅ | `o.kreditering` |
| 7 | Porsjonsvelger, 1–8, skalerer mengdene | MÅ | `delIngrediens(t, f)` |
| 8 | Modusvelger: Ingredienser / Slik gjør du | MÅ | `p.del` |
| 9 | Ingrediensliste med ingrediens-PNG per rad | MÅ | `assets/ingredients/` |
| 10 | Topping som egen bolk | MÅ | `o.topping` |
| 11 | Framgangsmåte, nummererte steg | MÅ | `o.steg` |
| 12 | Vurderingsblokk | MÅ | eksisterende |
| 13 | Kommentarer + «Skriv kommentar» → ark | MÅ | eksisterende |
| 14 | «Legg i planen» | MÅ | `state.plan` |
| 15 | Relatert, 3 oppskrifter, kuratert — aldri relevanssortert | MÅ | `relatert` |

Mochagrøt, ordrett: 7 ingredienser (havregryn, vann, melk, kakaopulver,
pulverkaffe, salt, sirup), 4 toppings (bringebær, banan, peanøttsmør,
valnøtter), 1 steg.

### Handlinger

- **Primær:** «Legg i planen». MÅ.
- **Sekundær:** lagre (header), porsjoner ±, modusbytte, kommenter, åpne
  relatert, tilbake. MÅ.
- **Navigasjon:** ingen bunnmeny. MÅ.

### States

| State | Krav |
|---|---|
| Ingredienser (default) / Metode | MÅ |
| Lagret / ikke lagret | MÅ |
| I planen / ikke i planen | MÅ |
| Porsjoner 1 (min) og 8 (maks) — steppere skal vise grensen | MÅ |
| **Ukjent id** → «Denne oppskriften finnes ikke» | MÅ — allerede riktig |
| Fokusring | MÅ |

### ⚠ Åpne punkter

- **D-01 · Hero-en er inset.** 20 px marg og 24 px radius holder fotoet på
  armlengdes avstand (F-07). Retningen skal ta stilling til full bredde
  versus inset, og til høyde-/beskjæringsforhold.
- **D-02 · Modusvelgeren er en standard pille-i-pille.** Fungerer, men er
  generisk (F-12). Retningen KAN erstatte den — så lenge begge modi når
  fram på ett trykk.
- **D-03 · Ingrediens-PNG-ene er underbrukt.** 51 transparente bilder brukt
  som 40 px ikoner i en rad. Dette er noe ingen konkurrent har. Retningen
  KAN gjøre mer ut av dem.

---

## P5 · Onboarding, mål — `#/onboarding-mal`

**Rolle:** steg 3 av 4. Fange hva brukeren vil ha hjelp med. Skjermen ligger
utenfor hovedappen og har ingen bunnmeny — den tester om formspråket holder
også der.

### Innhold

| # | Element | Krav | Kilde |
|---|---|---|---|
| 1 | Tilbake-knapp | MÅ | `data-go="onboarding-hverdag"` |
| 2 | Stegtekst «Steg 3 av 4» | MÅ | `steg.nr` |
| 3 | Fremdriftsindikator, 75 %, `role="progressbar"` | MÅ | beregnet |
| 4 | Overtittel «Det du ønsker» | MÅ | `steg.over` |
| 5 | Tittel «Hva vil du ha hjelp med?» | MÅ | `steg.tittel` |
| 6 | Hjelpetekst «Velg ett hovedmål og opptil to ting til. Du kan endre dem senere.» | MÅ | ⚠ se E-01 |
| 7 | 6 valg | MÅ | `steg.valg` |
| 8 | Forhåndsvalgt tilstand | MÅ | ⚠ se E-01 |

De seks valgene, ordrett: «Få mer matglede» · «Spise mer variert» ·
«Få bedre rutiner» · «Bli tryggere på kjøkkenet» · «Forstå sult og metthet» ·
«Spise godt med lite tid».

### Handlinger

- **Primær:** «Fortsett» → `#/onboarding-barrierer`. MÅ.
- **Sekundær:** «Tilbake». MÅ.
- **Valg:** trykkbare, `aria-pressed`. MÅ.
- **Navigasjon:** ingen bunnmeny. MÅ.

### States

| State | Krav |
|---|---|
| Ingen valgt | MÅ |
| Ett valgt | MÅ |
| Maks valgt (grensen nådd) | MÅ — se E-01 |
| Pressed | MÅ |
| Fokusring | MÅ |

### ⚠ Åpne punkter

- **E-01 · Kontrakten holder ikke.** Teksten lover «ett hovedmål og opptil to
  ting til». Kontrollen er en flat multi-select der de tre valgte ser helt
  like ut, uten rangering, teller eller håndheving (F-10). Retningen skal
  velge én av tre veier og begrunne den:
  1. **Uttrykk rangeringen** — hovedmål som egen tilstand, sekundære som en
     annen. Løser problemet, men gjør kontrollen mer kompleks.
  2. **Del i to steg** — hovedmål først, så «noe mer?». Enklest per skjerm,
     men bryter 4-stegs-løftet.
  3. **Endre teksten** — «Velg opptil tre», flat multi-select med teller.
     Enklest, men gir opp prioriteringsinformasjonen.

  Dette er det eneste stedet kontrakten tillater at Florir-tekst endres, og
  bare hvis vei 3 velges.
- **E-02 · Ingen teller.** «Opptil to ting til» håndheves ikke og telles ikke.
  Uansett vei skal grensen være synlig.

---

## Felles for alle fem

**MÅ bevares i alle retninger:**

- Norsk tekst, ordrett, med unntak av E-01 vei 3.
- Ekte matfoto for de 24 oppskriftene.
- Ingrediens-PNG-ene på oppskriftsdetalj.
- Alle dyplenker: `#/hjem`, `#/moduler`, `#/oppskriftsliste`,
  `#/oppskrift/r-01`, `#/onboarding-mal`, pluss aliaset `#/program` og
  `#/innlegg/*` → onboarding.
- Trykkflater ≥ 48 × 48.
- Ingen horisontal scroll ved 393 px.
- Layouten skal tåle at `--fs-*` dobles.
- Ark: Escape lukker, fokus tilbake til kilden.
- `prefers-reduced-motion` slår av skjermanimasjon.

**MÅ IKKE endres i Run 001:**

- Rammeverk. Ingen React, Expo eller Next.js.
- Generell refaktorering av `index.html`.
- Forretningslogikk og produktomfang, utover ⚠-punktene.
- Ruter og skjermnøkler i `review/screens.csv`.
- De 28 skjermene som ikke er piloter.

**Én datafeil skal fikses før Fase 3 rendres:** C-02, den aritmetiske
vurderingsrampen. Den er ikke en designbeslutning, den er feil data, og den
ville forurenset alle fire retninger likt.
