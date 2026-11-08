import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = path.resolve(import.meta.dirname, '..');
const kinds = ['projects', 'experience', 'education', 'certificates'];
const categories = new Set(['games', 'apps', 'web', 'automation', 'creative-tech']);

function checkSiteSettings() {
  const site = JSON.parse(fs.readFileSync(path.join(root, 'content', 'site.json'), 'utf8'));
  for (const name of ['github', 'linkedin']) {
    try { if (new URL(site.links?.[name]).protocol !== 'https:') throw new Error(); }
    catch { throw new Error(`Invalid ${name} link in content/site.json`); }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.links?.email || '')) throw new Error('Invalid email in content/site.json');
  if (!/^\/resume\/[a-z0-9._-]+\.pdf$/i.test(site.resume?.path || '') ||
      !fs.existsSync(path.join(root, 'public', site.resume.path.slice(1))) ||
      !/^[^/\\]+\.pdf$/i.test(site.resume?.downloadName || '')) {
    throw new Error('Resume PDF or download name is invalid in content/site.json');
  }
  const icons = JSON.parse(fs.readFileSync(path.join(root, 'content', 'technology-icons.json'), 'utf8'));
  for (const [name, filename] of Object.entries(icons)) {
    if (!/^[a-z0-9._-]+$/i.test(filename) ||
        !fs.existsSync(path.join(root, 'public', 'icons', `${filename}.svg`))) {
      throw new Error(`Missing or invalid icon for ${name} in content/technology-icons.json`);
    }
  }
}

export function buildContent() {
  checkSiteSettings();
  const content = {};
  for (const kind of kinds) {
    const directory = path.join(root, 'content', kind);
    content[kind] = fs.readdirSync(directory).filter(file => file.endsWith('.md')).map(file => {
      const {data, content: body} = matter(fs.readFileSync(path.join(directory, file), 'utf8'));
      if (data.published !== true) return null;
      if (!data.title || !data.slug || !/^[a-z0-9-]+$/.test(data.slug)) throw new Error(`Invalid title or slug: ${file}`);
      if (kind === 'projects') {
        if (!Array.isArray(data.categories) || !data.categories.length || data.categories.some(category => !categories.has(category)) || new Set(data.categories).size !== data.categories.length) throw new Error(`Invalid categories: ${file}`);
        if (!['completed','cancelled'].includes(data.lifecycle)) throw new Error(`Only completed or cancelled projects can be published: ${file}`);
        if (!Array.isArray(data.technologies) || !data.technologies.length) throw new Error(`Missing technologies: ${file}`);
        if (!Array.isArray(data.primaryTags) || !data.primaryTags.length || data.primaryTags.some(tag => !data.technologies.includes(tag))) throw new Error(`Primary tags must be selected from technologies: ${file}`);
        if (data.featured && data.featuredOrder !== undefined && (!Number.isInteger(data.featuredOrder) || data.featuredOrder < 1)) throw new Error(`Invalid featuredOrder: ${file}`);
      }
      return {...data, body, source: `${kind}/${file}`};
    }).filter(Boolean);
    const slugs = content[kind].map(item => item.slug);
    if (new Set(slugs).size !== slugs.length) throw new Error(`Duplicate ${kind} slug`);
  }
  content.projects.sort((a,b) => (a.order ?? 99) - (b.order ?? 99));
  const output = path.join(root, 'src', 'generated', 'content.json');
  fs.mkdirSync(path.dirname(output), {recursive:true});
  fs.writeFileSync(output, JSON.stringify(content, null, 2) + '\n');
  const localized = {};
  for (const kind of kinds) {
    localized[kind] = content[kind].map(item => {
      const file = path.join(root, 'content', 'es', kind, `${item.slug}.md`);
      if (!fs.existsSync(file)) throw new Error(`Missing Spanish translation: ${kind}/${item.slug}`);
      const {data, content: body} = matter(fs.readFileSync(file, 'utf8'));
      if (data.slug && data.slug !== item.slug) throw new Error(`Translation slug mismatch: ${file}`);
      return {...item, ...data, slug:item.slug, body, source:item.source};
    });
  }
  fs.writeFileSync(path.join(root, 'src', 'generated', 'content-es.json'), JSON.stringify(localized, null, 2) + '\n');
  return content;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const content = buildContent();
  process.stdout.write(`Prepared ${content.projects.length} published projects.\n`);
}
