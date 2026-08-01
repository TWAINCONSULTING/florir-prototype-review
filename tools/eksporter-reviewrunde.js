/** Eksporterer nye reviewflater for onboarding og designsystem. */
const BASE = 'http://127.0.0.1:8902/index.html';
const page = await browser.getPage('main');
await page.setViewportSize({ width: 393, height: 852 });

const SKJERMER = [
  ['OB01','Navn','onboarding-navn'],
  ['OB02','Hverdagskontekst','onboarding-hverdag'],
  ['OB03','Mål','onboarding-mal'],
  ['OB07','Barrierer','onboarding-barrierer'],
  ['OB10','Planen settes sammen','onboarding-generering'],
  ['OB11','Planen er klar','onboarding-klar'],
  ['DS01','Fonter','design-fonter'],
  ['DS02','Komponenter','design-komponenter'],
  ['DS03','Fargepalett','design-fargepalett'],
];

let v = 0;
for (const [id, navn, route] of SKJERMER) {
  await page.goto('about:blank');
  await page.goto(`${BASE}?v=${++v}#/${route}`, { waitUntil: 'load' });
  await page.waitForTimeout(180);
  const bilde = await page.screenshot({ type: 'png' });
  const fil = `phase-1c-${id}-${route}.png`;
  const sti = await saveScreenshot(bilde, fil);
  console.log(`${id}\t${navn}\t${route}\t${sti}`);
}
