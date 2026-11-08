import React,{useMemo,useState} from 'react';
import ProjectCard from '../components/ProjectCard';
import FeaturedCarousel from '../components/FeaturedCarousel';
import {categories,technologyIcons} from '../data/content';
import {useLocale} from '../locale';

export default function Work(){
  const {t,content}=useLocale();
  const {projects,featured}=content;
  const [category,setCategory]=useState('all');
  const [technology,setTechnology]=useState('');
  const [expanded,setExpanded]=useState(false);
  const categoryProjects=useMemo(()=>projects.filter(project=>category==='all'||project.categories.includes(category)),[projects,category]);
  const technologies=useMemo(()=>[...new Set(categoryProjects.flatMap(project=>project.primaryTags))],[categoryProjects]);
  const visible=categoryProjects.filter(project=>!technology||project.primaryTags.includes(technology));

  return <div className="v-work-page">
    <section className="v-work-top v-wrap">
      <p className="v-kicker">{t.nav.work} / 01</p>
      <h1>{t.nav.work}<span>.</span></h1>
      <p>{t.work.intro}</p>
    </section>
    <section className="v-featured-strip v-wrap" aria-labelledby="work-featured">
      <div className="v-section-head"><p className="v-kicker">{t.work.selected}</p><h2 id="work-featured">{t.home.featuredFirst} <em>{t.home.featuredSecond}</em></h2></div>
      <FeaturedCarousel projects={featured} id="featured-work-track"/>
    </section>
    <section className="v-all-work v-wrap" aria-labelledby="all-work-heading">
      <div className="v-section-head"><p className="v-kicker">{t.work.browse}</p><h2 id="all-work-heading">{t.work.allFirst} <em>{t.work.allSecond}</em></h2></div>
      <div className="v-filter-row" role="group" aria-label={t.work.categories}>
        {categories.map(id=><button key={id} type="button" aria-pressed={category===id} onClick={()=>{setCategory(id);setTechnology('')}}>{t.categories[id]}</button>)}
        <button className="v-more-filters" type="button" aria-expanded={expanded} aria-controls="technology-filters" onClick={()=>setExpanded(!expanded)}>{expanded?'−':'+'} {t.work.filters}</button>
      </div>
      {expanded&&<div className="v-tech-filters" id="technology-filters" role="group" aria-label={t.work.technologies}>
        <button type="button" aria-pressed={!technology} onClick={()=>setTechnology('')}>{t.work.anyTechnology}</button>
        {technologies.map(name=><button type="button" key={name} aria-pressed={technology===name} onClick={()=>setTechnology(technology===name?'':name)}>{technologyIcons[name]&&<img src={`/icons/${technologyIcons[name]}.svg`} alt=""/>}{t.tags?.[name]||name}</button>)}
      </div>}
      {projects.length>0&&<p className="v-result-count" aria-live="polite">{visible.length} {visible.length===1?t.work.oneProject:t.work.manyProjects}</p>}
      {visible.length?<div className="v-project-grid v-grid-animated" key={`${category}-${technology}`}>{visible.map(project=><ProjectCard key={project.slug} project={project}/>)}</div>:<div className="v-empty-state"><span aria-hidden="true">✳</span><p>{projects.length?t.work.none:t.work.pending}</p>{projects.length>0&&<button type="button" onClick={()=>{setCategory('all');setTechnology('')}}>{t.work.showAll}</button>}</div>}
    </section>
  </div>;
}
