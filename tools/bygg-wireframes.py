#!/usr/bin/env python3
"""
Setter sammen wireframe-arket fra rammene design/fang-rammer.js har fanget.

    dev-browser --browser florir run design/fang-rammer.js
    python3 design/bygg-wireframes.py

Hensikten er å kunne peke på ÉN flate. Hver ramme har en stabil ID (F01, F02,
…) som brukes i tilbakemeldinger, så «F17, stjernene er for store» er entydig.

Arket bruker med vilje IKKE Florirs palett. En kjølig, nesten-svart grunn gjør
to ting: kremskjermene leser tydelig mot den, og man kan ikke forveksle arkets
rammeverk med appen det viser.
"""

import base64
import html
import json
import pathlib

TMP = pathlib.Path.home() / '.dev-browser' / 'tmp'
UT = pathlib.Path(__file__).parent.parent / 'review' / 'wireframes.html'

# Grupperingen følger brukerens vei gjennom appen, ikke filrekkefølgen.
GRUPPER = [
    ('Kom i gang',      ['F01']),
    ('Hjem og moduler', ['F02', 'F04', 'F05', 'F06']),
    ('Mat',             ['F07', 'F08', 'F09']),
    ('Finne noe',       ['F10', 'F11', 'F12', 'F13']),
    ('Én oppskrift',    ['F14', 'F15', 'F16', 'F17', 'F18', 'F19']),
    ('Måltidsplan',     ['F20', 'F21', 'F22', 'F23', 'F24']),
    ('Meg',             ['F25', 'F26', 'F29', 'F30', 'F31', 'F32']),
    ('Hjelp',           ['F27', 'F28']),
    ('Profil',          ['F33', 'F34', 'F35', 'F36']),
]

rammer = json.loads((UT.parent / 'frames.json').read_text(encoding='utf-8'))
etter_id = {r['id']: r for r in rammer}
sum_b = 0


def kort(r):
    global sum_b
    b = (TMP / f"florir-{r['id']}.jpg").read_bytes()
    sum_b += len(b)
    b64 = base64.b64encode(b).decode()
    note = f'<p class="note">{html.escape(r["note"])}</p>' if r.get('note') else ''
    return f'''<figure class="ramme" id="{r['id']}">
  <figcaption>
    <a class="id" href="#{r['id']}">{r['id']}</a>
    <span class="navn">{html.escape(r['navn'])}</span>
    <code>{html.escape(r['hash'].replace('#/', ''))}</code>
  </figcaption>
  <img src="data:image/jpeg;base64,{b64}" alt="{html.escape(r['navn'])}"
       width="393" height="852" loading="lazy">
  {note}
</figure>'''


seksjoner, toc = [], []
for tittel, ids in GRUPPER:
    ids = [i for i in ids if i in etter_id]
    if not ids:
        continue
    anker = (tittel.lower().replace(' ', '-')
             .replace('é', 'e').replace('å', 'a').replace('ø', 'o').replace('æ', 'ae'))
    spenn = ids[0] if len(ids) == 1 else f'{ids[0]}–{ids[-1]}'
    toc.append(f'<a href="#{anker}">{html.escape(tittel)} <span>{spenn}</span></a>')
    seksjoner.append(
        f'<section id="{anker}"><h2>{html.escape(tittel)}</h2>'
        f'<div class="rutenett">{"".join(kort(etter_id[i]) for i in ids)}</div></section>')

doc = f'''<!doctype html>
<meta charset="utf-8">
<title>Florir · wireframes</title>
<style>
:root{{
  color-scheme: light dark;
  --grunn:#12151a; --flate:#1b1f26; --kant:#2b313b;
  --tekst:#e8eaed; --dempet:#98a2b0; --merke:#7dd3a0;
  --mono:ui-monospace,SFMono-Regular,Menlo,monospace;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
}}
@media (prefers-color-scheme: light){{
  :root{{ --grunn:#f4f5f7; --flate:#fff; --kant:#dcdfe4;
          --tekst:#171a1f; --dempet:#5c6572; --merke:#0f7a4a; }}
}}
:root[data-theme="dark"]{{ --grunn:#12151a; --flate:#1b1f26; --kant:#2b313b;
  --tekst:#e8eaed; --dempet:#98a2b0; --merke:#7dd3a0; }}
:root[data-theme="light"]{{ --grunn:#f4f5f7; --flate:#fff; --kant:#dcdfe4;
  --tekst:#171a1f; --dempet:#5c6572; --merke:#0f7a4a; }}

*{{box-sizing:border-box}}
body{{margin:0;background:var(--grunn);color:var(--tekst);font-family:var(--sans);
  line-height:1.5;-webkit-font-smoothing:antialiased}}
.inn{{max-width:1300px;margin:0 auto;padding:40px 20px 80px}}

header{{border-bottom:1px solid var(--kant);padding-bottom:28px;margin-bottom:32px}}
h1{{font-size:26px;font-weight:600;letter-spacing:-.02em;margin:0 0 8px}}
.undertekst{{color:var(--dempet);font-size:15px;margin:0;max-width:64ch}}
.undertekst strong{{color:var(--tekst);font-weight:600}}
kbd{{font-family:var(--mono);font-size:12px;background:var(--flate);
  border:1px solid var(--kant);border-radius:5px;padding:1px 5px;color:var(--merke)}}

nav{{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}}
nav a{{display:inline-flex;align-items:center;gap:7px;text-decoration:none;
  color:var(--tekst);background:var(--flate);border:1px solid var(--kant);
  border-radius:7px;padding:7px 11px;font-size:13px}}
nav a span{{font-family:var(--mono);font-size:11px;color:var(--dempet);
  font-variant-numeric:tabular-nums}}
nav a:hover{{border-color:var(--merke)}}
nav a:focus-visible{{outline:2px solid var(--merke);outline-offset:2px}}

section{{margin:0 0 44px;scroll-margin-top:20px}}
h2{{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.09em;
  color:var(--dempet);margin:0 0 16px;padding-bottom:9px;
  border-bottom:1px solid var(--kant)}}

/* Faste kolonnetall, ikke auto-fill. Med auto-fill ble rammene 265px brede fra
   en 393px kilde — nedskalert nok til at 13px metatekst ble uleselig, og da kan
   man ikke peke på det man ser. .ramme er kappet på 393 så bildet aldri
   skaleres OPP, som er verre enn 1:1. */
.rutenett{{display:grid;gap:24px;grid-template-columns:1fr;justify-content:start}}
@media (min-width:700px){{ .rutenett{{grid-template-columns:repeat(2,minmax(0,1fr))}} }}
@media (min-width:1120px){{ .rutenett{{grid-template-columns:repeat(3,minmax(0,1fr))}} }}

.ramme{{margin:0;max-width:393px;background:var(--flate);
  border:1px solid var(--kant);border-radius:10px;overflow:hidden;
  scroll-margin-top:20px}}
.ramme:target{{border-color:var(--merke);box-shadow:0 0 0 2px var(--merke)}}
figcaption{{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;
  padding:11px 13px;border-bottom:1px solid var(--kant)}}
.id{{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--merke);
  font-variant-numeric:tabular-nums;text-decoration:none}}
.id:hover{{text-decoration:underline}}
.id:focus-visible{{outline:2px solid var(--merke);outline-offset:2px}}
.navn{{font-size:13.5px;font-weight:500;flex:1;min-width:0}}
figcaption code{{font-family:var(--mono);font-size:10.5px;color:var(--dempet)}}
.ramme img{{display:block;width:100%;height:auto}}
.note{{margin:0;padding:9px 13px;font-size:12px;color:var(--dempet);
  border-top:1px solid var(--kant)}}
</style>

<div class="inn">
<header>
  <h1>Florir · alle skjermer</h1>
  <p class="undertekst">{len(rammer)} rammer, fanget i mobilviewport 393×852. Hver
  ramme har en <strong>ID</strong> — skriv <kbd>F17</kbd> når du gir
  tilbakemelding, så vet jeg presis hvilken flate du mener. Trykk en ID for å
  lenke rett til rammen. Noen skjermer står i flere rammer fordi de er lengre
  enn én skjermhøyde.</p>
  <nav>{''.join(toc)}</nav>
</header>
{''.join(seksjoner)}
</div>
'''

UT.write_text(doc, encoding='utf-8')
print(f'{len(rammer)} rammer · bilder {sum_b / 1024 / 1024:.2f} MB '
      f'· dokument {len(doc) / 1024 / 1024:.2f} MB')
print(UT)
