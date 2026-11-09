# Wenrui Xu — Portfolio

**Software Developer · Game Development · Generative AI · Automation**

Un portfolio interactivo para presentar proyectos, experiencia y herramientas. Su contenido se gestiona con archivos Markdown: añadir un proyecto no requiere modificar los componentes de React.

![React](https://img.shields.io/badge/React-20251F?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-20251F?style=flat-square&logo=vite&logoColor=B9A9FF)
![JavaScript](https://img.shields.io/badge/JavaScript-20251F?style=flat-square&logo=javascript&logoColor=F7DF1E)
![CSS](https://img.shields.io/badge/CSS-20251F?style=flat-square&logo=css&logoColor=8EB887)
![Python](https://img.shields.io/badge/Python-20251F?style=flat-square&logo=python&logoColor=F4C96B)
![Markdown](https://img.shields.io/badge/Markdown-20251F?style=flat-square&logo=markdown&logoColor=FFFFFF)

## Qué incluye

- **Home:** presentación, avatar interactivo, showreel y proyectos destacados.
- **Work:** filtros por categoría y tecnología, y una página de estudio para cada proyecto publicado.
- **About:** recorrido profesional, herramientas, idiomas y certificados.
- **Contact y CV:** enlaces de contacto y descarga del currículum.
- **Inglés y español**, diseño adaptable y soporte para `prefers-reduced-motion`.

## Tecnologías

**React 18 · React Router 6 · Vite 5 · JavaScript · CSS · Markdown + YAML Front Matter · Python 3**

`gray-matter` procesa el contenido; `react-markdown` muestra los estudios de caso. El sitio generado es estático y no necesita base de datos ni servidor propio.

## Ejecutar en local

Necesitas **Node.js**. Abre esta carpeta en VS Code y, en la terminal de PowerShell, ejecuta:

```powershell
npm.cmd install
npm.cmd run dev
```

Abre **http://localhost:5173/**. Después de la primera instalación, basta con `npm.cmd run dev` cada vez que abras el proyecto. Detén el servidor con **Ctrl+C**.

Para comprobar el contenido y preparar una versión de producción:

```powershell
npm.cmd run content:check
npm.cmd run build
```

La versión compilada queda en `dist/`.

## Editar el contenido

| Quieres cambiar… | Archivo o carpeta |
| --- | --- |
| Proyectos y estudios de caso | `content/projects/` y `content/es/projects/` |
| Experiencia, formación y certificados | `content/experience/`, `content/education/`, `content/certificates/` y sus traducciones en `content/es/` |
| Enlaces, CV y showreel | `content/site.json` |
| Textos de la interfaz | `content/ui.json` |
| Imágenes, iconos y PDF | `public/` |

También puedes abrir **`manage_portfolio.py`** en VS Code y pulsar **▶ Ejecutar archivo Python**. Su menú permite añadir proyectos, elegir destacados, cambiar el PDF, añadir entradas al recorrido y certificados, y modificar enlaces. Es útil cuando el comando `py` no está disponible en PowerShell.

Los proyectos de ejemplo pueden conservarse como plantillas con `published: false`. Solo los publicados aparecen en la web; `featured: true` los añade al carrusel de destacados. Para publicar uno nuevo, prepara también su traducción en `content/es/projects/`.

## Privacidad

El código está pensado para un **repositorio privado**. Un repositorio privado no hace privada una web desplegada: antes de compartir un despliegue, comprueba también su configuración de acceso.

---

<sub>Made with curiosity, code and a little bunny energy. 🐰</sub>