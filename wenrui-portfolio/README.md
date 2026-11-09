# Wenrui Xu — Portfolio

**Software Developer · Game Development · Generative AI · Automation**

[English](#english) · [Español](#español)

![React](https://img.shields.io/badge/React-20251F?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-20251F?style=flat-square&logo=vite&logoColor=B9A9FF)
![JavaScript](https://img.shields.io/badge/JavaScript-20251F?style=flat-square&logo=javascript&logoColor=F7DF1E)
![CSS](https://img.shields.io/badge/CSS-20251F?style=flat-square&logo=css&logoColor=8EB887)
![Python](https://img.shields.io/badge/Python-20251F?style=flat-square&logo=python&logoColor=F4C96B)
![Markdown](https://img.shields.io/badge/Markdown-20251F?style=flat-square&logo=markdown&logoColor=FFFFFF)

## English

An interactive portfolio for my projects, experience and creative tools. Project pages and featured work are generated from Markdown content, so new projects do not need changes to the React components.

### What's inside

- **Home:** interactive avatar, showreel and featured projects.
- **Work:** category and technology filters, plus a case study for each published project.
- **About:** professional journey, toolbox, languages and certificates.
- **Contact & résumé:** social links, email and a downloadable PDF.
- English/Spanish switcher, responsive layouts and reduced-motion support.

**Stack:** React 18 · React Router 6 · Vite 5 · JavaScript · CSS · Markdown + YAML Front Matter · Python 3. `gray-matter` parses content and `react-markdown` renders case studies. The built site is static and needs no database.

### Run locally

Install Node.js, open this folder in VS Code, then run in PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Open **http://localhost:5173/**. On later visits, only `npm.cmd run dev` is needed. Stop the server with **Ctrl+C**. To validate content and build the site:

```powershell
npm.cmd run content:check
npm.cmd run build
```

The production files are written to `dist/`.

### Update content

| Content | Location |
| --- | --- |
| Projects and case studies | `content/projects/` and `content/es/projects/` |
| Experience, education and certificates | `content/experience/`, `content/education/`, `content/certificates/` and their `content/es/` translations |
| Links, résumé and showreel | `content/site.json` |
| Interface copy | `content/ui.json` |
| Images, icons and PDF | `public/` |

You can also open `manage_portfolio.py` in VS Code and click **▶ Run Python File**. Its menu can add projects, select featured work, change the résumé PDF, add journey entries or certificates, and edit links. The project supports the Front Matter CMS extension through `frontmatter.json`.

Keep sample projects as templates with `published: false`. Only published projects appear on the site; `featured: true` adds a published project to the featured carousel. Add its Spanish translation before publishing.

**Privacy:** The source repository is intended to remain private. A private repository does not automatically restrict access to a deployed website; protect the deployment separately.

---

## Español

Un portfolio interactivo para presentar mis proyectos, experiencia y herramientas creativas. Los proyectos y destacados se generan a partir de Markdown, por lo que añadir uno nuevo no requiere modificar los componentes de React.

### Qué incluye

- **Home:** avatar interactivo, showreel y proyectos destacados.
- **Work:** filtros por categoría y tecnología, y un estudio de caso para cada proyecto publicado.
- **About:** recorrido profesional, herramientas, idiomas y certificados.
- **Contacto y CV:** redes sociales, correo y descarga del PDF.
- Selector inglés/español, diseño adaptable y soporte para movimiento reducido.

**Tecnologías:** React 18 · React Router 6 · Vite 5 · JavaScript · CSS · Markdown + YAML Front Matter · Python 3. `gray-matter` procesa el contenido y `react-markdown` muestra los estudios de caso. El sitio compilado es estático y no necesita base de datos.

### Ejecutar en local

Instala Node.js, abre la carpeta en VS Code y ejecuta en PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Abre **http://localhost:5173/**. Las siguientes veces solo necesitas `npm.cmd run dev`. Detén el servidor con **Ctrl+C**. Para validar el contenido y compilar la web:

```powershell
npm.cmd run content:check
npm.cmd run build
```

Los archivos listos para desplegar quedan en `dist/`.

### Modificar el contenido

| Contenido | Ubicación |
| --- | --- |
| Proyectos y estudios de caso | `content/projects/` y `content/es/projects/` |
| Experiencia, formación y certificados | `content/experience/`, `content/education/`, `content/certificates/` y sus traducciones en `content/es/` |
| Enlaces, CV y showreel | `content/site.json` |
| Textos de la interfaz | `content/ui.json` |
| Imágenes, iconos y PDF | `public/` |

También puedes abrir `manage_portfolio.py` en VS Code y pulsar **▶ Ejecutar archivo Python**. Su menú permite añadir proyectos, elegir destacados, cambiar el PDF, añadir entradas al recorrido o certificados y modificar enlaces. `frontmatter.json` configura la extensión Front Matter CMS.

Puedes conservar proyectos de ejemplo como plantillas con `published: false`. Solo aparecen los publicados; `featured: true` añade un proyecto publicado al carrusel. Prepara su traducción al español antes de publicarlo.

**Privacidad:** El repositorio de código está pensado para ser privado. Eso no restringe automáticamente el acceso a una web desplegada; el despliegue debe protegerse por separado.

---

<sub>Made with curiosity, code and a little bunny energy. 🐰</sub>
