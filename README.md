# Florir · delingspakke

Statisk, selvstendig reviewleveranse for Botanical-versjonen av Florir.

## Innhold

- `index.html` — klikkbar mobilprototype med dypelenker
- `review/index.html` — skjermoversikt med stabile skjermnøkler
- `review/wireframes.html` — samlet wireframebrett
- `review/screens.csv` — Notion-klart skjermmanifest
- `screens/` — 21 aktuelle mobilbilder fra fase 1B
- `assets/ingredients/` — 50 transparente ingrediensbilder
- `tools/remove_chroma_key.py` — normalisering til transparent 256 × 256 PNG

## Deling

Pakken er laget for GitHub Pages. Alt er statisk og krever ingen serverlogikk.
Prototypen bruker hash-ruter, så en skjerm kan lenkes direkte, for eksempel
`/#/oppskrift/r-01`.

`robots.txt` og sidens metatagger ber søkemotorer om å ikke indeksere
innholdet. Dette er ikke tilgangskontroll: alle som får lenken kan åpne den.

