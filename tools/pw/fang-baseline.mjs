/**
 * Fanger pilotskjermene i to former:
 *   -viewport.png  393×852, det brukeren faktisk ser først
 *   -full.png      hele rullehøyden, ved å vokse viewporten til innholdet
 *
 * Full høyde kan ikke tas med fullPage: innholdet ruller i .scroll inne i
 * .device, ikke i dokumentet. fullPage ville gitt nøyaktig samme 852px.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] || 'http://127.0.0.1:8901/index.html';
const UT = process.argv[3] || 'design-lab/run-001/baseline-screens';

const SKJERMER = [
  ['P1', 'hjem',              '#/hjem'],
  ['P2', 'moduler',           '#/moduler'],
  ['P3', 'oppskriftsliste',   '#/oppskriftsliste'],
  ['P4', 'oppskrift-r-01',    '#/oppskrift/r-01'],
  ['P5', 'onboarding-mal',    '#/onboarding-mal'],
  ['D1', 'design-fonter',     '#/design-fonter'],
  ['D2', 'design-komponenter','#/design-komponenter'],
  ['D3', 'design-fargepalett','#/design-fargepalett'],
];

await mkdir(UT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 393, height: 852 },
                                           deviceScaleFactor: 2 });
const page = await context.newPage();
let v = 0;

for (const [id, navn, hash] of SKJERMER) {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto('about:blank');
  await page.goto(`${BASE}?v=${++v}${hash}`, { waitUntil: 'load' });
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${UT}/${id}-${navn}-viewport.png` });

  // Vokse viewporten til hele rullehøyden. .device arver 100dvh, så .scroll
  // slutter å rulle når viewporten er høy nok, og alt tegnes i ett bilde.
  const mal = await page.evaluate(() => {
    const sc = document.querySelector('.screen:not([hidden]) .scroll');
    const dock = document.querySelector('.screen:not([hidden]) .dock');
    if (!sc) return null;
    return Math.ceil(sc.scrollHeight + (dock ? dock.getBoundingClientRect().height : 0) + 4);
  });
  const full = Math.min(Math.max(mal || 852, 852), 6000);
  if (full > 860) {
    await page.setViewportSize({ width: 393, height: full });
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `${UT}/${id}-${navn}-full.png` });
  console.log(`${id}\t${navn}\tviewport 393×852\tfull 393×${full}`);
}

await browser.close();
