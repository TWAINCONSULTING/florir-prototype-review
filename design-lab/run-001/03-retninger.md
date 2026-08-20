# Fase 3 — Fem designretninger

**Ankerskjermer:** `#/hjem` og `#/oppskrift/r-01` · **Viewport:** 393 × 852
**Filer:** `design-lab/run-001/kandidater/<ID>/` · **Målinger:** `kandidater/maal.json`

Alle leverer kontraktens innhold ordrett, med samme handlinger og omtrent
samme informasjonsmengde. Ingen versjoner er overskrevet.

**E kom til etter Fase 4.** Distinkthetstesten strøk settet på fire — to
reelle retninger, ikke fire — og navnga tre hull. E er bygget for å fylle
dem. Se `04-evaluering.md` § 4.3 og § 4.4 for hva testen så, og for
evaluatorens dom over om E faktisk lukket dem.

## Målt mot baselinen

| | grønnandel | distinkte radier | skriftsnitt | svakeste kontrast | død luft | små trykkflater |
|---|---|---|---|---|---|---|
| **Baseline** | 83 % | 4 | 1 | 2,32:1 | 104 px | 0 |
| **A · Kokebok** | **0 %** | **1** | 2 | 6,72:1 | 0 | 0 |
| **B · Verktøy** | 9 % / 0 % | 2 / 3 | 2 | 5,78:1 | 0 | 0 |
| **C · Bordet** | **0 %** | 1 / 2 | 2 | **7,07:1** | 0 | 0 |
| **D · Arkivet** | **0 %** | **0** | 2 | 4,47:1 | 0 | 0 |
| **E · Dagen** | **0 %** | 2 | 2 | 4,93:1 | 0 | 0 |

Ingen horisontal scroll. Ingen kontrastbrudd. Modusvelgeren er ikke sticky i
noen av dem, og primærhandlingen ligger over folden i B, C og D — de tre
grepene som løser F-13.

---

## A · KOKEBOK

**Kandidat-ID:** A · **Filer:** `A-kokebok/`

**Design thesis.** Florir er en norsk kokebok som også underviser. Appen
settes som et trykt hefte: papir, blekk, streker og fullbredde foto. Ingen
kort — innholdet ligger *på* papiret, ikke i beholdere oppå det.

**Ønsket emosjonell respons.** Rolig autoritet. Følelsen av å slå opp i noe
som er redigert av et menneske.

**Farger som semantiske roller.**

| Rolle | Verdi |
|---|---|
| Grunn | `#F6F1E8` varmt papir |
| Blekk / blekk svak | `#221E1A` / `#5B5348` |
| Strek / fin strek | `#B9AC94` (3,4:1) / `#D8CEBB` |
| Handling | `#8A3520` leire |
| Fremdrift | `#3D6B4E` — grønt, degradert til én jobb |

**Typografi.** Fraunces (display, `opsz` 14–120, `SOFT`, `WONK`) mot
Instrument Sans (grensesnitt). H1 40 px mot brødtekst 15,5 px = 2,6×.

**Spacing og grid.** Én marg, 22 px. Seksjoner skilles av streker, ikke av
kortkanter. Fotoet bryter margen og går til kanten.

**Radius.** **3 px, én verdi i hele systemet.** Radius betyr én ting:
«dette kan trykkes». Foto har null.

**Bildeart.** Fullbredde, ingen marg, ingen radius, ingen header oppå.

**CTA-hierarki.** Primær er en firkantet leireknapp med **auto bredde**, ikke
full bredde. En primærhandling som fyller hele skjermbredden påstår at det
ikke finnes andre valg.

**Kort mot åpne flater.** Ingen kort. Null.

**Navigasjon.** Flat bunnmeny på papiret med én strek over. Versaler,
sperret. Aktiv fane markeres av en 2 px leirestrek over etiketten.

**Motion.** Minimal. Ingen inn-animasjon på skjermbytte.

**States.** Trykk = mørkere leire. Fokus = systemets ring. Fremdrift = fylt
andel av en 2 px strek.

**Bevisst unngått.** Kort, skygger, avrundede beholdere, flytende dock,
pille-i-pille-segmentkontroll, sirkulære miniatyrer, stjernerader.

**Estimert kompleksitet.** Middels. Nye tokens, ny typografi, men strukturen
i `index.html` er stort sett intakt. Fullbredde-hero krever at `.scroll`
slutter å ha horisontal padding.

**⚠ Kjent risiko.** A er nøyaktig profilen kritikeren i Fase 1 forutså at
enhver velbrieftet 2026-prosess ville lande på. Se `01-research.md` § 1.0.

---

## B · VERKTØY

**Kandidat-ID:** B · **Filer:** `B-verktoy/`

**Design thesis.** Florir er et godt bygget verktøy som tilfeldigvis er
varmt. Plattformkyndig, tett, effektivt — men med paletten og typografien
reparert. Dette er reparasjonsalternativet: minst risiko, minst avstand.

**Ønsket emosjonell respons.** Tillit gjennom kompetanse. «Noen har tenkt på
detaljene.»

**Farger.**

| Rolle | Verdi |
|---|---|
| Grunn / flate | `#F7F4EF` / `#FFFFFF` |
| Blekk / blekk 2 | `#1A1815` / `#55504A` |
| Linje | `#C9C1B4` (3,1:1) |
| Handling | `#96560F` oker |
| Fullført | `#2F6B47` — grønt, degradert til én jobb |

**Typografi.** Familjen Grotesk (nordisk, egen karakter) **kun på titler**.
Alt annet er systemfont — det er et valg, ikke latskap: tesen er
plattformkyndighet.

**Spacing.** Marg 16 px, tettere enn de andre. Grupperte lister med ekte
separatorer.

**Radius.** Tre verdier med hver sin regel: **10 px** grupperte flater,
**6 px** bilder, **999 px** kun det som er rundt av funksjon.

**Bildeart.** Firkantet, 96 px på Hjem, 72 px i relatert. Hero 16:10.

**CTA-hierarki.** Full bredde inne i sin egen flate — plattformkonvensjonen.
48 px høy, ikke 56.

**Kort mot åpne flater.** Grupperte lister, iOS-modellen, men på varm grunn
med synlige separatorer.

**Navigasjon.** Plattformens tab bar: full bredde, kant øverst, ikon over
etikett. Ingen flytende pille, ingen skygge.

**States.** Avkryssingsbokser på ukesoppgaver, med gjennomstreket fullført
tilstand. Låst modul: dempet nummer og en **grunn** («Åpnes når du er ferdig
med Matstøy»), ikke en hengelås.

**Bevisst unngått.** Serif, redaksjonell gest, fullbredde foto, mørk grunn.

**Estimert kompleksitet.** **Lav.** Nærmest en token- og typografiswitch.
Kan implementeres uten å røre struktur.

---

## C · BORDET

**Kandidat-ID:** C · **Filer:** `C-bord/`

**Design thesis.** Maten er hovedpersonen, alt annet trekker seg tilbake. En
dyp, varm grunn lar fotografiet lyse. Læringsinnholdet er stille og
typografisk.

**Ønsket emosjonell respons.** Kveld. Et bord med lys over. Ro som kommer av
at det er mindre å se på.

**Farger.**

| Rolle | Verdi |
|---|---|
| Grunn / hevet | `#17130F` espresso / `#221C17` |
| Creme / creme 2 | `#F4EDE3` (14,9:1) / `#B3A697` (6,9:1) |
| Kant | `#3B322A` (3,1:1) |
| Handling | `#E0A254` rav — hentet fra maten |
| Fullført | `#7FB88C` |

**Typografi.** Instrument Serif (én vekt, svært høy strekkontrast) mot
Figtree. På mørk grunn er det strekkontrasten som gjør at overskriften lyser
uten å bli fet.

**Radius.** To verdier: **14 px** hevede flater, **999 px** rundt av
funksjon. Foto har null.

**Bildeart.** Dominerende. Hero på oppskrift er **1:1** og fyller nesten hele
første viewport. Mørkningen over fotoet er kontrastarbeid, ikke stemning:
uten den ryker cremetekst under 4,5:1 på lyse fotopartier.

**CTA-hierarki.** Rav på espresso. Full bredde på oppskrift, auto på Hjem.

**Navigasjon.** Flat, mørk, kant øverst, rav aktiv. Ingen blur.

**States.** Relatert innhold er en **vannrett hylle**, ikke en fjerde
loddrett liste — «identiske kortrutenett» er en egen slop-signatur.

**Bevisst unngått.** Blur og glass. Grønt som flatefarge. Lyse kort på mørk
grunn.

**Estimert kompleksitet.** **Høy.** Prototypen er `color-scheme: light`, og
kommentaren i `index.html` sier eksplisitt at det er et valg, ikke en
utelatelse. C utfordrer det valget og krever at hele tokensettet kan snus.

---

## D · ARKIVET *(wildcard)*

**Kandidat-ID:** D · **Filer:** `D-arkiv/`

**Design thesis.** Florir er ikke en app som viser mat — det er et velholdt
arkiv over den. Formen er en oppslagsbok: nummererte oppføringer, harde
kanter, tabellsifre, og **de 51 utskårne ingrediensbildene brukt som selve
billedspråket** i stedet for som 40 px-ikoner nederst på en detaljskjerm.

Dette er retningen ingen annen app kan kopiere, fordi den er bygget på et
aktivum bare Florir har.

**Ønsket emosjonell respons.** Orden uten strenghet. Noe som er ført, ikke
produsert.

**Farger.**

| Rolle | Verdi |
|---|---|
| Papir / papir 2 | `#FAF6EE` / `#F1EADC` |
| Blekk / blekk 2 | `#17150F` / `#4E4838` |
| Linje | `#A79C82` (4,3:1) |
| Handling | `#23406E` blekkblått — leser som registrering, ikke velvære |
| Arkivtall | `#7C7157` |
| Fullført | `#37603F` |

**Typografi.** Newsreader (`opsz`) mot Karla. Sifre er **alltid** tabellsifre:
i et arkiv skal en kolonne stå i lodd.

**Radius.** **Null. I hele systemet, uten unntak.** En oppføring har ikke
avrundede hjørner. Det er den enkleste radiusregelen som finnes, og den er
umulig å bryte ved et uhell.

**Bildeart.** To modi. Matfoto i 4:3 uten radius. **Ingrediensutklipp i
74 px, med ulik rotasjon og ulik grunnlinje** — uregelmessigheten er valgt:
en perfekt justert rekke leser som et ikonsett, en litt skjev leser som noe
lagt ut på en benk.

**CTA-hierarki.** Firkantet blekkblå knapp, auto bredde på Hjem.

**Navigasjon.** Versaletiketter, ingen ikoner, 3 px blekkblå strek over
aktiv fane.

**States.** Fremdrift er **fem separate segmenter**, to fylte — antallet
*er* informasjonen, ikke en glidende andel. Nøkkeltall som ekte
definisjonsliste.

**Bevisst unngått.** All radius. Ikoner i bunnmenyen. Stjernerader. Kort.
Anrettet fotografi som eneste billedspråk.

**Estimert kompleksitet.** **Middels til høy.** Tokens er enkle, men
råvarerekka krever at hver oppskrift får en kuratert liste over hvilke
utklipp som representerer den — det finnes ikke i data i dag.

**⚠ Kjent risiko.** Kritikeren i Fase 1 påpeker at **fritlagte objekter på
flat flate i seg selv er et stock-/AI-signal**. D sitt kjernegrep er
eksponert for nøyaktig den innvendingen, og Fase 4 skal prøve den.


---

## E · DAGEN

**Kandidat-ID:** E · **Filer:** `E-dagen/` · **Laget etter Fase 4**

**Design thesis.** Florir handler om dagen din, ikke om pensum. «I dag» er
den bærende aksen, og modul, måltid og notat blandes fordi de skjer samme
dag. Oppskriften er paginert framfor rullet — det er dessuten slik man
faktisk lager mat, med telefonen på benken.

**Hvorfor den finnes.** Distinkthetstesten navnga tre hull i settet på fire:
layouttypen «bla» manglet helt, ingen retning var organisert etter tid, og
varmen var malt på med én bakgrunnsfarge framfor bygget inn i struktur.

**Farger.**

| Rolle | Verdi |
|---|---|
| Grunn | `#EDEBE6` kritt — bevisst **kjølig** |
| Ark / ark 2 | `#FFFFFF` / `#E3E1DA` |
| Blekk / blekk 2 | `#1B1B18` / `#57564E` |
| Linje | `#B5B2A7` (3,0:1) |
| Paprika | `#B7371C` — brukt som **flate med areal**, ikke som liten aksent |
| Fullført | `#2F6146` |

Testen er eksplisitt: holder varmen når grunnen ikke er beige? Varmen skal
komme fra paprikafeltet, fra ark som ligger fysisk stablet med forskyvning,
og fra matfoto — ikke fra bakgrunnstonen.

**Typografi.** Bricolage Grotesque (`opsz` 12–96, `wdth` 75–100) mot Onest.
**Sans i display-rollen er et bevisst valg** etter M-01: researchens eneste
harde måling var at NYT Cooking bruker sans på oppskriftstitler og
reserverer serif til redaksjonelt innhold. A, C og D kjørte alle
display-serif uten belegg for matflater.

**Radius.** To verdier: **18 px** ark, **10 px** foto. Regelen er «dette er
et ark du kan flytte».

**Navigasjon.** Ukestripe med sju like celler à 50 px. Navigasjonen er
**posisjon i en sekvens**, ikke en innholdskategori — det er forskjellen på
en dagbok og en katalog.

**Bevisst unngått.** Display-serif. Beige grunn. Seksjoner sortert etter
innholdstype.

**Estimert kompleksitet.** **Høy.** Krever at hjemskjermen bygges om fra
seksjoner til hendelser med tidspunkt, og at oppskriften får en ekte
sidemodell. Ingen av delene finnes i data i dag.

**⚠ Dommen.** Evaluatoren konkluderte med at **E ikke er en tredje
retning** — den er «verktøyet» (B) med tidsakse og ett farget felt.
Hierarkiet bæres av container, ikke av typegrad, og layouttypen på hjem er
fortsatt liste. Hullet «bla» er ikke lukket: pagineringsprikkene på
oppskriften er «et bla-tegn påklistret en scroll». Se `04-evaluering.md`
§ 4.4.
