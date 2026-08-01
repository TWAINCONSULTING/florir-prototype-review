/**
 * Fanger hver skjerm i Florir som eget bilde, med tilstanden satt.
 *
 * Flere skjermer er tomme uten oppsett — måltidsplanen, lagrede oppskrifter,
 * kommentarer. Et wireframe-ark av tomme skjermer er ubrukelig til å peke i,
 * så hver ramme får den tilstanden som gjør den verdt å se på. Der tomheten
 * SELV er poenget, står den som egen ramme.
 */

let BASE = "http://127.0.0.1:8901/florir-prototype.html";
try {
  const konfigurert = (await readFile("florir-base-url.txt")).trim();
  if (/^https?:\/\//.test(konfigurert)) BASE = konfigurert;
} catch {
  // Ingen lokal overstyring: bruk standardporten.
}
const page = await browser.getPage("main");
await page.setViewportSize({ width: 393, height: 852 });

let v = 0;
const url = (hash) => `${BASE}?v=${++v}${hash}`;

const RAMMER = [
  { id:'F01', navn:'Onboarding',            hash:'#/onboarding' },
  { id:'F02', navn:'Hjem',                  hash:'#/hjem' },
  { id:'F04', navn:'Moduler',               hash:'#/moduler' },
  { id:'F05', navn:'Videoleksjon',          hash:'#/video' },
  { id:'F06', navn:'Refleksjon',            hash:'#/refleksjon' },

  { id:'F07', navn:'Mat — hjem',            hash:'#/oppskrifter' },
  { id:'F08', navn:'Mat — hylla',           hash:'#/oppskrifter', scroll:330 },
  { id:'F09', navn:'Mat — Middag er tom',   hash:'#/oppskrifter',
              klikk:['[data-sett=\'{"maltid":"middag"}\']'],
              note:'Tom tilstand. Biblioteket har 0 middagsretter.' },

  { id:'F10', navn:'Alle oppskrifter',      hash:'#/oppskriftsliste' },
  { id:'F11', navn:'Søk — treff',           hash:'#/oppskriftsliste',
              skriv:['[data-sok]','chia'] },
  { id:'F12', navn:'Søk — ingen treff',     hash:'#/oppskriftsliste',
              skriv:['[data-sok]','pizza'] },
  { id:'F13', navn:'Sortert på populært',   hash:'#/oppskriftsliste',
              klikk:['[data-ark="sorter-oppskrifter"]',
                     '[data-handling=\'{"h":"sorter-oppskrifter","sortering":"popular"}\']'],
              note:'Kuratert er standard. Dette må velges.' },

  { id:'F14', navn:'Oppskrift — topp',      hash:'#/oppskrift/r-01' },
  { id:'F15', navn:'Oppskrift — ingredienser', hash:'#/oppskrift/r-01', scroll:430 },
  { id:'F16', navn:'Oppskrift — metode',    hash:'#/oppskrift/r-01',
              klikk:['[data-sett=\'{"del":"metode"}\']'] },
  { id:'F17', navn:'Oppskrift — vurdering', hash:'#/oppskrift/r-01', scroll:1450 },
  { id:'F18', navn:'Oppskrift — kommentarer', hash:'#/oppskrift/r-01', scroll:1800 },
  { id:'F19', navn:'Ark — skriv kommentar', hash:'#/oppskrift/r-01',
              klikk:['[data-ark="kommenter"]'] },

  { id:'F20', navn:'Måltidsplan — tom',     hash:'#/maltidsplan' },
  { id:'F21', navn:'Måltidsplan — plan',    hash:'#/maltidsplan',
              klikk:['.empty button'] },
  { id:'F22', navn:'Ark — bytt ut',         hash:'#/maltidsplan',
              klikk:['.empty button', '.byttut'] },
  { id:'F23', navn:'Handleliste',           hash:'#/maltidsplan',
              klikk:['.empty button'], scroll:700 },
  { id:'F24', navn:'Handleliste — avdeling', hash:'#/maltidsplan',
              klikk:['.empty button'], scroll:1400 },

  { id:'F25', navn:'Meg',                   hash:'#/meg' },
  { id:'F26', navn:'Meg — nederst',         hash:'#/meg', scroll:400 },
  { id:'F27', navn:'Hjelp',                 hash:'#/hjelp' },
  { id:'F28', navn:'Hjelp — nederst',       hash:'#/hjelp', scroll:400 },

  { id:'F29', navn:'Tilbakeblikk',          hash:'#/tilbakeblikk' },
  { id:'F30', navn:'Notatene mine',         hash:'#/notater' },
  { id:'F31', navn:'Ett notat',             hash:'#/notat/n-01' },
  { id:'F32', navn:'Skriv notat',           hash:'#/notat-opptak' },

  { id:'F33', navn:'Innstillinger',         hash:'#/innstillinger' },
  { id:'F34', navn:'Interesser',            hash:'#/interesser' },
  { id:'F35', navn:'Endre navn',            hash:'#/profil-navn' },
  { id:'F36', navn:'Kontoen min',           hash:'#/konto' },
];

const ut = [];
for (const r of RAMMER) {
  await page.goto('about:blank');
  await page.goto(url(r.hash), { waitUntil: 'load' });
  await page.waitForTimeout(320);

  if (r.klikk) {
    for (const sel of r.klikk) {
      const traff = await page.evaluate(s => {
        const el = document.querySelector('.screen:not([hidden]) ' + s)
                || document.querySelector('#ark ' + s) || document.querySelector(s);
        if (!el) return false;
        el.click(); return true;
      }, sel);
      if (!traff) console.log(`  ${r.id}: fant ikke «${sel}»`);
      await page.waitForTimeout(300);
    }
  }
  if (r.skriv) {
    const [sel, tekst] = r.skriv;
    await page.locator('.screen:not([hidden]) ' + sel).fill(tekst);
    await page.waitForTimeout(300);
  }
  if (r.scroll) {
    await page.evaluate(n => {
      const s = document.querySelector('.screen:not([hidden]) .scroll');
      if (s) s.scrollTop = n;
    }, r.scroll);
    await page.waitForTimeout(250);
  }

  const sti = await saveScreenshot(await page.screenshot({ type: 'jpeg', quality: 78 }),
                                   `florir-${r.id}.jpg`);
  ut.push({ ...r, sti });
  console.log(`${r.id}  ${r.navn}`);
}

await writeFile('rammer.json', JSON.stringify(ut, null, 1));
console.log(`\n${ut.length} rammer fanget.`);
