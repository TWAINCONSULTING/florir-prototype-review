/**
 * Florir — verifiseringssveip. Kjøres etter hver del.
 *
 *   dev-browser --browser florir run <denne fila>
 *
 * Mobil viewport settes FØRST. Måling i et kollapset panel gir 0×0 og er
 * verdiløs — den feilen er årsaken til at høyde måles i det hele tatt.
 */

let BASE = "http://127.0.0.1:8901/florir-prototype.html";
try {
  const konfigurert = (await readFile("florir-base-url.txt")).trim();
  if (/^https?:\/\//.test(konfigurert)) BASE = konfigurert;
} catch {
  // Ingen lokal overstyring: bruk standardporten.
}

/**
 * Cache-buster på hver navigasjon.
 *
 * python -m http.server sender Last-Modified uten Cache-Control: no-store, så
 * nettleseren kan svare fra egen cache. Da måler sveipet en FIL SOM IKKE
 * LENGER FINNES på disk, og rapporterer at alt passerer.
 *
 * Det skjedde: tre rettelser var på disk og i det serveren svarte med, men
 * DOM viste fortsatt de gamle verdiene. En verifisering som kan validere
 * gammelt innhold er verre enn ingen verifisering, fordi den gir samme grønne
 * svar som en ekte kjøring.
 */
let _v = 0;
const url = (hash = '') => `${BASE}?v=${++_v}${hash}`;
const BREDDE = 393;

const page = await browser.getPage("main");
await page.setViewportSize({ width: BREDDE, height: 852 });

const konsollfeil = [];
page.on("console", m => { if (m.type() === "error") konsollfeil.push(m.text()); });
page.on("pageerror", e => konsollfeil.push("pageerror: " + e.message));

await page.goto(url(), { waitUntil: "load" });

const funn = [];
const legg = (alvor, hva) => funn.push(`${alvor} ${hva}`);

// ---------------------------------------------------------------------------
// 1 · Alle skjermer nåbare, og hver av dem måles mens den FAKTISK er synlig
// ---------------------------------------------------------------------------
// Ruteren er lukket inne i en IIFE, og appen leser hashen KUN ved oppstart —
// den har ingen hashchange-lytter, fordi historikken eies av appens egen
// stakk. Å sette location.hash på en åpen side gjør derfor ingenting.
// Derfor lastes siden på nytt per skjerm; det er dessuten den veien en delt
// lenke faktisk tar.
//
// Noen skjermer trenger en nyttelast for å vise innhold. Uten den er tom
// tilstand det RIKTIGE svaret, ikke en feil — men da måler vi ikke hero-en,
// så de får en id med seg.
const NYTTELAST = { oppskrift: 'r-01', notat: 'n-01' };

const SKJERMER = await page.evaluate(() =>
  [...document.querySelectorAll('.screen')].map(s => s.id.replace(/^s-/, '')));

const rapport = [];
for (const navn of SKJERMER) {
  const id = NYTTELAST[navn];
  // about:blank imellom: en goto som bare endrer hash er en samme-dokument-
  // navigasjon og laster IKKE på nytt, så start() ville aldri kjørt igjen.
  await page.goto('about:blank');
  await page.goto(url('#/' + navn + (id ? '/' + id : '')), { waitUntil: 'load' });
  await page.waitForTimeout(120);

  // Landet vi der vi ba om? Uten denne kontrollen passerer sveipet stille
  // selv om navigasjonen ikke virker i det hele tatt.
  const landet = await page.evaluate(() => {
    const v = [...document.querySelectorAll('.screen')].filter(s => !s.hidden);
    return v.length === 1 ? v[0].id.replace(/^s-/, '') : null;
  });
  if (landet !== navn) {
    legg('✗', `${navn}: deeplink landet på «${landet}»`);
    continue;
  }

  const r = await page.evaluate(() => {
    const synlige = [...document.querySelectorAll('.screen')].filter(s => !s.hidden);
    if (synlige.length !== 1) return { feil: `${synlige.length} skjermer synlige samtidig` };
    const s = synlige[0];

    // Flater med aspect-ratio: MÅL HØYDE, ikke bare at elementet finnes.
    //
    // Finner dem via COMPUTED style, ikke via en klasseliste. Med en liste
    // («.hero, .thumb, .medie») måtte testen oppdateres hver gang noen la til
    // en flate — og den nye flaten ville vært nøyaktig den som ikke ble målt.
    // Det er den feilen som har oppstått to ganger før, på .btn og .hero.
    const aspekt = [...s.querySelectorAll('*')]
      .filter(e => {
        const ar = getComputedStyle(e).aspectRatio;
        return ar && ar !== 'auto';
      })
      .map(e => ({
        klasse: e.className || e.tagName.toLowerCase(),
        h: Math.round(e.getBoundingClientRect().height),
        w: Math.round(e.getBoundingClientRect().width),
      }));

    // Alt trykkbart skal være >= 48px.
    const smaa = [...s.querySelectorAll('button, a[href], input, select, [tabindex]:not([tabindex="-1"])')]
      .filter(e => e.offsetParent !== null)
      .map(e => {
        const b = e.getBoundingClientRect();
        return { txt: (e.textContent || e.getAttribute('aria-label') || '?').trim().slice(0, 28),
                 h: Math.round(b.height), w: Math.round(b.width) };
      })
      .filter(x => (x.h > 0 && x.h < 47.5) || (x.w > 0 && x.w < 47.5));

    return {
      id: s.id,
      tom: s.textContent.trim().length < 5,
      aspekt,
      smaa,
      hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  if (r.feil) { legg('✗', `${navn}: ${r.feil}`); continue; }
  if (r.tom)  legg('✗', `${navn}: skjermen er tom`);

  for (const a of r.aspekt) {
    if (a.h === 0) legg('✗', `${navn}: «${a.klasse}» har HØYDE 0 (bredde ${a.w})`);
  }
  for (const s of r.smaa) {
    legg('✗', `${navn}: «${s.txt}» er ${s.w}×${s.h}px (krav 48)`);
  }
  if (r.hScroll) legg('✗', `${navn}: horisontal scroll på dokumentet`);

  rapport.push(`${navn.padEnd(16)} aspekt:${r.aspekt.length} små:${r.smaa.length}`);
}

// ---------------------------------------------------------------------------
// 2 · Ark — Escape lukker, fokus tilbake til kilden
// ---------------------------------------------------------------------------
await page.goto('about:blank'); await page.goto(url('#/oppskrifter'), { waitUntil: 'load' });
await page.waitForTimeout(150);
const ark = await page.evaluate(async () => {
  // MÅ scopes til den synlige skjermen. document.querySelector treffer også
  // knapper inne i skjulte skjermer, og da nekter lukkArk() med rette å gi
  // fokus tilbake — testen ville rapportert en feil som ikke finnes.
  const knapp = document.querySelector('.screen:not([hidden]) [data-ark]');
  if (!knapp) return { hopp: 'fant ingen [data-ark] på synlig skjerm' };
  const kilde = knapp.getAttribute('data-ark');
  knapp.focus(); knapp.click();
  await new Promise(r => setTimeout(r, 120));
  const apent = !document.getElementById('ark').hidden;
  const fokusIArk = document.getElementById('ark').contains(document.activeElement);
  return { kilde, apent, fokusIArk };
});
if (ark.hopp) legg('~', `ark: ${ark.hopp}`);
else {
  if (!ark.apent)     legg('✗', 'ark: åpnet ikke');
  if (!ark.fokusIArk) legg('✗', 'ark: fokus havnet ikke inne i arket');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  const etter = await page.evaluate(() => ({
    lukket: document.getElementById('ark').hidden,
    fokusPaKilde: !!(document.activeElement && document.activeElement.dataset
                     && document.activeElement.dataset.ark),
  }));
  if (!etter.lukket)      legg('✗', 'ark: Escape lukket ikke');
  if (!etter.fokusPaKilde) legg('✗', 'ark: fokus kom ikke tilbake til kilden');
}

// ---------------------------------------------------------------------------
// 3 · Ett klikk fyrer én gang — inn og ut av samme skjerm 5×
// ---------------------------------------------------------------------------
await page.goto('about:blank'); await page.goto(url('#/oppskrifter'), { waitUntil: 'load' });
await page.waitForTimeout(150);
for (let i = 0; i < 5; i++) {
  await page.evaluate(() => {
    const r = document.querySelector('#s-oppskrifter [data-go="oppskrift"]');
    if (r) r.click();
  });
  await page.waitForTimeout(90);
  await page.evaluate(() => {
    const b = document.querySelector('#s-oppskrift [data-back]');
    if (b) b.click();
  });
  await page.waitForTimeout(90);
}
const dobbeltfyr = await page.evaluate(() => {
  // Lagre-knappen veksler. Ett klikk skal gi ÉN veksling, ikke to.
  const r = document.querySelector('#s-oppskrifter [data-go="oppskrift"]');
  if (!r) return { hopp: true };
  r.click();
  return new Promise(res => setTimeout(() => {
    const l = document.querySelector('#s-oppskrift [data-slot="lagre"]');
    const for_ = l.getAttribute('aria-pressed');
    l.click();
    setTimeout(() => res({ for: for_, etter: l.getAttribute('aria-pressed') }), 80);
  }, 120));
});
if (!dobbeltfyr.hopp && dobbeltfyr.for === dobbeltfyr.etter) {
  legg('✗', `dobbeltfyring: lagre gikk ${dobbeltfyr.for} → ${dobbeltfyr.etter} (skulle vekslet)`);
}

// ---------------------------------------------------------------------------
// 4 · 200 % tekst — ingen dock utenfor skjerm, ingen horisontal scroll
// ---------------------------------------------------------------------------
// html{font-size:200%} gjør INGENTING i denne appen. Hver eneste font-size er
// en fast px-verdi fra tokens (--fs-body: 16px), og px bryr seg ikke om
// rot-fontstørrelsen. Den forrige varianten av denne testen målte derfor
// ingenting og passerte alltid.
//
// Dobler --fs-* direkte i stedet. Det er det Dynamic Type faktisk gjør med
// den ferdige Expo-appen, og det er den påkjenningen layouten skal tåle.
const FANER = ['hjem', 'oppskrifter', 'moduler', 'meg'];
for (const fane of FANER) {
  await page.goto('about:blank');
  await page.goto(url('#/' + fane), { waitUntil: 'load' });
  await page.waitForTimeout(120);

  const stor = await page.evaluate(() => {
    const rot = document.documentElement;
    const cs = getComputedStyle(rot);
    // Les gjeldende verdier og skriv dem tilbake doblet.
    for (const n of ['--fs-screen-title','--fs-section-title','--fs-card-title',
                     '--fs-cta','--fs-body','--fs-small','--fs-meta']) {
      const v = parseFloat(cs.getPropertyValue(n));
      if (v) rot.style.setProperty(n, (v * 2) + 'px');
    }
    return new Promise(res => setTimeout(() => {
      const skjerm = document.querySelector('.screen:not([hidden])');
      const dock = skjerm ? skjerm.querySelector('.dock') : null;
      const d = dock ? dock.getBoundingClientRect() : null;
      // Faneetikettene er det som ryker først: fire faner deler 393px.
      const etiketter = [...(dock ? dock.querySelectorAll('[data-fane]') : [])]
        .map(b => ({ t: b.textContent.trim(),
                     w: Math.round(b.getBoundingClientRect().width),
                     kuttet: b.scrollWidth > b.clientWidth + 1 }));
      res({
        dockHoyre: d ? Math.round(d.right) : null,
        dockBunn:  d ? Math.round(d.bottom) : null,
        vw: window.innerWidth, vh: window.innerHeight,
        hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        etiketter,
      });
    }, 250));
  });

  if (stor.hScroll) legg('✗', `200 % tekst (${fane}): horisontal scroll`);
  if (stor.dockHoyre !== null && stor.dockHoyre > stor.vw + 1)
    legg('✗', `200 % tekst (${fane}): dock stikker ut (${stor.dockHoyre} > ${stor.vw})`);
  if (stor.dockBunn !== null && stor.dockBunn > stor.vh + 1)
    legg('✗', `200 % tekst (${fane}): dock under skjermkant (${stor.dockBunn} > ${stor.vh})`);
  for (const e of stor.etiketter) {
    if (e.kuttet) legg('~', `200 % tekst (${fane}): faneetiketten «${e.t}» er kuttet (${e.w}px)`);
  }
}

// ---------------------------------------------------------------------------
// 4b · Duplikate id-er — målt i DOM, ikke i kilden
// ---------------------------------------------------------------------------
// Et grep på kilden (`grep -oE 'id="[^"]+"'`) gir falske treff: det matcher
// også `data-id="${o.id}"` inne i en template-literal, som forekommer én gang
// i kilden og mange ganger i DOM med ulike verdier. Den sjekken sa «duplikat»
// hver gang, og en sjekk som alltid klager er en sjekk ingen leser.
await page.goto('about:blank');
await page.goto(url(), { waitUntil: 'load' });
await page.waitForTimeout(150);
const dupl = await page.evaluate(() => {
  const sett = new Map();
  for (const e of document.querySelectorAll('[id]')) {
    sett.set(e.id, (sett.get(e.id) || 0) + 1);
  }
  return [...sett].filter(([, n]) => n > 1);
});
for (const [id, n] of dupl) legg('✗', `duplikat id="${id}" forekommer ${n} ganger i DOM`);

// ---------------------------------------------------------------------------
// 5 · Gamle deeplinker skal fortsatt lande riktig
// ---------------------------------------------------------------------------
await page.goto('about:blank');
await page.goto(url('#/program'), { waitUntil: 'load' });
await page.waitForTimeout(150);
const alias = await page.evaluate(() => {
  const v = [...document.querySelectorAll('.screen')].filter(s => !s.hidden);
  return { landet: v.length === 1 ? v[0].id : null, hash: location.hash };
});
if (alias.landet !== 's-moduler')
  legg('✗', `alias: #/program landet på «${alias.landet}», ikke s-moduler`);
if (alias.hash !== '#/moduler')
  legg('~', `alias: adressefeltet står igjen på «${alias.hash}» etter oversetting`);

// F03 er ikke en alias. Den er fjernet, og en gammel delt lenke skal lande
// trygt på onboarding uten å etterlate skjermnode eller død inngang.
await page.goto('about:blank');
await page.goto(url('#/innlegg/v-01'), { waitUntil: 'load' });
await page.waitForTimeout(150);
const fjernetF03 = await page.evaluate(() => {
  const v = [...document.querySelectorAll('.screen')].filter(s => !s.hidden);
  return {
    landet: v.length === 1 ? v[0].id : null,
    node: !!document.querySelector('#s-innlegg'),
    innganger: document.querySelectorAll(
      '[data-go="innlegg"], [href*="/innlegg"], [href*="#/innlegg"]').length,
  };
});
if (fjernetF03.landet !== 's-onboarding')
  legg('✗', `fjernet F03: gammel lenke landet på «${fjernetF03.landet}»`);
if (fjernetF03.node)
  legg('✗', 'fjernet F03: #s-innlegg finnes fortsatt i DOM');
if (fjernetF03.innganger)
  legg('✗', `fjernet F03: ${fjernetF03.innganger} innganger finnes fortsatt`);

// ---------------------------------------------------------------------------
console.log('\n  SKJERMER');
for (const l of rapport) console.log('    ' + l);

console.log('\n  KONSOLLFEIL: ' + (konsollfeil.length ? konsollfeil.join(' | ') : 'ingen'));
if (konsollfeil.length) legg('✗', `${konsollfeil.length} konsollfeil`);

console.log('\n  FUNN');
if (!funn.length) console.log('    ingen — alt passerer');
else for (const f of funn) console.log('    ' + f);
console.log(`\n  ${funn.filter(f => f.startsWith('✗')).length} feil, ` +
            `${funn.filter(f => f.startsWith('~')).length} merknader.\n`);

await writeFile('florir-share-verification.json', JSON.stringify({
  rapport,
  konsollfeil,
  funn,
  feil: funn.filter(f => f.startsWith('✗')).length,
  merknader: funn.filter(f => f.startsWith('~')).length,
}, null, 2));
