# Florir · botanisk appprototype

Oppdatert 9. september 2026. Privat app: https://florir.mark-twain.chatgpt.site

## Prøv appen

Starten ligger på `/#/hjem`. De fire hovedfanene er Hjem, Moduler, Mat og Meg. Start og demoinnlogging finnes under Innstillinger → Logg ut av demoen, eller direkte på `/#/onboarding`. På større skjermer finnes også «Alle skjermer» under telefonen.

- Tre onboardingsteg: navn, ønsker og hverdag. Apple, Google og e-post har komplette demoflyter.
- Prisvisningen viser 499 → 449 → 399 → 349 → 299 → 249 → 199 → 180 kr. Gulvet gjelder fra måned 8 mens medlemskapet løper. Tre gratis prøvedager gir første del, fem oppskrifter og inntil tre retter i planen. Fornyelse krever avkrysset samtykke i demoen, og prøven kan avsluttes under medlemskap.
- Dagbok uten tittelfelt eller hjelpechips, med dato, klokkeslett og et diskret blomsterstempel i arket. Notater kan opprettes, åpnes, endres og slettes.
- Ingredienser og korte oppskriftssteg kan krysses av separat. Hvert steg åpnes for detaljer. Porsjoner skalerer mengdene, og oppskrifter kan lagres og legges i planen.
- Uke- og dagsplan med redigerbare retter. Handlelisten samler behov, utelater varer du har hjemme og foreslår pakninger. Antall og eksempelvariant kan endres; summen beregnes fra valgene. Listen kan kopieres før Oda åpnes.
- Fem deler av Matstøy med fem stående klipp per del. Bla eller trykk videre til oppsummering og neste del. Lagring av klipp, gjenopptakelse, lesetekst og nettleseropplesning er koblet sammen. Vanlig leksjonsvisning finnes under «Alle deler».
- Profil, notater, utkast, favoritter, avkryssinger, måltidsplan og modulframdrift lagres per autentisert bruker i D1. Tilbakeknapp, nettleserhistorikk og dypelenker fungerer sammen.

## Ærlige prototypgrenser

Sidens private innlogging er reell. Apple/Google/e-post **inne i Florir** demonstrerer derimot fremtidig OAuth og sender ingen e-post. Betaling utfører ingen belastning. Oda-lenken åpner Oda; den overfører ingen varer eller bestilling. Pakningsstørrelser og priser er eksempler.

Ingen innspilte videoer ble levert. Klippene er derfor merket illustrerte forhåndsvisninger med foto og lesbart eksempelinnhold. «Lytt» bruker nettleserens talesyntese der den er tilgjengelig. Wake Lock, deling og utklippstavle avhenger av nettleserstøtte og sikker forbindelse.

## Kjør og bygg

Node 22+ (med `node:sqlite`) og Python 3 brukes lokalt.

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 4173
npm run build
node tools/check-progress.mjs
```

Lokal forhåndsvisning bruker en isolert SQLite-database i `.preview-data/`. Den publiseres aldri. Produksjon bruker Sites' pålitelige brukerheader og D1-bindingen `DB`. Migrasjonen ligger i `drizzle/`. API-et bruker brukeravgrensede spørringer, revisjonskontroll og opprinnelseskontroll. Et midlertidig utkast på enheten beskytter dagboktekst ved forbindelsesfeil; serveren er den autoritative lagringen.

`tools/build-worker.py` pakker frontend og API i `dist/server/index.js`. Bruk Sites' offisielle bygge- og pakkeskript for publisering. Dette er nå en Worker-app og kan ikke publiseres uendret som en ren GitHub Pages-side.

## Design og kildefiler

- `assets/app.js`: grunninnhold og navigasjon.
- `assets/florir.js`: godkjente grunnskjermer og handlinger.
- `assets/experience.js` og `.css`: siste designrunde, komplette flyter og lagring.
- `worker/index.js`: autentisert API og publisert assetserver.
- `design/DESIGN.md`: designretning.
- `design/approved-v3/`: siste ni referanser, også prisoppsettet beholdt for mulig flatpris.
- `/review/`: oppdatert referanseoversikt med lenker til levende skjermer.
- `design/IMPLEMENTATION.md`: valg og avgrensninger.
- `design/VALIDATION.md`: gjennomførte kontroller.

Eldre skjermbilder og wireframes er historiske referanser, ikke gjeldende implementasjon.
