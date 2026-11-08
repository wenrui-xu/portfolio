# Wenrui (Sabrina) Xu — portfolio

A cinematic, dark portfolio built with React, Vite, React Router, Markdown and Front Matter CMS. It is static: no database, public admin or paid CMS.

## Run and build

```bash
npm install
npm run dev
npm run content:check
npm run build
```

Vite serves the site locally. The content plugin reads `content/**/*.md` on start/build and updates the site when those files change in development. It validates unique slugs, project categories, required technology lists and matching Spanish translations for published content. The output is `dist/`. Do not edit `src/generated/content.json` or `src/generated/content-es.json`; both are generated and ignored by Git.

## Manage content from the console

Install Node.js and Python 3 once, then run `npm install` in this folder. Open the
console menu with:

```bash
# Windows
py manage_portfolio.py

# macOS / Linux
python3 manage_portfolio.py
```

The menu has six actions:

| Option | Files it changes | Result on the website |
| --- | --- | --- |
| 1. Add or edit projects | `content/projects/*.md` and `content/es/projects/*.md` | Cards, category/tag filters, `/work/:slug` and the next-project link are generated. The form asks for role, year, summary, categories, tags, process, overview, challenges and outcome in both languages. |
| 2. Feature projects | `featured` and `featuredOrder` in the English project file | The same featured carousel on Home and Work is rebuilt in the chosen order. |
| 3. Change CV PDF | Copies your PDF to `public/resume/`, then updates `content/site.json` | The navbar downloads the selected PDF with the selected filename. |
| 4. Add to My Journey | `content/{experience,education}/*.md` and matching `content/es/` files | Timeline sorted by the `AAAA-MM` end date, with expandable descriptions. |
| 5. Add certificates | `content/certificates/*.md` and matching `content/es/` files; optionally copies the image into `public/images/certificates/` | Certificate card and modal in About. Without a scan, the image-pending icon remains. |
| 6. Modify links | `content/site.json` | GitHub, LinkedIn and email update across hero, contact dialog, contact CTA and footer. |

For a project, choose **New project** or an existing slug. Enter one or more
categories separated by commas, then card details, technologies, primary tags,
optional media and the case-study sections. Press Enter to keep an existing
value; enter `-` to clear an optional value. For multi-line text, enter a line
with only `.` to finish. To skip a section, enter `.` immediately. Blank image
paths retain the image icon. `primaryTags` must be a subset of `technologies`;
new technology names still render as text. The console offers to copy a custom
SVG for an unfamiliar technology, without editing React. Icon names are stored
in `content/technology-icons.json`.

The project form writes English and Spanish files and validates the published
content. New projects start unpublished. Only finished or cancelled projects
can be published; Featured Work requires publication. The other content forms
also create both language files. Configuration changes build the entire site
and revert if the build fails. Review the result with `npm run dev` and run
`npm run build` before committing.

Commit and push the changed files to your **private** GitHub repository. Once
that repository is connected to a protected deployment, each push can trigger
a rebuild. The current owner-only Sites deployment uses its own source
repository and is not yet connected to GitHub; pushing to a separate GitHub
repository alone will not update this private URL.

## Edit content with Front Matter CMS

1. Open this folder in VS Code with the **Front Matter CMS** extension. `frontmatter.json` registers Projects, Experience, Education and Certificates. The project template is `.frontmatter/templates/project.md`.
2. Create `content/projects/your-slug.md` and fill in its YAML front matter: `title`, `slug`, `categories` (one or more of `games`, `apps`, `web`, `automation`, `creative-tech`), `lifecycle` (`draft`, `completed`, `cancelled`), `featured`, optional `featuredOrder`, `published`, `year`, `role`, `projectType`, `status`, `summary`, `technologies`, `primaryTags`, `thumbnail`, `previewVideo`, `github`, `process` and optional `gallery`. For example, a completed mobile game can use `categories: [games, apps]` and `primaryTags: [Unity, 'C#', Android]`. The same project appears under both filters but only once in All Work. `primaryTags` selects the significant skills shown on cards and in the contextual filters, in display order; its entries must also exist in `technologies`. The full technical list remains in each case study. A game testing project can use the `Game Testing` tag when it accurately describes that project.
3. Write case-study sections as `## Overview`, `## My role`, `## Challenges`, `## Process`, `## Outcome` or any other relevant heading. Sections with content appear in the sticky index; Process also appears automatically when it has steps. `Tech` is derived from the technologies. `Gallery` appears only when media exists. Inside Challenges, `### Problem`, `### Why`, `### Solution` and `### Result` are useful when the evidence supports them.
4. Add `content/es/projects/your-slug.md` with the same slug and translated front matter for the fields that need localization (`title`, `role`, `projectType`, `status`, `summary`, `process`), then translate the case-study body. The build merges its fields with the English source, retaining media and technologies. Published experience, education and certificate entries likewise need matching files under `content/es/`. This guards against a half-translated public page. Shared UI copy lives in `content/ui.json`.
5. Store images and videos under `public/images/` and `public/videos/`; reference them with root-relative paths such as `/images/gameplay.png`. Gallery items use `{src, alt, kind}` with `kind: image` or `video`. Set `published: true` only when both languages are ready.
6. Commit and push to a **private** repository when your deployment accounts are ready. Adding a published Markdown file automatically updates Home, Work, filters, case studies and Next Project navigation. The EN/ES selector persists in local browser storage.

`Animalpedia` and the in-progress `Snail Mail Club` are private drafts (`published: false`). Featured Work currently shows ADI and the completed QA case study Testing ADI. More featured projects stay in one horizontal row with arrow controls and touch scrolling. Missing project images show an image icon. The showreel is currently a black 16:9 placeholder. Once a YouTube video is ready, enter only its 11-character video ID in `showreelYoutubeId` in `content/site.json`; the component then renders a privacy-enhanced YouTube embed on desktop and mobile. Dates, screenshots, certificate scans, source links and metrics must be verified before they are added.

## Site structure

- `/`: the supplied Qingtian night studio as a background plate, a separate transparent interactive avatar, a compacting horizontal menu, a thin scroll-driven line and kinetic type transition, 16:9 YouTube-ready showreel, Featured Work, About with timeline tabs, and Contact.
- `/work`: featured cards, category filters and expandable technology filters.
- `/work/:slug`: content-driven case study with sticky section index, process steps, media lightbox and next project.
- Contact is a dialog opened from the navbar; About links to the Home section. The four navigation icons respond independently to hover and keyboard focus, with reduced-motion support. The CV button reads its path and download filename from `content/site.json`.

The current composition uses `public/images/studio-qingtian-night.webp` (supplied clean background) and `public/images/hero-wenrui-studio.png` (supplied transparent avatar). The supplied combined image is a visual reference only: all headings, captions, links and buttons are actual HTML. The older `hero-wenrui.png`, `cinematic-studio.webp` and `chapter-*.webp` are retained for reuse. The avatar layer is aligned in the background plate's 1672 × 941 coordinate system at each viewport size. Its PNG also contains a laptop and desk objects, so `src/InteractivePortrait.jsx` masks those props at runtime to leave the figure in front of the laptop already present in the background. Each rigid iris is sampled from `public/images/wenrui-irises-atlas.png` and masked in canvas to exclude the checkerboard embedded in that PNG, while the surrounding eye moves gently. The hair charm and cheek still respond to drag, including touch and keyboard activation. Important links and content remain accessible without hover or motion; `prefers-reduced-motion` stops decorative animation. Technology SVGs from Devicon are MIT licensed; see `public/third-party/devicon-license.txt`. AI, QA, Jetpack Compose, Room, Vosk and Gemini use original simplified symbols in this design.

Locally hosted Noto Sans SC subsets are retained in `public/fonts/` for future Chinese text. The font license is in `public/third-party/noto-sans-sc-license.txt`.

## Hosting and privacy

This checkout is currently connected to an **owner-only private Site**, not to the user's public GitHub repository. Do not push it to the public repository or open access by accident.

For a future GitHub + Cloudflare Pages setup, connect a new **private** GitHub repository, set the build command to `npm run build` and output directory to `dist`. Cloudflare Pages supports SPA history routing when no top-level `404.html` is deployed. A private GitHub repository does **not** itself make the deployed site private: configure Cloudflare Access for the production `pages.dev` domain and verify it before moving traffic there. Front Matter CMS does not host the site; it is an editor for the Markdown files in VS Code.
