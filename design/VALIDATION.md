# Kontrollert 9. september 2026

## Automatiserte kontroller

29 skjermrenderinger og de sammenhengende hovedløpene er kjørt med DOM-hendelser i en isolert test:

- Dagbok: opprett, åpne, endre og lagre. Mislykket lagring med nytt forsøk gir ett notat. Tekst med HTML vises som tekst.
- Oppskrift: ingredienser, steg, utvidede detaljer, porsjoner og favoritter.
- Plan: legg til rett; innkjøpsbehov oppdateres. Varer som finnes hjemme utelates. Produktvalg og antall inngår i summen.
- Innlogging/onboarding: Apple-demo og tre steg med navn og ønsker.
- Prøve: samtykke før start, tilgangsgrenser og avslutning. Eksisterende plan beholdes ved prøvestart.
- Pris: 499, 449, 399, 349, 299, 249, 199, 180 og fortsatt 180 i senere måneder.
- Læring: klippfavoritt, oppsummering og neste del; lagring inneholder brukerens valg.

`node tools/check-progress.mjs` bruker den reelle SQL-migrasjonen og SQLite. Testen verifiserer serverlagring, lesing, sletting, isolasjon mellom brukere, revisjonskonflikt, manglende autentisering, feil opprinnelse, ugyldige data og størrelsesgrense.

Den kompilerte Worker-pakken er syntakskontrollert. App, CSS, JavaScript, dagbokstempel, referansegalleri, bevart prisvariant og webmanifest finnes i pakken.

## Nettlesergjennomgang

Utført på den isolerte interne forhåndsvisningen, med ekte klikk:

- Hjem og dagbok sett visuelt. Et notat ble lagret og var tilgjengelig etter ny sidelasting.
- Oppskrift åpnet fra Mat; ingrediens og tilberedningssteg krysset av, og stegdetaljer åpnet.
- Oppskrift lagt inn på en dato; måltidsplan, handleliste, varegjennomgang og kurv åpnet i rekkefølge. En hjemmevare ble utelatt fra vareforslaget.
- Moduler åpnet fra hovedmenyen. Fem stående klipp ble gjennomgått til oppsummering, og et klipp ble lagret.
- Oppsummering sett visuelt. Ingen horisontal overflow i det kontrollerte telefonoppsettet.

Den siste videre nettleserhandlingen ble avvist av nettleserens URL-policy. Den ble ikke omgått. Onboarding og prisflyt er derfor verifisert gjennom DOM-testene, men har ikke en full separat visuell nettleserkontroll i denne runden.

## Avgrensning

Ingen produksjonsbetaling, ekstern OAuth, utsendt e-post eller Oda-bestilling er gjennomført. Faktiske videoopptak mangler. Publisert URL bekreftes med Sites' deploystatus; den åpnes ikke i agentens nettleser. Testnotater og testfremdrift ligger bare i isolert forhåndsvisning.
