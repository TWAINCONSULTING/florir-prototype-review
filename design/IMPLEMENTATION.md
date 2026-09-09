# Implementert 9. september 2026

Den godkjente porselen-, salvie- og havrestilen er videreført i native HTML-kontroller. Referansefoto og botanikk brukes som CSS-utsnitt; tekst og interaksjoner er ekte grensesnitt. Responsive skjermer prioriterer lesbar tekst og brukbare trykkflater. Originalfotoet av grunnleggerne er bevart.

Dagboken har bare et skrivefelt, dato og tid. Blomsten er et diskret, monokromt avtrykk inne i nedre høyre hjørne. Ingredienser og korte tilberedningssteg har separate avkryssinger; stegtittelen åpner flere detaljer. Blender-tipset er en lett typografisk merknad uten en stor kortboks.

Handlekurvens antall varer og pakninger ligger bak informasjon ved summen. Pakningsforslag baseres på samlet behov i ukesplanen. Oda-integrasjonen er en tydelig demo; kopiering av listen og åpning av Oda er reelle handlinger.

Stående klipp bruker scroll-snap, gjenopptakelse, lagring og en oppsummering etter siste klipp. Lagrede klipp finnes i Ditt rom. Fem deler med ulike tekster gir en full gjennomgang. Faktiske innspillinger gjenstår; foto og tekster er merket som forhåndsvisning. Den alternative vanlige leksjonen beholder Se/Lytt/Les, med et tydelig læringspoeng i kortet.

Prisgrafen viser redusert månedspris ned til 180 kr fra måned 8. Månedene er 499, 449, 399, 349, 299, 249, 199 og 180. Et nytt medlemskap begynner på 499. Den tidligere utformingen er bevart i `approved-v3/price-flat-layout-reference.webp` som mulig utgangspunkt dersom modellen senere blir flat. Aktiv prototype bruker den fallende modellen.

Apple og Google er hovedvalg med e-post som alternativ. Prototypens knapper simulerer disse leverandørene; den private sidens innlogging identifiserer den reelle brukeren for serverlagring. Ingen kort belastes, ingen OAuth-konto opprettes og ingen e-post sendes.

D1 lagrer fremdrift per privat bruker. API-et avviser manglende innlogging, feil opprinnelse, for store/ugyldige data og samtidige overskrivinger. Dagbokknappen bekrefter først lagring når serveren har svart. Mislykket lagring beholder teksten og viser et forsøk-igjen-valg. Lokal forhåndsvisning og testdata er isolert fra produksjon.
