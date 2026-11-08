"""Oculta los proyectos de ejemplo y muestra mensajes de espera.

Guarda este archivo en la raíz de wenrui-portfolio y ejecútalo con:
    py prepare_empty_portfolio.py
"""

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parent
changes = {}


def replace_once(path, old, new):
    text = changes.get(path, path.read_text(encoding="utf-8"))
    if new in text:
        return
    if text.count(old) != 1:
        raise RuntimeError(
            f"No encuentro el fragmento esperado en {path.relative_to(ROOT)}"
        )
    changes[path] = text.replace(old, new, 1)


for slug in ("adi", "testing-adi"):
    path = ROOT / "content" / "projects" / f"{slug}.md"
    text = path.read_text(encoding="utf-8")

    if not text.startswith("---\n") or "\n---\n" not in text[4:]:
        raise RuntimeError(f"Front Matter incorrecto en {path.relative_to(ROOT)}")

    header, body = text[4:].split("\n---\n", 1)

    for field in ("published", "featured"):
        header, count = re.subn(
            rf"(?m)^{field}: true$",
            f"{field}: false",
            header,
            count=1,
        )
        if count == 0 and not re.search(
            rf"(?m)^{field}: false$", header
        ):
            raise RuntimeError(
                f"Falta {field} en {path.relative_to(ROOT)}"
            )

    changes[path] = "---\n" + header + "\n---\n" + body


carousel = ROOT / "src" / "components" / "FeaturedCarousel.jsx"
replace_once(
    carousel,
    '  return <div className="v-featured-carousel">',
    '  if (!projects.length) return <div className="v-featured-carousel"><div className="v-empty-state" role="status"><p>{t.work.pending}</p></div></div>;\n\n'
    '  return <div className="v-featured-carousel">',
)

work = ROOT / "src" / "pages" / "Work.jsx"
replace_once(
    work,
    '<p className="v-result-count" aria-live="polite">{visible.length} {visible.length===1?t.work.oneProject:t.work.manyProjects}</p>',
    '{projects.length>0&&<p className="v-result-count" aria-live="polite">{visible.length} {visible.length===1?t.work.oneProject:t.work.manyProjects}</p>}',
)
replace_once(
    work,
    '<p>{t.work.none}</p><button type="button" onClick={()=>{setCategory(\'all\');setTechnology(\'\')}}>{t.work.showAll}</button>',
    '<p>{projects.length?t.work.none:t.work.pending}</p>{projects.length>0&&<button type="button" onClick={()=>{setCategory(\'all\');setTechnology(\'\')}}>{t.work.showAll}</button>}',
)

translations = ROOT / "content" / "ui.json"
replace_once(
    translations,
    '"none":"There are no published projects for this combination yet."',
    '"pending":"New projects are taking shape. Check back soon.","none":"There are no published projects for this combination yet."',
)
replace_once(
    translations,
    '"none":"Todavía no hay proyectos publicados para esta combinación."',
    '"pending":"Estoy preparando nuevos proyectos. Vuelve pronto.","none":"Todavía no hay proyectos publicados para esta combinación."',
)

# Comprueba todos los cambios antes de escribir los archivos.
for path, content in changes.items():
    path.write_text(content, encoding="utf-8")

print("Listo: los ejemplos se conservan en content/projects/, pero están ocultos.")
print("Featured Work y Work mostrarán un mensaje hasta que añadas proyectos.")