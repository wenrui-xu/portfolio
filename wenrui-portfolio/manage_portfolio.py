#!/usr/bin/env python3
"""Edit the portfolio's content without changing React components.

Run from anywhere with Python 3; only the project form needs the installed
Node dependencies used by the website's Markdown content validator.
"""

import json
import re
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree

from scripts import project_form as form

ROOT = Path(__file__).resolve().parent
SITE_FILE = ROOT / "content" / "site.json"
ICONS_FILE = ROOT / "content" / "technology-icons.json"


def checked_command(*args):
    executable = shutil.which(args[0])
    if executable is None:
        raise ValueError(f"Necesitas {args[0]}. Instala Node.js y ejecuta npm install primero.")
    result = subprocess.run((executable, *args[1:]), cwd=ROOT, text=True,
                            capture_output=True, check=False)
    if result.returncode:
        raise ValueError((result.stdout + result.stderr).strip())


def save_site(data):
    """Validate the new configuration with Vite, restoring it on failure."""
    original = SITE_FILE.read_text(encoding="utf-8")
    SITE_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    try:
        checked_command("npm", "run", "build")
    except Exception:
        SITE_FILE.write_text(original, encoding="utf-8")
        raise
    print("Configuración guardada; la compilación ha terminado correctamente.")


def add_or_edit_project():
    path = form.main(delete_project=delete_project)
    if path is None:
        return False
    data, _ = form.read_file(path)
    icons = json.loads(ICONS_FILE.read_text(encoding="utf-8"))
    unknown = [name for name in data.get("technologies", []) if name not in icons]
    if not unknown:
        return
    print("\nHay tecnologías nuevas. Puedes asignarles un SVG ahora o dejar solo texto.")
    additions, copies = {}, []
    for name in unknown:
        raw = form.text(f"SVG de {name} (ruta local o /icons/archivo.svg; Enter = solo texto)")
        if not raw:
            continue
        if raw.startswith("/icons/"):
            icon = ROOT / "public" / raw.lstrip("/")
            if not icon.is_file() or icon.suffix.lower() != ".svg" or not icon.resolve().is_relative_to((ROOT / "public" / "icons").resolve()):
                raise ValueError(f"No encuentro el SVG de {name} en public/icons/.")
            additions[name] = icon.stem
        else:
            source = Path(raw).expanduser()
            if not source.is_file() or source.suffix.lower() != ".svg":
                raise ValueError(f"No encuentro el SVG de {name}.")
            stem = form.slugify(name)
            if not stem:
                raise ValueError(f"El nombre de {name} necesita un icono con nombre latino.")
            target = ROOT / "public" / "icons" / f"{stem}.svg"
            if target.exists() and target.resolve() != source.resolve():
                raise ValueError(f"Ya existe {target.name}; ponlo en public/icons/ y usa su ruta.")
            additions[name] = stem
            if target.resolve() != source.resolve():
                copies.append((source, target))
        try:
            root_element = ElementTree.parse(icon if raw.startswith("/icons/") else source).getroot()
        except ElementTree.ParseError as error:
            raise ValueError(f"El SVG de {name} no se puede leer: {error}") from error
        if root_element.tag.split("}")[-1] != "svg":
            raise ValueError(f"El archivo de {name} no contiene un SVG.")
    if not additions:
        return
    original = ICONS_FILE.read_text(encoding="utf-8")
    for source, target in copies:
        shutil.copy2(source, target)
    icons.update(additions)
    ICONS_FILE.write_text(json.dumps(icons, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    try:
        checked_command("npm", "run", "build")
    except Exception:
        ICONS_FILE.write_text(original, encoding="utf-8")
        for _, target in copies:
            target.unlink(missing_ok=True)
        raise
    print("Iconos añadidos a las tarjetas y a los filtros técnicos.")


def select_file(paths, label, back_label="menú principal"):
    if not paths:
        print("Todavía no hay entradas para elegir.")
        return None
    form.clear_screen()
    print(f"{label} — elige una opción\n")
    for index, path in enumerate(paths, 1):
        data, _ = form.read_file(path)
        print(f"  {index}) {data.get('title', path.stem)} ({path.stem})"
              f"{' ★' if data.get('featured') else ''}")
    print(f"  0) Volver a {back_label}\n")
    selection = form.answer("Número: ")
    if selection in ("", "0"):
        return None
    if not selection.isdigit() or not 1 <= int(selection) <= len(paths):
        raise ValueError("Elige un número de la lista.")
    return paths[int(selection) - 1]


def delete_project(paths):
    """Delete both translations after explicit confirmation; restore on failure."""
    path = select_file(paths, "ELIMINAR PROYECTO", "proyectos")
    if path is None:
        return False
    data, _ = form.read_file(path)
    title = data.get("title") or path.stem
    spanish_path = ROOT / "content" / "es" / "projects" / path.name
    originals = {item: item.read_bytes() for item in (path, spanish_path) if item.exists()}
    print(f"\nSe eliminarán los archivos EN y ES de «{title}» ({path.stem}).")
    print("Las imágenes, vídeos y el código del proyecto no se borrarán.")
    link = f"/work/{path.stem}"
    references = [other.relative_to(ROOT) for other in (ROOT / "content").rglob("*.md")
                  if other not in originals and link in other.read_text(encoding="utf-8")]
    if references:
        print("\nATENCIÓN: otros contenidos enlazan a este proyecto. Revisa después:")
        for reference in references:
            print(f"  - {reference}")
    if not form.yes_no("¿Seguro que quieres eliminar este proyecto?", False):
        print("Eliminación cancelada.")
        form.pause()
        return False
    if form.answer(f"Escribe exactamente {path.stem} para confirmar: ") != path.stem:
        print("Eliminación cancelada: el identificador no coincide.")
        form.pause()
        return False
    try:
        for item in originals:
            item.unlink()
        checked_command("npm", "run", "content:check")
    except Exception:
        for item, content in originals.items():
            item.write_bytes(content)
        checked_command("npm", "run", "content:check")
        raise
    print(f"Proyecto «{title}» eliminado. Puedes recuperarlo desde el historial de Git si lo necesitas.")
    return True


def set_frontmatter_value(text, key, value):
    """Change one scalar line, leaving the case study and other fields intact."""
    match = re.match(r"\A---\r?\n(.*?)\r?\n---\r?\n", text, re.S)
    if not match:
        raise ValueError("El proyecto no tiene Front Matter válido.")
    header = match.group(1)
    line = f"{key}: {json.dumps(value, ensure_ascii=False)}"
    pattern = rf"(?m)^{re.escape(key)}:.*$"
    if re.search(pattern, header):
        header = re.sub(pattern, lambda _: line, header, count=1)
    else:
        header += "\n" + line
    return "---\n" + header + "\n---\n" + text[match.end():]


def feature_project():
    paths = sorted((ROOT / "content" / "projects").glob("*.md"))
    path = select_file(paths, "Proyectos")
    if path is None:
        return False
    data, _ = form.read_file(path)
    if not data.get("published"):
        raise ValueError("Primero publica el proyecto desde la opción 1; los borradores no se destacan.")
    enabled = form.yes_no("¿Destacar en Home y Work?", bool(data.get("featured")))
    order = form.number("Posición entre los destacados (1 = primero)",
                        int(data.get("featuredOrder", data.get("order", 1)))) if enabled else None
    if enabled and order < 1:
        raise ValueError("La posición debe ser 1 o mayor.")
    original = path.read_text(encoding="utf-8")
    updated = set_frontmatter_value(original, "featured", enabled)
    if enabled:
        updated = set_frontmatter_value(updated, "featuredOrder", order)
    if updated == original:
        print("No hay cambios.")
        return
    if not form.yes_no("¿Guardar el cambio?"):
        return
    path.write_text(updated, encoding="utf-8")
    try:
        checked_command("npm", "run", "content:check")
    except Exception:
        path.write_text(original, encoding="utf-8")
        raise
    print("Destacados actualizados. Las dos galerías usan el mismo orden.")


def unique_slug(kind, title):
    directory = ROOT / "content" / kind
    slug = form.text("Slug de la URL", form.slugify(title), required=True)
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError("El slug solo admite letras minúsculas, números y guiones.")
    if (directory / f"{slug}.md").exists() or (ROOT / "content" / "es" / kind / f"{slug}.md").exists():
        raise ValueError("Ese slug ya existe. No se ha sobrescrito ningún archivo.")
    return slug


def end_date():
    while True:
        value = form.text("Fecha final para ordenar (AAAA-MM)", required=True)
        try:
            datetime.strptime(value, "%Y-%m")
            if re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", value):
                return value
        except ValueError:
            pass
        print("Escribe una fecha como 2026-10.")


def add_journey():
    kind = form.choice("Tipo de entrada", ("experience", "education"), "experience")
    title = form.text("Empresa o título (EN)", required=True)
    slug = unique_slug(kind, title)
    title_es = form.text("Empresa o título (ES)", title, required=True)
    field = "role" if kind == "experience" else "institution"
    label = "Puesto" if kind == "experience" else "Institución"
    value_en = form.text(f"{label} (EN)", required=True)
    value_es = form.text(f"{label} (ES)", value_en, required=True)
    period_en = form.text("Periodo visible (EN, p. ej. Oct–Dec 2025)", required=True)
    period_es = form.text("Periodo visible (ES, p. ej. Oct–Dic 2025)", required=True)
    timeline_end = end_date()
    detail_en = form.text("Nota breve debajo de la fecha (EN, opcional)")
    detail_es = form.text("Nota breve debajo de la fecha (ES, opcional)")
    body_en = form.lines("Descripción ampliada (EN)")
    body_es = form.lines("Descripción ampliada (ES)")
    publish = form.yes_no("¿Publicar la entrada ahora?")
    if publish and (not body_en or not body_es):
        raise ValueError("Para publicar, escribe la descripción en inglés y español.")
    base = {"type":kind,"title":title,"slug":slug,field:value_en,
            "period":period_en,"dateDetail":detail_en,"timelineEnd":timeline_end,"published":publish}
    localized = {"slug":slug,"title":title_es,field:value_es,
                 "period":period_es,"dateDetail":detail_es}
    if not form.yes_no("¿Guardar en My Journey?"):
        return
    en = ROOT / "content" / kind / f"{slug}.md"
    es = ROOT / "content" / "es" / kind / f"{slug}.md"
    en.parent.mkdir(parents=True, exist_ok=True)
    es.parent.mkdir(parents=True, exist_ok=True)
    form.save(en, es, form.serialize(base, body_en, tuple(base)),
              form.serialize(localized, body_es, tuple(localized)))


def certificate_image(value, slug):
    """Accept a public URL path or a local image to copy into the site."""
    if not value:
        return "", None
    if value.startswith("/images/"):
        target = (ROOT / "public" / value.lstrip("/")).resolve()
        if not target.is_relative_to((ROOT / "public" / "images").resolve()) or not target.is_file():
            raise ValueError("La imagen debe existir dentro de public/images/.")
        return value, None
    source = Path(value).expanduser()
    if not source.is_file() or source.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        raise ValueError("Escribe una ruta de imagen existente (PNG, JPG, WebP o GIF).")
    directory = ROOT / "public" / "images" / "certificates"
    target = directory / f"{slug}{source.suffix.lower()}"
    if target.exists() and source.resolve() != target.resolve():
        raise ValueError(f"La imagen {target.name} ya existe; elige otro slug.")
    return f"/images/certificates/{target.name}", (source, target)


def add_certificate():
    title = form.text("Título del certificado (EN)", required=True)
    slug = unique_slug("certificates", title)
    title_es = form.text("Título del certificado (ES)", title, required=True)
    institution_en = form.text("Institución (EN)", required=True)
    institution_es = form.text("Institución (ES)", institution_en, required=True)
    date_en = form.text("Fecha visible (EN)", required=True)
    date_es = form.text("Fecha visible (ES)", required=True)
    image, copied = certificate_image(form.text("Imagen (ruta local o /images/...; Enter = icono pendiente)"), slug)
    credential = form.text("Enlace verificable de la acreditación (opcional)")
    if credential:
        valid_https(credential)
    publish = form.yes_no("¿Mostrar el certificado ahora?")
    data = {"type":"certificate","title":title,"slug":slug,"institution":institution_en,
            "date":date_en,"image":image,"credential":credential,"published":publish}
    translated = {"slug":slug,"title":title_es,"institution":institution_es,"date":date_es}
    if not form.yes_no("¿Guardar el certificado?"):
        return
    en = ROOT / "content" / "certificates" / f"{slug}.md"
    es = ROOT / "content" / "es" / "certificates" / f"{slug}.md"
    en.parent.mkdir(parents=True, exist_ok=True)
    es.parent.mkdir(parents=True, exist_ok=True)
    if copied:
        copied[1].parent.mkdir(parents=True, exist_ok=True)
        if copied[0].resolve() != copied[1].resolve():
            shutil.copy2(*copied)
    try:
        form.save(en, es, form.serialize(data, "", tuple(data)),
                  form.serialize(translated, "", tuple(translated)))
    except Exception:
        if copied and copied[0].resolve() != copied[1].resolve():
            copied[1].unlink(missing_ok=True)
        raise


def valid_https(url):
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.netloc or any(char.isspace() for char in url):
        raise ValueError("Utiliza un enlace completo que empiece por https://.")


def edit_links():
    site = json.loads(SITE_FILE.read_text(encoding="utf-8"))
    links = site["links"].copy()
    for key, label in (("github", "GitHub"), ("linkedin", "LinkedIn"), ("email", "Correo")):
        links[key] = form.text(label, links[key], required=True)
    for key in ("github", "linkedin"):
        valid_https(links[key])
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", links["email"]):
        raise ValueError("El correo no parece válido.")
    if links == site["links"]:
        print("No hay cambios.")
        return
    if not form.yes_no("¿Actualizar los enlaces del hero, modal y footer?"):
        return
    site["links"] = links
    save_site(site)


def edit_resume():
    site = json.loads(SITE_FILE.read_text(encoding="utf-8"))
    source = Path(form.text("Ruta del nuevo PDF en tu ordenador", required=True)).expanduser()
    if not source.is_file() or source.suffix.lower() != ".pdf":
        raise ValueError("No encuentro ese archivo PDF.")
    with source.open("rb") as stream:
        if stream.read(5) != b"%PDF-":
            raise ValueError("El archivo no parece un PDF válido.")
    directory = ROOT / "public" / "resume"
    directory.mkdir(parents=True, exist_ok=True)
    destination = directory / source.name
    same_file = source.resolve() == destination.resolve()
    if destination.exists() and not same_file:
        for number in range(2, 1000):
            candidate = directory / f"{source.stem}-{number}.pdf"
            if not candidate.exists():
                destination = candidate
                break
        else:
            raise ValueError("Demasiados PDFs con el mismo nombre.")
    print(f"Se descargará como {source.name} desde /resume/{destination.name}.")
    if not form.yes_no("¿Copiar el PDF y actualizar el botón del CV?"):
        return
    if not same_file:
        shutil.copy2(source, destination)
    site["resume"] = {"path":f"/resume/{destination.name}","downloadName":source.name}
    try:
        save_site(site)
    except Exception:
        if not same_file:
            destination.unlink(missing_ok=True)
        raise


def main():
    while True:
        form.clear_screen()
        print("GESTOR DEL PORTFOLIO\n")
        print("1) Añadir o editar proyectos")
        print("2) Destacar proyectos")
        print("3) Cambiar el PDF del CV")
        print("4) Añadir experiencia o formación al Journey")
        print("5) Añadir certificados")
        print("6) Modificar enlaces")
        print("0) Salir")
        print("\nEscribe :b para volver al menú anterior sin guardar.")
        try:
            selected = form.answer("Elige una opción: ")
        except form.Back:
            return
        if selected == "0":
            return
        actions = {"1":add_or_edit_project,"2":feature_project,"3":edit_resume,
                   "4":add_journey,"5":add_certificate,"6":edit_links}
        action = actions.get(selected)
        if not action:
            print("Elige un número del menú.")
            form.pause()
            continue
        result = None
        try:
            form.clear_screen()
            print("Escribe :b en cualquier pregunta para volver atrás sin guardar.\n")
            result = action()
        except form.Back:
            continue
        except (ValueError, RuntimeError) as error:
            print(f"Error: {error}")
        if result is not False:
            form.pause()


if __name__ == "__main__":
    main()
