"""Prepare the same static prototype for Sites without changing the GitHub Pages entry."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
out = root / 'dist'
out.mkdir(exist_ok=True)
for name in ('assets', 'design'):
    shutil.copytree(root / name, out / name, dirs_exist_ok=True)
(out / 'review').mkdir(exist_ok=True)
shutil.copy2(root / 'review/index.html', out / 'review/index.html')
for name in ('index.html', 'robots.txt', '.nojekyll'):
    shutil.copy2(root / name, out / name)
print('Static prototype prepared in dist/.')
