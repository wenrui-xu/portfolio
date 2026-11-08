import source from '../generated/content.json';
import sourceEs from '../generated/content-es.json';
import site from '../../content/site.json';
import icons from '../../content/technology-icons.json';

export const projects = source.projects;
export const experience = source.experience;
export const education = source.education;
export const certificates = source.certificates;
export const siteContent = site;
export const categories = ['all','games','apps','web','automation','creative-tech'];
export const categoryLabels = {all:'All',games:'Games',apps:'Mobile Apps',web:'Web Development',automation:'Automation & Tools','creative-tech':'Creative Tech'};
export const technologyIcons = icons;
export const social = site.links;
export const resume = site.resume;
// One selection function feeds Featured Work on both Home and Work. The console
// editor changes featured/featuredOrder in Markdown; cards need no manual edits.
export function selectFeaturedProjects(items) {
  return items.filter(project=>project.featured).sort((a,b)=>
    (a.featuredOrder??a.order??99)-(b.featuredOrder??b.order??99) ||
    (a.order??99)-(b.order??99) || a.slug.localeCompare(b.slug)
  );
}
export const featured = selectFeaturedProjects(projects);
export const localizedContent = lang => {
  const content=lang==='es'?sourceEs:source;
  return {...content,featured:selectFeaturedProjects(content.projects),siteContent:site};
};
export const toId = label => label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
export function sectionsFor(project,labels={tech:'Tech',gallery:'Gallery',process:'Process'}) {
  const pieces = project.body.split(/^## (.+)\s*$/gm);
  const sections=[];
  for(let i=1;i<pieces.length;i+=2) {
    const title=pieces[i].trim();
    const markdown=(pieces[i+1]||'').trim();
    if(markdown) sections.push({title,id:toId(title),markdown});
  }
  if(project.process?.length && !sections.some(section=>section.id==='process'||section.id==='proceso')) {
    const outcome=sections.findIndex(section=>/^(outcome|results|testing-results|resultado|resultados|resultados-de-las-pruebas)$/.test(section.id));
    sections.splice(outcome<0?sections.length:outcome,0,{title:labels.process,id:'process',process:project.process});
  }
  const tech=project.technologies?.length;
  if(tech && !sections.some(section=>section.id==='tech'||section.id===toId(labels.tech))) sections.push({title:labels.tech,id:'tech',technologies:project.technologies});
  if(project.gallery?.length) sections.push({title:labels.gallery,id:'gallery',gallery:project.gallery});
  return sections;
}
