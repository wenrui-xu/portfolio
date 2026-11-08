import React,{useEffect,useRef,useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {Link,useParams} from 'react-router-dom';
import {ProjectMedia} from '../components/ProjectCard';
import {sectionsFor,technologyIcons} from '../data/content';
import {useLocale} from '../locale';

function Gallery({items}) {
  const {t}=useLocale();
  const [current,setCurrent]=useState(null);
  const dialog=useRef(null);
  useEffect(()=>{const element=dialog.current;if(current!==null&&!element.open)element.showModal();if(current===null&&element.open)element.close()},[current]);
  return <><div className="v-gallery">{items.map((item,index)=><button type="button" key={`${item.src}-${index}`} onClick={()=>setCurrent(index)} aria-label={`${t.case.open} ${item.alt||t.case.media}`}><Media item={item}/><span>{item.alt||t.case.media} ↗</span></button>)}</div><dialog className="v-gallery-lightbox" ref={dialog} onClose={()=>setCurrent(null)} onClick={event=>{if(event.target===dialog.current)setCurrent(null)}}><button className="v-lightbox-close" type="button" onClick={()=>setCurrent(null)} aria-label={t.case.closeGallery}>×</button>{current!==null&&<><Media item={items[current]} controls/><p>{items[current].alt}</p><div className="v-gallery-nav"><button type="button" onClick={()=>setCurrent((current+items.length-1)%items.length)}>{t.case.previous}</button><span>{current+1} / {items.length}</span><button type="button" onClick={()=>setCurrent((current+1)%items.length)}>{t.case.next}</button></div></>}</dialog></>;
}
function Media({item,controls=false}){return item.kind==='video'?<video src={item.src} controls={controls} muted playsInline preload="metadata" aria-label={item.alt}/>:<img src={item.src} alt={item.alt||''}/>}

export default function CaseStudy(){
  const {t,content}=useLocale();
  const {projects}=content;
  const {slug}=useParams();
  const project=projects.find(item=>item.slug===slug);
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'})},[slug]);
  if(!project)return <section className="v-case-missing v-wrap"><h1>{t.case.notFound}</h1><Link to="/work">{t.case.back}</Link></section>;
  const sections=sectionsFor(project,{tech:t.case.techHeading,gallery:t.case.galleryHeading,process:t.case.processHeading});
  const next=projects[(projects.findIndex(item=>item.slug===slug)+1)%projects.length];
  return <article className="v-case"><div className="v-wrap v-case-intro"><Link className="v-back-link" to="/work">{t.case.all}</Link><p className="v-kicker">{project.categories.map(category=>t.categories[category]).join(' · ')} / {project.status}</p><h1>{project.title}<span>.</span></h1><p className="v-case-summary">{project.summary}</p>{project.github&&<a className="v-source-link" href={project.github} target="_blank" rel="noreferrer">{t.case.source}</a>}<dl className="v-case-meta"><div><dt>{t.case.role}</dt><dd>{project.role}</dd></div><div><dt>{t.case.year}</dt><dd>{project.year||t.case.confirm}</dd></div><div><dt>{t.case.type}</dt><dd>{project.projectType}</dd></div><div><dt>{t.case.tech}</dt><dd>{project.primaryTags.map(tag=>t.tags?.[tag]||tag).join(' · ')}</dd></div></dl></div><div className="v-wrap"><ProjectMedia project={project} large/></div><div className="v-wrap v-case-content"><nav className="v-case-index" aria-label={t.case.sections}>{sections.map(section=><a key={section.id} href={`#${section.id}`}>{section.title.toUpperCase()}</a>)}</nav><div className="v-case-sections">{sections.map(section=><section id={section.id} key={section.id} className="v-case-section"><p className="v-kicker">{String(sections.indexOf(section)+1).padStart(2,'0')} / {project.title.toUpperCase()}</p><h2>{section.title}</h2>{section.markdown&&<div className="v-markdown"><ReactMarkdown>{section.markdown}</ReactMarkdown></div>}{['process','proceso'].includes(section.id)&&project.process?.length>0&&<ol className="v-process">{project.process.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,'0')}</span><strong>{step}</strong></li>)}</ol>}{section.technologies&&<div className="v-tag-list">{section.technologies.map(name=><span className="v-tag" key={name}>{technologyIcons[name]&&<img src={`/icons/${technologyIcons[name]}.svg`} alt=""/>}{t.tags?.[name]||name}</span>)}</div>}{section.gallery&&<Gallery items={section.gallery}/>}</section>)}</div></div><div className="v-wrap v-case-bottom"><Link className="v-back-link" to="/work">{t.case.back}</Link><Link className="v-next" to={`/work/${next.slug}`}><span>{t.case.nextProject}</span><strong>{next.title}</strong><span>{t.case.view}</span></Link></div></article>;
}
