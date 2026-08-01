# Florir · delingspakke

Statisk, selvstendig reviewleveranse for Botanical-versjonen av Florir.
Reviewpakken inkluderer komplett onboarding og designsystemreview i den samme
Botanical-versjonen.

## Innhold

- `index.html` — klikkbar mobilprototype med dypelenker
- `review/index.html` — skjermoversikt med stabile skjermnøkler
- `review/wireframes.html` — samlet wireframebrett
- `review/screens.csv` — Notion-klart skjermmanifest
- `screens/` — mobilbilder for hovedskjermer, onboarding og designsystem
- `assets/ingredients/` — 50 transparente ingrediensbilder
- `tools/remove_chroma_key.py` — normalisering til transparent 256 × 256 PNG

## Deling

Pakken er laget for GitHub Pages. Alt er statisk og krever ingen serverlogikk.
Prototypen bruker hash-ruter, så en skjerm kan lenkes direkte, for eksempel
`/#/oppskrift/r-01`.

Onboarding er klikkbar fra intro via ni profil-/preferansesteg, planbygging og
planresultat. Primærhandlingen på resultatet går til `/#/hjem`.

`robots.txt` og sidens metatagger ber søkemotorer om å ikke indeksere
innholdet. Dette er ikke tilgangskontroll: alle som får lenken kan åpne den.
