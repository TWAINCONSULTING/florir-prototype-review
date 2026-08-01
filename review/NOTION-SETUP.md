# Notion-oppsett · Florir skjermreview

## Historikkmodell fra 1C.0

- `Florir — Skjermer` — én stabil rad per skjermidentitet.
- `Florir — App-versjoner` — én rad per reviewbar milepæl.
- `Florir — Skjermversjoner` — én rad per kombinasjon av skjerm og appversjon.

Den opprinnelige `Florir App Review` beholdes urørt som 1B.1-arkiv, slik at
tidligere feedback ikke blir overskrevet. 1C.0-kortene opprettes i den nye
skjermversjonsdatabasen og relateres til både skjerm og appversjon.

Obligatoriske visninger er `Skjermhistorikk`, `Gjeldende versjon`,
`Appversjon` og `Endringer siden sist`.

Bruk én rad per stabil skjerm. F-numrene er reviewreferanser og skal ikke
brukes som permanente primærnøkler.

- Klikkbar prototype: https://twainconsulting.github.io/florir-prototype-review/
- Review-galleri: https://twainconsulting.github.io/florir-prototype-review/review/
- Wireframe-brett: https://twainconsulting.github.io/florir-prototype-review/review/wireframes.html
- Importmanifest: `screens.csv` (inkluderer endelige prototype- og bilde-URL-er)

## Egenskaper

- `Skjerm` — title
- `Skjermnøkkel` — rich text
- `Område` — select: Kom i gang, Hjem, Læring, Mat, Meg, Hjelp, Profil
- `Rute` — rich text
- `Prototype` — URL
- `Wireframes` — rich text
- `Skjermbilde` — files
- `Status` — status: Kladd, Klar for review, Endres, Godkjent
- `Versjon` — rich text
- `Reviewdato` — date
- `Prioritet` — select: P0, P1, P2
- `Sist oppdatert` — last edited time

## Kortmal

```text
<callout icon="↗️" color="green_bg">
	[Åpne denne skjermen i den klikkbare prototypen](PROTOTYPE_URL)
</callout>

## Gjeldende skjerm

SKJERMBILDE

## Wireframe og tilstander

Lenker og bilder for alle relevante wireframe-rammer.

---

## Review · 2026-08-01 · 1B.1 Botanical

### Generell tilbakemelding

Skriv her.

### Dette liker jeg

Skriv her.

### Dette liker jeg ikke

Skriv her.

### Beslutning og neste endring

Skriv her.
```

## Visninger

1. `Alle skjermer` — gallery med skjermbildet som cover.
2. `Til review` — gallery filtrert på `Klar for review`.
3. `Reviewstatus` — board gruppert på `Status`.
4. `Endringslogg` — table sortert på `Reviewdato` synkende.
