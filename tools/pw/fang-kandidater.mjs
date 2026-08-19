/**
 * Renderer designkandidater til PNG i ekte mobilviewport.
 *
 * Hver kandidatskjerm er en frittstående HTML-fil under
 * design-lab/run-001/kandidater/<ID>/<skjerm>.html. Den rendres på nøyaktig
 * samme måte som baselinen — 393×852, deviceScaleFactor 2 — slik at Fase 4
 * sammenligner piksler mot piksler og ikke beskrivelse mot beskrivelse.
 *
 * Måler samtidig det Fase 0 satte som mål å slå: grønnandel, distinkte
 * radier, svakeste tekstkontrast og død luft. Tallene skrives til
 * maal.json ved siden av bildene, slik at evaluatoren kan se dem uten å
 * stole på kandidatens egen beskrivelse.
 *
 *   node tools/pw/fang-kandidater.mjs [rot]
 */
import { chromium } from 'playwright';
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';

const ROT = process.argv[2] || 'design-lab/run-001/kandidater';

const lum = ([r, g, b]) => {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const kontrast = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const tall = s => (s.match(/[\d.]+/g) || []).map(Number);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 393, height: 852 },
                                           deviceScaleFactor: 2 });
const page = await context.newPage();

const kandidater = (await readdir(ROT, { withFileTypes: true }))
  .filter(d => d.isDirectory()).map(d => d.name).sort();

const alt = {};
for (const kid of kandidater) {
  const dir = join(ROT, kid);
  const filer = (await readdir(dir)).filter(f => f.endsWith('.html')).sort();
  await mkdir(join(dir, 'png'), { recursive: true });
  alt[kid] = {};

  for (const fil of filer) {
    const navn = basename(fil, '.html');
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('about:blank');
    await page.goto('file://' + join(process.cwd(), dir, fil), { waitUntil: 'load' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(dir, 'png', `${navn}-viewport.png`) });

    const m = await page.evaluate(() => {
      const sc = document.querySelector('.scroll') || document.body;
      const synlig = [...document.querySelectorAll('body *')].filter(e => {
        const b = e.getBoundingClientRect();
        return b.width >= 20 && b.height >= 20 && b.top < 852 && b.bottom > 0;
      });

      // Grønnandel: flater med egen bakgrunn der G dominerer.
      let gronn = 0, flater = 0;
      for (const e of synlig) {
        const bg = getComputedStyle(e).backgroundColor;
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
        flater++;
        const [r, g, b] = (bg.match(/\d+/g) || []).map(Number);
        if (g > r && g >= b) gronn++;
      }

      // Distinkte radier på flater ≥ 24px.
      const rad = {};
      for (const e of synlig) {
        const b = e.getBoundingClientRect();
        if (b.width < 24 || b.height < 24) continue;
        const q = getComputedStyle(e).borderTopLeftRadius;
        if (q && q !== '0px') rad[q] = (rad[q] || 0) + 1;
      }

      // Tekst mot sin nærmeste malte bakgrunn.
      const bakgrunn = el => {
        for (let n = el; n; n = n.parentElement) {
          const bg = getComputedStyle(n).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        }
        return getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)';
      };
      const tekst = [];
      for (const e of document.querySelectorAll('body *')) {
        const egen = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
        if (!egen) continue;
        const b = e.getBoundingClientRect();
        if (b.height < 6 || b.top > 852) continue;
        const cs = getComputedStyle(e);
        tekst.push({ txt: e.textContent.trim().slice(0, 26), fg: cs.color, bg: bakgrunn(e),
                     px: parseFloat(cs.fontSize), vekt: cs.fontWeight });
      }

      // Trykkflater under 48px.
      const smaa = [...document.querySelectorAll('button, a[href], input, select, [role="button"]')]
        .filter(e => e.offsetParent !== null)
        .map(e => { const b = e.getBoundingClientRect();
                    return { txt: (e.textContent || e.getAttribute('aria-label') || '?').trim().slice(0, 24),
                             w: Math.round(b.width), h: Math.round(b.height) }; })
        .filter(x => (x.h > 0 && x.h < 47.5) || (x.w > 0 && x.w < 47.5));

      // Skriftfamilier i faktisk bruk.
      //
      // Bare elementer som SELV tegner tekst teller. Uten filteret arvet
      // <img> og <svg> sin computed fontFamily og la «Arial» i settet på
      // hver skjerm med bilder — en målefeil som ville fått hver kandidat
      // til å se ut som den brukte tre snitt i stedet for to.
      const fam = new Set();
      for (const e of synlig) {
        if (/^(IMG|SVG|PATH|CIRCLE|RECT|BR|HR|INPUT)$/.test(e.tagName)) continue;
        const egen = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
        if (!egen) continue;
        fam.add(getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim());
      }

      let bunn = 0;
      for (const e of sc.children) { const b = e.getBoundingClientRect(); if (b.height > 0) bunn = Math.max(bunn, b.bottom); }

      return { flater, gronn, rad, tekst, smaa, familier: [...fam].filter(Boolean),
               scrollH: sc.scrollHeight, klientH: Math.round(sc.getBoundingClientRect().height),
               innholdBunn: Math.round(bunn),
               hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth };
    });

    const kontraster = m.tekst.map(t => {
      const stor = t.px >= 24 || (t.px >= 18.66 && Number(t.vekt) >= 700);
      return { ...t, ratio: +kontrast(tall(t.fg), tall(t.bg)).toFixed(2), krav: stor ? 3 : 4.5 };
    });
    const brudd = kontraster.filter(k => k.ratio < k.krav);

    alt[kid][navn] = {
      gronnandel: m.flater ? Math.round(100 * m.gronn / m.flater) : 0,
      flater: m.flater,
      radier: m.rad,
      distinkteRadier: Object.keys(m.rad).length,
      skriftfamilier: m.familier,
      svakesteKontrast: kontraster.length ? Math.min(...kontraster.map(k => k.ratio)) : null,
      kontrastbrudd: brudd.map(k => `«${k.txt}» ${k.ratio}:1 (krav ${k.krav})`),
      smaaTrykkflater: m.smaa.map(s => `«${s.txt}» ${s.w}×${s.h}`),
      doedLuft: m.scrollH <= m.klientH + 2 ? Math.max(0, m.klientH - m.innholdBunn) : 0,
      ruller: m.scrollH > m.klientH + 2,
      hScroll: m.hScroll,
    };

    // Full høyde der skjermen ruller.
    if (m.scrollH > m.klientH + 2) {
      await page.setViewportSize({ width: 393, height: Math.min(m.scrollH + 8, 6000) });
      await page.waitForTimeout(300);
      await page.screenshot({ path: join(dir, 'png', `${navn}-full.png`) });
    }

    const a = alt[kid][navn];
    console.log(`${kid}/${navn.padEnd(12)} grønn:${String(a.gronnandel).padStart(3)}% ` +
                `radier:${a.distinkteRadier} skrift:${a.skriftfamilier.length} ` +
                `min-kontrast:${a.svakesteKontrast} brudd:${a.kontrastbrudd.length} ` +
                `små:${a.smaaTrykkflater.length} død-luft:${a.doedLuft}px` +
                (a.hScroll ? ' ⚠H-SCROLL' : ''));
  }
}

await writeFile(join(ROT, 'maal.json'), JSON.stringify(alt, null, 2));
await browser.close();
