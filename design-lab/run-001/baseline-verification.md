# Baseline-verifisering — Florir Run 001

**Dato:** 18. august 2026
**Commit:** `cf89693` — «Forenkle onboarding og løft aktive moduler»
**Viewport:** 393 × 852
**Base:** `http://127.0.0.1:8901/index.html` (python3 `http.server`)

## Riggen

`tools/verifiser.js` kjøres av `dev-browser --browser florir run …`. Den kommandoen
finnes ikke i dette miljøet. Sveipet er derfor portet til rå Playwright som
`tools/pw/verifiser-pw.mjs`.

Porten er en riggbytte, ikke en omskriving. Alt som avgjør hva som **måles** er
kopiert ordrett: cache-busteren `?v=n`, `about:blank` mellom hver navigasjon,
måling kun på den synlige skjermen, oppslag av flater via *computed*
`aspect-ratio` framfor klasseliste, og doblingen av `--fs-*` framfor
`html{font-size:200%}`. Bare `browser.getPage`/`readFile`/`writeFile` er byttet
mot `chromium.launch()` og `node:fs/promises`.

Originalen er urørt. Den skal fortsatt kjøre der `dev-browser` finnes.

## Resultat, de 11 originale kontrollene

```
0 feil, 0 merknader.
KONSOLLFEIL: ingen
```

33 skjermer nådd og målt — 22 DOM-skjermer (minus `onboarding-steg`, som er et
skall) pluss 11 onboardingruter. Det stemmer med de 33 registrerte skjermene i
`review/screens.csv`.

Kontrollene som passerte:

| Kontroll | Status |
|---|---|
| Alle 33 dyplenker lander på riktig skjerm | ✅ |
| Nøyaktig én skjerm synlig om gangen | ✅ |
| Ingen `aspect-ratio`-flate med høyde 0 | ✅ (11 flater målt) |
| Alle trykkflater ≥ 48 px | ✅ (0 avvik) |
| Ingen horisontal scroll | ✅ |
| Ark: åpner, fokus inn, Escape lukker, fokus tilbake til kilden | ✅ |
| Ett klikk = én veksling (5× inn/ut) | ✅ |
| 200 % tekst på 4 faner: ingen h-scroll, dock innenfor, ingen kuttede etiketter | ✅ |
| Ingen duplikate id-er i DOM | ✅ |
| Alias `#/program` → `s-moduler`, adressefelt oppdatert | ✅ |
| Fjernet F03: `#/innlegg/v-01` → `s-onboarding`, ingen rest i DOM | ✅ |
| Konsollfeil | ✅ ingen |

## Kontroll 12, lagt til underveis: sticky flate over innhold

Under Fase 2 dukket det opp en feil sveipet ikke kunne se. `.recipe-tabs` er
`position:sticky; top:0` og følger med hele veien ned `#/oppskrift/r-01` —
forbi seksjonen den styrer — mens innholdet ruller under den uten
kompensasjon. Se `00-baseline.md`, F-13.

Kontrollen er lagt til som punkt 6 i porten og er tydelig merket
`[TILLEGG — ikke i originalen]`. **Baselinen stryker på den:**

```
✗ oppskrift: sticky flate dekker «salt»
✗ oppskrift: sticky flate dekker «en klype»
✗ oppskrift: sticky flate dekker «Legg i matplanen»     ← primærhandlingen
✗ oppskrift: sticky flate dekker «Kommentarer»
✗ oppskrift: sticky flate dekker «Mest nyttig ⌄»
✗ oppskrift: sticky flate dekker «Maria»
✗ oppskrift: sticky flate dekker «For 2 dager siden»
✗ oppskrift: sticky flate dekker «5,0»
✗ oppskrift: sticky flate dekker «Kaffen er valgfri. Uten den sm…»

9 feil, 0 merknader.
```

Det er meningen at den feiler nå. En kontroll som først innføres etter at
feilen er rettet, kan ikke vise at den er rettet — den kan bare påstå det.
Ved å registrere de ni linjene her blir champion-implementeringen målt mot et
tall som faktisk stod rødt før.

**Portkravet fra og med Fase 3:** de 11 originale kontrollene skal fortsatt
gi 0 feil, og kontroll 12 skal gå fra 9 til 0.

Rådata: `design-lab/run-001/baseline-verification.json`

## Hva dette betyr for designsprinten

Baselinen er **teknisk grønn**. Ingen av problemene vi skal løse er
funksjonsfeil, og sveipet kan derfor brukes som en ren regresjonsport: enhver
rød linje etter en designendring er innført av designendringen.

Sveipet dekker likevel ikke det vi skal måle. Det tester at flater *finnes* og
har *høyde*, ikke om de er verdt å se på. Det tester 48 px, ikke om
trykkflatene er lesbare. Det tester at tekst ikke kuttes ved 200 %, ikke om
kontrasten holder ved 100 %. Fase 0b måler det som mangler, og de funnene
finnes ikke i tabellen over.

## To hull som fortsatt står åpne

1. **Kontrast måles ikke.** Sveipet ville passert uendret med `--text-muted` på
   2,32:1 — som er nøyaktig det den gjør i dag (se `00-baseline.md`, F-04).
2. **`reduced-motion` måles ikke.** CSS-regelen finnes
   (`@media (prefers-reduced-motion:reduce)` på `.screen.enter`), men ingen
   test kjører med flagget satt.

Begge legges inn som nye kontroller i Fase 7, etter samme oppskrift som
kontroll 12: måles på baselinen først, slik at tallet før endringen finnes.
