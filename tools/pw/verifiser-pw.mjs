/**
 * Playwright-port av tools/verifiser.js.
 *
 * Originalen kjøres av `dev-browser --browser florir run tools/verifiser.js`,
 * som ikke finnes i dette miljøet. Porten holder KONTROLLENE uendret; bare
 * riggen rundt (browser/page/readFile/writeFile) er byttet ut. Alt som
 * påvirker hva som faktisk måles er kopiert ordrett — cache-busteren,
 * about:blank mellom navigasjonene og målingen på synlig skjerm.
 *
 *   node tools/pw/verifiser-pw.mjs [base-url] [--out fil.json]
 */
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const OUT = outIdx >= 0 ? argv[outIdx + 1] : 'florir-share-verification.json';
const posisjonelle = argv.filter((a, i) => a !== '--out' && i !== outIdx + 1);
const BASE = posisjonelle[0] || 'http://127.0.0.1:8901/index.html';

let _v = 0;
const url = (hash = '') => `${BASE}?v=${++_v}${hash}`;
const BREDDE = 393;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: BREDDE, height: 852 } });
const page = await context.newPage();

const konsollfeil = [];
page.on('console', m => { if (m.type() === 'error') konsollfeil.push(m.text()); });
page.on('pageerror', e => konsollfeil.push('pageerror: ' + e.message));

await page.goto(url(), { waitUntil: 'load' });

const funn = [];
const legg = (alvor, hva) => funn.push(`${alvor} ${hva}`);

// 1 · Alle skjermer nåbare, målt mens de faktisk er synlige
const NYTTELAST = { oppskrift: 'r-01', notat: 'n-01' };

const DOM_SKJERMER = await page.evaluate(() =>
  [...document.querySelectorAll('.screen')].map(s => s.id.replace(/^s-/, '')));
const ONBOARDING_RUTER = [
  'onboarding-navn','onboarding-hverdag','onboarding-mal','onboarding-interesser',
  'onboarding-preferanser','onboarding-hensyn','onboarding-barrierer',
  'onboarding-laeringsform','onboarding-tid','onboarding-generering','onboarding-klar'
];
const SKJERMER = [...DOM_SKJERMER.filter(n => n !== 'onboarding-steg'), ...ONBOARDING_RUTER];

const rapport = [];
for (const navn of SKJERMER) {
  const id = NYTTELAST[navn];
  await page.goto('about:blank');
  await page.goto(url('#/' + navn + (id ? '/' + id : '')), { waitUntil: 'load' });
  await page.waitForTimeout(120);

  const landet = await page.evaluate(() => {
    const v = [...document.querySelectorAll('.screen')].filter(s => !s.hidden);
    return v.length === 1 ? v[0].id.replace(/^s-/, '') : null;
  });
  const forventet = navn.startsWith('onboarding-') ? 'onboarding-steg' : navn;
  if (landet !== forventet) {
    legg('✗', `${navn}: deeplink landet på «${landet}»`);
    continue;
  }

  const r = await page.evaluate(() => {
    const synlige = [...document.querySelectorAll('.screen')].filter(s => !s.hidden);
    if (synlige.length !== 1) return { feil: `${synlige.length} skjermer synlige samtidig` };
    const s = synlige[0];

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

// 2 · Ark — Escape lukker, fokus tilbake til kilden
await page.goto('about:blank'); await page.goto(url('#/oppskrifter'), { waitUntil: 'load' });
await page.waitForTimeout(150);
const ark = await page.evaluate(async () => {
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

// 3 · Ett klikk fyrer én gang
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
  const r = document.querySelector('#s-oppskrifter [data-go="oppskrift"]');
  if (!r) return { hopp: true };
  r.click();
  return new Promise(res => setTimeout(() => {
    const l = document.querySelector('#s-oppskrift [data-slot="lagre"]');
    if (!l) return res({ hopp: true });
    const for_ = l.getAttribute('aria-pressed');
    l.click();
    setTimeout(() => res({ for: for_, etter: l.getAttribute('aria-pressed') }), 80);
  }, 120));
});
if (!dobbeltfyr.hopp && dobbeltfyr.for === dobbeltfyr.etter) {
  legg('✗', `dobbeltfyring: lagre gikk ${dobbeltfyr.for} → ${dobbeltfyr.etter} (skulle vekslet)`);
}

// 4 · 200 % tekst
const FANER = ['hjem', 'oppskrifter', 'moduler', 'meg'];
for (const fane of FANER) {
  await page.goto('about:blank');
  await page.goto(url('#/' + fane), { waitUntil: 'load' });
  await page.waitForTimeout(120);

  const stor = await page.evaluate(() => {
    const rot = document.documentElement;
    const cs = getComputedStyle(rot);
    for (const n of ['--fs-screen-title','--fs-section-title','--fs-card-title',
                     '--fs-cta','--fs-body','--fs-small','--fs-meta']) {
      const v = parseFloat(cs.getPropertyValue(n));
      if (v) rot.style.setProperty(n, (v * 2) + 'px');
    }
    return new Promise(res => setTimeout(() => {
      const skjerm = document.querySelector('.screen:not([hidden])');
      const dock = skjerm ? skjerm.querySelector('.dock') : null;
      const d = dock ? dock.getBoundingClientRect() : null;
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

// 4b · Duplikate id-er i DOM
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

// 5 · Gamle deeplinker
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
// 6 · Sticky flater skal ikke dekke innhold  [TILLEGG — ikke i originalen]
// ---------------------------------------------------------------------------
// Originalen måler at flater finnes, har høyde og er >= 48px. Den måler ikke
// om to flater ligger OPPÅ hverandre, og derfor passerte den mens
// .recipe-tabs (position:sticky, top:0) la seg over ingrediensrader,
// kommentarer og — verst — primærknappen «Legg i matplanen».
//
// Kontrollen er lagt til her, ikke i originalen, fordi den fant en feil som
// allerede fantes. Baselinen STRYKER på den. Det er hele poenget: uten en
// kontroll som feiler før endringen, kan ingen etterpå vise at den er rettet.
for (const [rute, id] of [['oppskrift', 'r-01']]) {
  await page.goto('about:blank');
  await page.goto(url(`#/${rute}/${id}`), { waitUntil: 'load' });
  await page.waitForTimeout(200);

  const hoyde = await page.evaluate(() =>
    document.querySelector('.screen:not([hidden]) .scroll').scrollHeight);

  const sett = new Set();
  for (const t of [0, 400, 900, 1400, 1900, Math.max(0, hoyde - 852)]) {
    const dekket = await page.evaluate(async pos => {
      const sc = document.querySelector('.screen:not([hidden]) .scroll');
      sc.scrollTop = pos;
      await new Promise(r => setTimeout(r, 180));

      const faste = [...sc.querySelectorAll('*')]
        .filter(e => getComputedStyle(e).position === 'sticky');
      const ut = [];
      for (const f of faste) {
        const fb = f.getBoundingClientRect();
        if (fb.height < 1) continue;
        for (const e of sc.querySelectorAll('*')) {
          if (f.contains(e) || e.contains(f)) continue;
          const egen = [...e.childNodes]
            .some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
          if (!egen) continue;
          const b = e.getBoundingClientRect();
          const v = Math.min(b.bottom, fb.bottom) - Math.max(b.top, fb.top);
          const h = Math.min(b.right, fb.right) - Math.max(b.left, fb.left);
          if (v > 2 && h > 2) ut.push(e.textContent.trim().slice(0, 30));
        }
      }
      return ut;
    }, t);
    for (const d of dekket) sett.add(d);
  }
  for (const d of sett) legg('✗', `${rute}: sticky flate dekker «${d}»`);
}

console.log('\n  SKJERMER');
for (const l of rapport) console.log('    ' + l);

console.log('\n  KONSOLLFEIL: ' + (konsollfeil.length ? konsollfeil.join(' | ') : 'ingen'));
if (konsollfeil.length) legg('✗', `${konsollfeil.length} konsollfeil`);

console.log('\n  FUNN');
if (!funn.length) console.log('    ingen — alt passerer');
else for (const f of funn) console.log('    ' + f);
console.log(`\n  ${funn.filter(f => f.startsWith('✗')).length} feil, ` +
            `${funn.filter(f => f.startsWith('~')).length} merknader.\n`);

await writeFile(OUT, JSON.stringify({
  base: BASE,
  rapport,
  konsollfeil,
  funn,
  feil: funn.filter(f => f.startsWith('✗')).length,
  merknader: funn.filter(f => f.startsWith('~')).length,
}, null, 2));

await browser.close();
