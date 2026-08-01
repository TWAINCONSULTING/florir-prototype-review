# Genereringsmanual · ingrediensbilder

Status: rekonstruert og standardisert 2026-08-01.

De første fire motivene ble generert 2026-07-30 og de øvrige 46 den
2026-07-31 med OpenAIs innebygde imagegen. De opprinnelige ordrette promptene,
seedene og modellversjonen ble ikke lagret. Prompten under er derfor den
kanoniske oppskriften fremover, ikke en påstand om historisk ordretthet.

## Kanonisk prompt

```text
Create one isolated [INGREDIENT] as a realistic food-photography cutout with
subtle premium 3D polish. Centered composition, three-quarter view, soft
diffuse daylight, natural texture and restrained contact shadow. The whole
ingredient must fit comfortably inside a square frame with generous breathing
room. Solid chroma-key green background #00FF00. No plate unless it is
essential to recognize the ingredient. No packaging, hands, utensils, text,
letters, labels, logos, decorative props, gradients or scenery. One ingredient
family only. Clean, calm and consistent with a premium Nordic food app.
```

Bytt bare ut `[INGREDIENT]`. Beskriv en tydelig form når ingrediensen ellers
kan bli tvetydig, for eksempel «a small glass carafe of water» eller «a neat
pile of rolled oats».

## Arbeidsflyt

1. Generer kvadratisk original mot nøyaktig `#00FF00`.
2. Velg ett motiv med realistisk form og rolig lys.
3. Fjern chroma key og normaliser motivet:

```bash
python3 tools/remove_chroma_key.py input.png output.png
```

4. Gi filen en stabil, engelsk kebab-case-nøkkel.
5. Legg nøkkelen i `manifest.csv` og i prototypeoppslaget.
6. Kontroller bildet mot både varm hvit canvas og mørk testflate.

## Kvalitetskrav

- 256 × 256 RGBA PNG
- alfa 0 i alle fire hjørner
- ingen grønn kant eller grønt fargestikk
- ingen avkuttet matvare
- ingen synlig bakgrunnsflate
- ingen tekst, logo eller emballasje
- samme rolige lysretning og utsnitt som resten av biblioteket
- kontaktsskygge kan beholdes med myk, delvis transparent alfa

## Reproduserbarhet

Bildefremstilling er ikke deterministisk uten bevart modellversjon og seed.
Målet er derfor visuell konsistens, ikke identiske piksler. Når nye bilder
genereres, bør dato, verktøy/modell og den faktiske sluttprompten legges til i
manifestet med én gang.

