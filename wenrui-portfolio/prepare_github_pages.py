"""Prepare this React/Vite portfolio for GitHub Pages. Run once from the repo root."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if not (ROOT / "vite.config.js").is_file():
    raise SystemExit("Guarda este archivo en la raíz del portfolio, junto a vite.config.js.")


def update(filename, replacements):
    file = ROOT / filename
    source = file.read_text(encoding="utf-8")
    result = source
    for old, new in replacements:
        if "import {publicAsset}" in new and "import {publicAsset} from" in result:
            continue
        if new in result:
            continue
        if old not in result:
            raise SystemExit(f"No encuentro el fragmento esperado en {filename}: {old[:60]}")
        result = result.replace(old, new)
    if result != source:
        file.write_text(result, encoding="utf-8")
        print(f"Actualizado: {filename}")


asset_helper = ROOT / "src/data/publicAsset.js"
if not asset_helper.exists():
    asset_helper.write_text(
        "// Prefix URLs from public/ with the Vite deployment base.\n"
        "export function publicAsset(path) {\n"
        "  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;\n"
        "  return `${import.meta.env.BASE_URL}${path.slice(1)}`;\n"
        "}\n",
        encoding="utf-8",
    )
    print("Creado: src/data/publicAsset.js")

update("src/PortfolioApp.jsx", [
    ("<BrowserRouter>", "<BrowserRouter basename={import.meta.env.BASE_URL}>"),
])
update("src/InteractivePortrait.jsx", [
    ("import {useLocale} from './locale';", "import {useLocale} from './locale';\nimport {publicAsset} from './data/publicAsset';"),
    ("image.src = '/images/hero-wenrui-studio.png';", "image.src = publicAsset('/images/hero-wenrui-studio.png');"),
    ("irisAtlas.src = '/images/wenrui-irises-atlas.png';", "irisAtlas.src = publicAsset('/images/wenrui-irises-atlas.png');"),
])
update("src/components/ProjectCard.jsx", [
    ("import {useLocale} from '../locale';", "import {useLocale} from '../locale';\nimport {publicAsset} from '../data/publicAsset';"),
    ("<img src={image} alt=", "<img src={publicAsset(image)} alt="),
    ("src={project.previewVideo}", "src={publicAsset(project.previewVideo)}"),
    ("src={`/icons/${technologyIcons[tech]}.svg`}", "src={publicAsset(`/icons/${technologyIcons[tech]}.svg`)}"),
])
update("src/components/About.jsx", [
    ("import {useLocale} from '../locale';", "import {useLocale} from '../locale';\nimport {publicAsset} from '../data/publicAsset';"),
    ('src="/images/wenrui-about-selfie.png"', "src={publicAsset('/images/wenrui-about-selfie.png')}"),
    ("src={item.image}", "src={publicAsset(item.image)}"),
    ("src={`/icons/${technologyIcons[item]}.svg`}", "src={publicAsset(`/icons/${technologyIcons[item]}.svg`)}"),
])
update("src/layouts/SiteLayout.jsx", [
    ("import {useLocale} from '../locale';", "import {useLocale} from '../locale';\nimport {publicAsset} from '../data/publicAsset';"),
    ('src="/images/wenrui-bunny-logo.png"', "src={publicAsset('/images/wenrui-bunny-logo.png')}"),
    ("href={resume.path}", "href={publicAsset(resume.path)}"),
])
for filename in ("src/pages/Home.jsx", "src/pages/Work.jsx"):
    update(filename, [
        ("import {useLocale} from '../locale';", "import {useLocale} from '../locale';\nimport {publicAsset} from '../data/publicAsset';"),
        ("src={`/icons/${technologyIcons[name]}.svg`}", "src={publicAsset(`/icons/${technologyIcons[name]}.svg`)}"),
    ])
update("src/pages/CaseStudy.jsx", [
    ("import {useLocale} from '../locale';", "import {useLocale} from '../locale';\nimport {publicAsset} from '../data/publicAsset';"),
    ("src={item.src}", "src={publicAsset(item.src)}"),
    ("src={`/icons/${technologyIcons[name]}.svg`}", "src={publicAsset(`/icons/${technologyIcons[name]}.svg`)}"),
])

workflow = ROOT / ".github/workflows/pages.yml"
if not workflow.exists():
    workflow.parent.mkdir(parents=True, exist_ok=True)
    workflow.write_text("""name: Publish portfolio to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: github-pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Build for this repository's Pages URL
        run: |
          repo_name="${GITHUB_REPOSITORY#*/}"
          owner_name="${GITHUB_REPOSITORY%%/*}"
          if [ "$repo_name" = "$owner_name.github.io" ]; then
            base_path="/"
          else
            base_path="/$repo_name/"
          fi
          npm run build -- --base="$base_path"
          cp dist/index.html dist/404.html
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Upload site
        uses: actions/upload-pages-artifact@v4
        with:
          path: dist
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
""", encoding="utf-8")
    print("Creado: .github/workflows/pages.yml")

print("Listo. Comprueba con: npm.cmd run build")
