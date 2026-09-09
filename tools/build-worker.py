"""Bundle the existing static app with a small authenticated D1 persistence API."""
from pathlib import Path
import base64, json, mimetypes, shutil

root = Path(__file__).resolve().parent.parent
out = root / 'dist'
if out.exists(): shutil.rmtree(out)
(out / 'server').mkdir(parents=True)
(out / '.openai').mkdir()
manifest = json.loads((root / '.openai/hosting.json').read_text())
manifest.pop('static', None)
manifest['d1'] = 'DB'
assets = {}
files = [root / 'index.html', root / 'robots.txt', root / 'manifest.webmanifest', root / 'review/index.html', root / 'design/login-membership.webp']
files += [p for p in (root / 'assets').rglob('*') if p.is_file() and p.suffix.lower() in {'.js', '.css', '.webp', '.jpg', '.jpeg', '.png', '.svg', '.woff2'}]
files += list((root / 'design/approved-v3').glob('*.webp'))
for p in files:
    if not p.exists(): continue
    mime = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    if p.suffix == '.js': mime = 'text/javascript'
    if p.suffix == '.webmanifest': mime = 'application/manifest+json'
    assets['/' + p.relative_to(root).as_posix()] = [mime, base64.b64encode(p.read_bytes()).decode()]
bundle = 'const ASSETS = ' + json.dumps(assets, separators=(',', ':')) + ';\n' + (root / 'worker/index.js').read_text()
(out / 'server/index.js').write_text(bundle)
(out / '.openai/hosting.json').write_text(json.dumps(manifest, indent=2) + '\n')
if (root / 'drizzle').exists(): shutil.copytree(root / 'drizzle', out / '.openai/drizzle')
print(f'Bundled {len(assets)} assets and authenticated progress API ({len(bundle):,} bytes).')
