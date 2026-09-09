# Florir · ny botanisk prototype

Oppdatert september 2026 med godkjent porselen-, salvie- og havrestil.

- Start: `index.html` eller `#/onboarding`. Utforsk-knappen åpner hele demoen.
- Hjem, moduler, oppskrifter, oppskriftsdetaljer, ukesplan og Ditt rom følger referansene i `assets/reference/`.
- Tre onboardingsteg: navn, ønsker og hverdag.
- Apple og Google er hovedvalg, med e-post som alternativ.
- Oppskriftsingredienser og steg kan krysses av. Hvert steg kan åpnes for full forklaring. Porsjoner skalerer mengdene.
- Planen samler ingredienser for valgt uke. Varer du allerede har, utelates fra Oda-forslaget.
- Prøveflyt: tre gratis dager, første moduldel, fem oppskrifter og tre planlagte retter. Foreslått pris er 499 kr/mnd etter prøven, deretter 449, 399, 349, 299, 249 og 199 kr fra måned 7. Priser og fornyelse vises før samtykke. Prøven kan avbrytes under medlemskap.

## Prototypens grenser

Dette er en statisk, klikkbar prototype. Apple/Google/e-post, betaling og Oda-overføring er eksplisitte demoflyter. Ingen OAuth-konto opprettes, e-post sendes, kort belastes eller varer bestilles. Oda-priser og produktsammenstillinger er eksempler. Lenken åpner Oda, uten å overføre kurven.

Navn, notater, sjekklister og planer holdes i minnet i den åpne fanen. Ingen personlig informasjon persisteres eller sendes til en modell. Laster man siden på nytt, starter en ny demo. Video- og lydinnhold er forhåndsvisninger med lesbar eksempeltekst.

Før en reell lansering må autentisering med verifiserte tilbakekall, serverlagring, betalingsleverandør, abonnementshendelser, ferdige vilkår og Oda-autorisasjon kobles til. Prøvemedlemskapet er en UX-modell, ikke en betalt tjeneste.

## Kode og referanser

- `assets/app.js`: eksisterende innhold og navigasjonsmotor.
- `assets/florir.js`: nye skjermrenderere og prototypehandlinger.
- `assets/base.css` og `assets/florir.css`: grunnstil og godkjent designsystem.
- `design/DESIGN.md`: den godkjente designretningen.
- `design/login-membership.webp`: nytt forslag til start og medlemskap.
- `review/index.html`: godkjente referanser og direkte innganger til skjermene.

Ingen installasjon eller kompilering er nødvendig. Alt kan serveres statisk. `dist/` inneholder den samme kjørbare prototypen for Sites.

Verifisert med JavaScript-syntakskontroll og automatiserte kjøretidstester av 27 ruter, avkryssing, detaljer, porsjoner, lagring i økten, planlegging, handleliste, onboarding, prøvesamtykke, tilgangsgrenser og avslutning. Ingen visuell nettlesertest ble utført i denne runden.

---

## Tidligere leveranse

Statisk, selvstendig reviewleveranse for Botanical-versjonen av Florir.
Reviewpakken inkluderer komplett onboarding og designsystemreview i den samme
Botanical-versjonen.

## Innhold

- `index.html` — klikkbar mobilprototype med dypelenker
- `review/index.html` — skjermoversikt med stabile skjermnøkler
- `review/wireframes.html` — samlet wireframebrett
- `review/screens.csv` — Notion-klart skjermmanifest
- `screens/` — mobilbilder for hovedskjermer, onboarding og designsystem
- `assets/ingredients/` — 51 transparente ingrediensbilder
- `tools/remove_chroma_key.py` — normalisering til transparent 256 × 256 PNG

## Deling

Pakken er laget for GitHub Pages. Alt er statisk og krever ingen serverlogikk.
Prototypen bruker hash-ruter, så en skjerm kan lenkes direkte, for eksempel
`/#/oppskrift/r-01`.

Onboarding er klikkbar fra intro via ni profil-/preferansesteg, planbygging og
planresultat. Primærhandlingen på resultatet går til `/#/hjem`.

`robots.txt` og sidens metatagger ber søkemotorer om å ikke indeksere
innholdet. Dette er ikke tilgangskontroll: alle som får lenken kan åpne den.
