#!/usr/bin/env python3
"""Create or edit bilingual project content from a console form.

Requires the project's npm dependencies; uses gray-matter through Node to read
the same front matter format as the Vite build. Python needs no extra packages.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
EN_DIR = ROOT / "content" / "projects"
ES_DIR = ROOT / "content" / "es" / "projects"
CATEGORIES = ("games", "apps", "web", "automation", "creative-tech")
LIFECYCLES = ("completed", "cancelled", "draft")
FIELD_ORDER = (
    "type", "title", "slug", "categories", "lifecycle", "featured", "featuredOrder", "published",
    "order", "year", "role", "projectType", "status", "summary",
    "technologies", "primaryTags", "thumbnail", "previewVideo", "github", "process", "gallery",
)
ES_FIELDS = ("slug", "title", "role", "projectType", "status", "summary", "process", "gallery")
PARSER = """
import fs from 'node:fs';
import matter from 'gray-matter';
const {data,content}=matter(fs.readFileSync(process.argv[1], 'utf8'));
process.stdout.write(JSON.stringify({data,body:content}));
"""


class Back(Exception):
    """Return to the previous menu without saving the current form."""


def clear_screen():
    """Clear interactive terminals, while preserving output for redirected runs."""
    if sys.stdout.isatty():
        os.system("cls" if os.name == "nt" else "clear")


def pause():
    try:
        input("\nPulsa Enter para volver al menú...")
    except (EOFError, KeyboardInterrupt):
        pass


def answer(prompt):
    try:
        value = input(prompt).strip()
    except (EOFError, KeyboardInterrupt):
        raise Back() from None
    if value.lower() == ":b":
        raise Back()
    return value


def text(label, default="", required=False):
    while True:
        hint = f" [{default}]" if default else ""
        value = answer(f"{label}{hint}: ")
        value = default if not value else ("" if value == "-" else value)
        if value or not required:
            return value
        print("Este campo es obligatorio.")


def choice(label, options, default):
    print(f"{label}: " + " · ".join(f"{i + 1} {option}" for i, option in enumerate(options)))
    while True:
        value = answer(f"Elige [{default}]: ").lower()
        if not value:
            return default
        if value.isdigit() and 1 <= int(value) <= len(options):
            return options[int(value) - 1]
        if value in options:
            return value
        print("Elige un número o nombre de la lista.")


def yes_no(label, default=False):
    hint = "Y/n" if default else "y/N"
    while True:
        value = answer(f"{label} [{hint}]: ").lower()
        if not value:
            return default
        if value in ("y", "yes", "s", "si", "sí"):
            return True
        if value in ("n", "no"):
            return False
        print("Escribe s o n.")


def comma_list(label, default=None):
    default = default or []
    value = answer(f"{label} (separado por comas) [{', '.join(default)}]: ")
    if not value:
        return default
    if value == "-":
        return []
    return list(dict.fromkeys(part.strip() for part in value.split(",") if part.strip()))


def category_list(default):
    while True:
        result = comma_list("Categorías (games, apps, web, automation, creative-tech)", default)
        if result and all(category in CATEGORIES for category in result):
            return result
        print("Elige al menos una de las categorías indicadas.")


def number(label, default):
    while True:
        value = answer(f"{label} [{default}]: ")
        if not value:
            return default
        if value.isdigit() and int(value) >= 0:
            return int(value)
        print("Escribe un número entero no negativo.")


def slugify(title):
    normalized = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", normalized.lower()))


def read_file(path):
    if not path.exists():
        return {}, ""
    node = shutil.which("node")
    if not node:
        raise SystemExit("Node.js is required. Run npm install in this folder first.")
    result = subprocess.run(
        [node, "--input-type=module", "-e", PARSER, str(path)],
        cwd=ROOT, capture_output=True, text=True,
    )
    if result.returncode:
        raise SystemExit(f"Cannot read {path.name}: {result.stderr.strip()}\nRun npm install first.")
    parsed = json.loads(result.stdout)
    return parsed["data"], parsed["body"]


def lines(label):
    print(f"{label} — puedes usar Markdown; termina con un . en una línea aparte. :b vuelve sin guardar.")
    result = []
    while True:
        try:
            line = input()
        except (EOFError, KeyboardInterrupt):
            raise Back() from None
        if line.strip().lower() == ":b":
            raise Back()
        if line == ".":
            return "\n".join(result).strip()
        result.append(line)


def sections(body):
    matches = list(re.finditer(r"(?m)^## ([^\n]+)\s*$", body))
    if not matches:
        return body.strip(), []
    prefix = body[:matches[0].start()].strip()
    items = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        items.append([match.group(1).strip(), body[match.end():end].strip()])
    return prefix, items


def render_sections(prefix, items):
    blocks = [prefix] if prefix else []
    blocks += [f"## {heading}\n\n{body}" for heading, body in items if body]
    return "\n\n".join(blocks).strip()


def new_bodies():
    print("\nCASO DE ESTUDIO — deja una sección vacía para ocultarla.")
    items_en, items_es = [], []
    for heading_en, heading_es in (("Overview", "Resumen"), ("My role", "Mi papel"),
                                    ("Challenges", "Retos"), ("Process", "Proceso"),
                                    ("Outcome", "Resultado")):
        while True:
            body_en = lines(f"{heading_en} (EN)")
            body_es = lines(f"{heading_es} (ES)")
            if bool(body_en) == bool(body_es):
                break
            print("Escribe esta sección en ambos idiomas o deja ambos vacíos.")
        if body_en or body_es:
            items_en.append([heading_en, body_en])
            items_es.append([heading_es, body_es])
    while yes_no("¿Añadir otra sección al caso de estudio?"):
        heading_en = text("Título de sección (EN)", required=True)
        heading_es = text("Título de sección (ES)", required=True)
        while True:
            body_en = lines(f"{heading_en} (EN)")
            body_es = lines(f"{heading_es} (ES)")
            if bool(body_en) == bool(body_es):
                break
            print("Escribe esta sección en ambos idiomas o deja ambos vacíos.")
        items_en.append([heading_en, body_en])
        items_es.append([heading_es, body_es])
    return render_sections("", items_en), render_sections("", items_es)


def edit_body(body, language):
    if not yes_no(f"¿Editar las secciones del caso de estudio ({language})?"):
        return body
    prefix, items = sections(body)
    while True:
        clear_screen()
        print("EDITAR CASO DE ESTUDIO — :b vuelve a la lista de proyectos sin guardar.\n")
        print(f"\nSecciones {language}: " + (", ".join(f"{i + 1} {item[0]}" for i, item in enumerate(items)) or "ninguna"))
        selection = answer("Número para editar, + para añadir, -N para borrar, Enter para terminar: ")
        if not selection:
            return render_sections(prefix, items)
        if selection == "+":
            heading = text("Título nuevo", required=True)
            items.append([heading, lines(heading)])
        elif selection.startswith("-") and selection[1:].isdigit() and 1 <= int(selection[1:]) <= len(items):
            items.pop(int(selection[1:]) - 1)
        elif selection.isdigit() and 1 <= int(selection) <= len(items):
            item = items[int(selection) - 1]
            item[0] = text("Título", item[0], required=True)
            item[1] = lines(f"Nuevo texto de {item[0]}")
        else:
            print("Elige una sección de la lista.")


def gallery_items(existing_en, existing_es):
    if not yes_no("¿Sustituir la galería?", False):
        return existing_en, existing_es
    english, spanish = [], []
    while yes_no("¿Añadir una imagen o vídeo?"):
        src = text("Ruta (/images/... o /videos/...)", required=True)
        kind = choice("Tipo de archivo", ("image", "video"), "image")
        alt_en = text("Descripción (EN)", required=True)
        alt_es = text("Descripción (ES)", required=True)
        english.append({"src": src, "kind": kind, "alt": alt_en})
        spanish.append({"src": src, "kind": kind, "alt": alt_es})
    return english, spanish


def serialize(data, body, order):
    keys = [key for key in order if key in data] + [key for key in data if key not in order]
    front = "\n".join(f"{key}: {json.dumps(data[key], ensure_ascii=False)}" for key in keys)
    return f"---\n{front}\n---\n{body.strip()}\n"


def youtube_id(value):
    """Accept watch, short, live and embed links, but only on YouTube HTTPS hosts."""
    parsed = urlparse(value)
    if parsed.scheme != "https":
        return None
    host = (parsed.hostname or "").lower()
    if host in ("youtu.be", "www.youtu.be"):
        video_id = parsed.path.strip("/").split("/")[0]
    elif host in ("youtube.com", "www.youtube.com", "m.youtube.com",
                  "youtube-nocookie.com", "www.youtube-nocookie.com"):
        video_id = parse_qs(parsed.query).get("v", [None])[0] if parsed.path == "/watch" else None
        if not video_id:
            match = re.fullmatch(r"/(?:embed|shorts|live)/([a-zA-Z0-9_-]{11})/?", parsed.path)
            video_id = match.group(1) if match else None
    else:
        return None
    return video_id if video_id and re.fullmatch(r"[a-zA-Z0-9_-]{11}", video_id) else None


def validate(data, localized, body_en, body_es):
    selected = data.get("categories", [])
    if not selected or len(selected) != len(set(selected)) or any(category not in CATEGORIES for category in selected):
        raise ValueError("Choose one or more valid categories.")
    if data["published"]:
        required = ("year", "role", "projectType", "status", "summary")
        missing = [field for field in required if not data.get(field)]
        missing += [f"{field} (ES)" for field in ("role", "projectType", "status", "summary") if not localized.get(field)]
        if not data["technologies"]:
            missing.append("technologies")
        if not data.get("primaryTags"):
            missing.append("primaryTags")
        if not body_en.strip() or not body_es.strip():
            missing.append("case study in both languages")
        if len(sections(body_en)[1]) != len(sections(body_es)[1]):
            missing.append("matching case-study sections in EN and ES")
        if missing:
            raise ValueError("Cannot publish yet. Fill: " + ", ".join(missing))
    if data["published"] and data["lifecycle"] not in ("completed", "cancelled"):
        raise ValueError("Only completed or cancelled projects can be published.")
    if data["featured"] and not data["published"]:
        raise ValueError("Featured projects must be published.")
    if data["featured"] and data.get("featuredOrder", 1) < 1:
        raise ValueError("Featured carousel positions start at 1.")
    unknown_tags = set(data.get("primaryTags", [])) - set(data["technologies"])
    if unknown_tags:
        raise ValueError("Primary tags must also appear in technologies: " + ", ".join(sorted(unknown_tags)))
    thumbnail = data.get("thumbnail", "")
    preview = data.get("previewVideo", "")
    if thumbnail and (not thumbnail.startswith("/images/") or ".." in Path(thumbnail).parts):
        raise ValueError("La portada debe empezar por /images/.")
    if preview and not youtube_id(preview) and (not preview.startswith("/videos/") or ".." in Path(preview).parts):
        raise ValueError("La vista previa debe ser un enlace HTTPS de YouTube o un vídeo en /videos/.")
    for item in data.get("gallery", []):
        path = item.get("src", "")
        if not path.startswith(("/images/", "/videos/")) or ".." in Path(path).parts:
            raise ValueError("Gallery paths must start with /images/ or /videos/.")
    if data["published"]:
        media = [thumbnail] + ([preview] if preview and not youtube_id(preview) else [])
        media += [item["src"] for item in data.get("gallery", [])]
        missing_media = [path for path in media if path and not (ROOT / "public" / path.lstrip("/")).is_file()]
        if missing_media:
            raise ValueError("Media files missing under public/: " + ", ".join(missing_media))


def save(english_path, spanish_path, english, spanish):
    before = {path: path.read_text(encoding="utf-8") if path.exists() else None for path in (english_path, spanish_path)}
    try:
        english_path.write_text(english, encoding="utf-8")
        spanish_path.write_text(spanish, encoding="utf-8")
        npm = shutil.which("npm")
        if not npm:
            raise RuntimeError("npm is required to validate the content.")
        result = subprocess.run([npm, "run", "content:check"], cwd=ROOT, capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(result.stdout + result.stderr)
    except Exception:
        for path, original in before.items():
            if original is None:
                path.unlink(missing_ok=True)
            else:
                path.write_text(original, encoding="utf-8")
        if shutil.which("npm"):
            subprocess.run([shutil.which("npm"), "run", "content:check"], cwd=ROOT, capture_output=True, text=True)
        raise
    print(f"\nGuardados {english_path.relative_to(ROOT)} y {spanish_path.relative_to(ROOT)}.")
    print("Contenido validado. Revisa la web y sube los cambios a tu repositorio privado.")


def main(delete_project=None):
    if not (ROOT / "node_modules" / "gray-matter").exists():
        raise RuntimeError("Ejecuta npm.cmd install en la carpeta del portfolio primero.")
    while True:
        files = sorted(EN_DIR.glob("*.md"))
        clear_screen()
        print("PROYECTOS — elige una opción\n")
        print("1) Añadir proyecto")
        print("2) Eliminar proyecto")
        for index, file in enumerate(files, 3):
            data, _ = read_file(file)
            print(f"{index}) Editar «{data.get('title') or file.stem}»")
        print("0) Volver al menú principal\n")
        selection = answer("Elige un número: ")
        if selection == "0":
            return None
        if selection == "2":
            if delete_project is None:
                print("La eliminación solo está disponible desde manage_portfolio.py.")
                pause()
                continue
            try:
                result = delete_project(files)
            except Back:
                continue
            if result is not False:
                pause()
            continue
        if selection.isdigit() and (selection == "1" or 3 <= int(selection) <= len(files) + 2):
            try:
                if selection == "1":
                    return edit_project(files, selection)
                return edit_existing_project(files[int(selection) - 3])
            except Back:
                continue
        print("Elige un número de la lista.")
        pause()


def edit_existing_project(english_path):
    """Open the actual Markdown content; validate after the user saves it."""
    spanish_path = ES_DIR / english_path.name
    clear_screen()
    print(f"EDITAR PROYECTO — {english_path.stem}\n")
    print(f"Inglés:  {english_path}")
    print(f"Español: {spanish_path}")
    print("Los archivos contienen los valores y el estudio de caso completos.")
    print("Modifica el texto directamente en VS Code y guarda ambos archivos con Ctrl+S.\n")
    editor = shutil.which("code") or shutil.which("code.cmd")
    if not editor and os.name == "nt":
        for base in (os.getenv("LOCALAPPDATA"), os.getenv("ProgramFiles"), os.getenv("ProgramFiles(x86)")):
            if not base:
                continue
            for folder in ("Microsoft VS Code", "Microsoft VS Code Insiders"):
                for candidate in (Path(base) / "Programs" / folder / "bin" / "code.cmd",
                                  Path(base) / folder / "bin" / "code.cmd"):
                    if candidate.is_file():
                        editor = str(candidate)
                        break
                if editor:
                    break
            if editor:
                break
    if editor:
        try:
            subprocess.Popen([editor, "--reuse-window", str(english_path), str(spanish_path)],
                             cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("He abierto los dos archivos en VS Code.")
        except OSError:
            print("No pude abrirlos automáticamente: ábrelos desde el explorador de VS Code.")
    else:
        print("Abre las rutas de arriba con Ctrl+clic o desde el explorador de VS Code.")
    while True:
        selected = answer("\nEnter = validar lo guardado · 0 = volver a proyectos: ")
        if selected == "0":
            return None
        if selected:
            print("Pulsa Enter para validar o escribe 0 para volver.")
            continue
        npm = shutil.which("npm")
        if not npm:
            print("No encuentro npm. Instala Node.js y ejecuta npm.cmd install.")
            continue
        result = subprocess.run([npm, "run", "content:check"], cwd=ROOT,
                                capture_output=True, text=True, check=False)
        if result.returncode:
            print("\nHay un error de contenido. Corrígelo en los archivos abiertos, guarda y pulsa Enter de nuevo:\n")
            print((result.stdout + result.stderr).strip())
            continue
        print("\nContenido validado. Los cambios ya están en los archivos del proyecto.")
        return english_path


def correct_project(en, es, body_en, body_es, error):
    """Fix one field in memory and retry validation without repeating the form."""
    clear_screen()
    print(f"NO SE HA GUARDADO — {error}\n")
    print("Todo lo que escribiste sigue aquí. Elige únicamente el dato que quieres corregir.")
    fields = (
        "Título (EN y ES)", "Categorías", "Estado del proyecto", "Orden", "Año",
        "Tu papel (EN y ES)", "Tipo de proyecto (EN y ES)",
        "Estado o resultado (EN y ES)", "Descripción de tarjeta (EN y ES)",
        "Tecnologías", "Etiquetas principales", "Etapas del proceso (EN y ES)",
        "Imagen de portada", "Vista previa en vídeo", "GitHub", "Galería",
        "Caso de estudio (EN)", "Caso de estudio (ES)", "Publicación", "Destacado",
    )
    for index, label in enumerate(fields, 1):
        print(f"{index:2}) {label}")
    print(" 0) Volver a proyectos sin guardar")
    selected = answer("Campo a corregir: ")
    if selected == "0":
        raise Back()
    if not selected.isdigit() or not 1 <= int(selected) <= len(fields):
        print("Elige un número de la lista.")
        pause()
        return body_en, body_es
    selected = int(selected)
    if selected == 1:
        en["title"] = text("Título (EN)", en.get("title", ""), required=True)
        es["title"] = text("Título (ES)", es.get("title", ""), required=True)
    elif selected == 2:
        en["categories"] = category_list(en.get("categories", []))
    elif selected == 3:
        en["lifecycle"] = choice("Estado del proyecto", LIFECYCLES, en.get("lifecycle", "draft"))
    elif selected == 4:
        en["order"] = number("Orden", en.get("order", 1))
    elif selected == 5:
        en["year"] = text("Año", str(en.get("year", "")))
    elif selected in (6, 7, 8, 9):
        key, label = {6: ("role", "Tu papel"), 7: ("projectType", "Tipo de proyecto"),
                      8: ("status", "Estado o resultado"), 9: ("summary", "Descripción")}[selected]
        en[key] = text(f"{label} (EN)", en.get(key, ""))
        es[key] = text(f"{label} (ES)", es.get(key, ""))
    elif selected == 10:
        en["technologies"] = comma_list("Tecnologías", en.get("technologies", []))
    elif selected == 11:
        en["primaryTags"] = comma_list("Etiquetas principales", en.get("primaryTags", []))
    elif selected == 12:
        en["process"] = comma_list("Etapas del proceso (EN)", en.get("process", []))
        es["process"] = comma_list("Etapas del proceso (ES)", es.get("process", []))
    elif selected in (13, 14, 15):
        key, label = {13: ("thumbnail", "Imagen de portada"),
                      14: ("previewVideo", "Vista previa en vídeo"),
                      15: ("github", "GitHub")}[selected]
        print("Escribe - para borrar el valor actual. Vista previa acepta enlaces de YouTube.")
        en[key] = text(label, en.get(key, ""))
    elif selected == 16:
        en["gallery"], es["gallery"] = gallery_items(en.get("gallery", []), es.get("gallery", []))
    elif selected == 17:
        body_en = edit_body(body_en, "EN")
    elif selected == 18:
        body_es = edit_body(body_es, "ES")
    elif selected == 19:
        en["published"] = yes_no("¿Publicar este proyecto?", en.get("published", False))
        if not en["published"]:
            en["featured"] = False
    elif selected == 20:
        en["featured"] = yes_no("¿Destacar en Home y Work?", en.get("featured", False))
        if en["featured"]:
            en["featuredOrder"] = number("Posición en el carrusel", en.get("featuredOrder", en.get("order", 1)))
    return body_en, body_es


def edit_project(files, selection):
    clear_screen()
    print("FORMULARIO DE PROYECTOS — Enter mantiene el valor; - borra un campo opcional.")
    print("Escribe :b en cualquier pregunta para volver a la lista sin guardar.\n")
    en, es = {}, {}
    title = text("Título del proyecto (EN)", required=True)
    slug = text("Slug para la URL", slugify(title), required=True)
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError("El identificador solo admite letras minúsculas, números y guiones.")
    english_path, spanish_path = EN_DIR / f"{slug}.md", ES_DIR / f"{slug}.md"
    if english_path.exists() or spanish_path.exists():
        raise ValueError("Ese identificador ya existe. Elige editar el proyecto existente.")
    en.update(type="project", title=title, slug=slug)
    es.update(slug=slug)
    body_en = body_es = ""
    es["title"] = text("Título (ES)", es.get("title", en["title"]), required=True)
    en["categories"] = category_list(en.get("categories", [en.get("category", "games")]))
    en.pop("category", None)
    en["lifecycle"] = choice("Estado del proyecto", LIFECYCLES, en.get("lifecycle", "draft"))
    en["order"] = number("Orden en todos los proyectos", en.get("order", len(files) + 1))
    en["year"] = text("Año", str(en.get("year", "")))
    for field, label_en, label_es in (
        ("role", "Tu papel", "Tu papel"),
        ("projectType", "Tipo de proyecto", "Tipo de proyecto"),
        ("status", "Estado o resultado", "Estado o resultado"),
        ("summary", "Descripción de la tarjeta", "Descripción de la tarjeta"),
    ):
        en[field] = text(f"{label_en} (EN)", en.get(field, ""))
        es[field] = text(f"{label_es} (ES)", es.get(field, ""))
    en["technologies"] = comma_list("Tecnologías", en.get("technologies", []))
    en["primaryTags"] = comma_list("Etiquetas principales (elige entre las tecnologías)", en.get("primaryTags", []))
    en["process"] = comma_list("Etapas del proceso (EN)", en.get("process", []))
    es["process"] = comma_list("Etapas del proceso (ES)", es.get("process", []))
    for field, label in (("thumbnail", "Imagen de portada"), ("previewVideo", "Enlace de YouTube o vídeo local /videos/..."), ("github", "GitHub del proyecto")):
        en[field] = text(label, en.get(field, ""))
    gallery_en, gallery_es = gallery_items(en.get("gallery", []), es.get("gallery"))
    en["gallery"] = gallery_en
    if gallery_es is not None:
        es["gallery"] = gallery_es
    if yes_no("¿Escribir ahora el caso de estudio?", en["lifecycle"] != "draft"):
        body_en, body_es = new_bodies()
    en["published"] = yes_no("¿Publicar este proyecto terminado o cancelado?", en.get("published", False))
    en["featured"] = yes_no("¿Destacarlo en Home y Work?", en.get("featured", False)) if en["published"] else False
    if en["featured"]:
        en["featuredOrder"] = number("Posición en el carrusel de destacados", en.get("featuredOrder", en["order"]))
    for key in ("featured", "featuredOrder", "published", "lifecycle", "category", "categories", "order", "technologies", "primaryTags", "thumbnail", "previewVideo", "github"):
        es.pop(key, None)
    while True:
        try:
            validate(en, es, body_en, body_es)
            print(f"\nVista previa: {en['title']} · {', '.join(en['categories'])} · {en['lifecycle']} · {'publicado' if en['published'] else 'borrador'}")
            if not yes_no("¿Guardar estos archivos?"):
                print("No se han cambiado archivos.")
                return None
            save(english_path, spanish_path, serialize(en, body_en, FIELD_ORDER), serialize(es, body_es, ES_FIELDS))
            return english_path
        except (ValueError, RuntimeError) as error:
            body_en, body_es = correct_project(en, es, body_en, body_es, error)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError) as error:
        raise SystemExit(str(error))
