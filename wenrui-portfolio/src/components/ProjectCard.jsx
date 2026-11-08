import React from 'react';
import {Link} from 'react-router-dom';
import {technologyIcons} from '../data/content';
import {useLocale} from '../locale';

export function PendingImage({label='Image pending',className=''}) {
  const {t}=useLocale();
  return <div className={`v-media-placeholder ${className}`} role="img" aria-label={label}>
    <svg className="v-image-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="5" y="9" width="54" height="46" rx="4"/><circle cx="44" cy="24" r="5"/><path d="m6 48 16-17 12 11 7-6 17 16"/></svg>
    <small>{t.card.pending}</small>
  </div>;
}

export function ProjectMedia({project, large=false}) {
  const {t}=useLocale();
  const image=project.thumbnail;
  return <div className={`v-project-media v-media-${project.categories[0]}${large?' v-media-large':''}`}>
    {image ? <img src={image} alt={`${t.card.imageFor} ${project.title}`}/> : <PendingImage label={`${project.title}: ${t.card.imagePending}`}/>}
    {project.previewVideo && <video className="v-card-preview" src={project.previewVideo} playsInline muted loop preload="none" aria-hidden="true"/>}
  </div>;
}

export default function ProjectCard({project}) {
  const {t}=useLocale();
  return <Link className="v-project-card" to={`/work/${project.slug}`} onPointerEnter={event=>event.currentTarget.querySelector('video')?.play().catch(()=>{})} onPointerLeave={event=>{const video=event.currentTarget.querySelector('video');if(video){video.pause();video.currentTime=0}}}>
    <ProjectMedia project={project}/>
    <div className="v-card-content"><div className="v-card-badges"><div className="v-card-categories">{project.categories.map(category=><span className="v-category-pill" key={category}>{t.categories[category]}</span>)}</div><div className="v-tag-list">{project.primaryTags.slice(0,3).map(tech=><span className="v-tag" key={tech}>{technologyIcons[tech]&&<img src={`/icons/${technologyIcons[tech]}.svg`} alt=""/>}{t.tags?.[tech]||tech}</span>)}</div></div><div className="v-card-title"><h3>{project.title}</h3><span className="v-card-arrow" aria-hidden="true">↗</span></div><p>{project.summary}</p><div className="v-card-end"><span className="v-card-status">{project.status}</span><span className="v-view-project">{t.card.view}</span></div></div>
  </Link>;
}
