import React,{useEffect,useRef,useState} from 'react';
import ProjectCard from './ProjectCard';
import {useLocale} from '../locale';

export default function FeaturedCarousel({projects,id}) {
  const {t}=useLocale();
  const trackRef=useRef(null);
  const [position,setPosition]=useState({overflow:false,previous:false,next:false});

  useEffect(()=>{
    const track=trackRef.current;
    if(!track)return;
    const update=()=>setPosition({
      overflow:track.scrollWidth>track.clientWidth+2,
      previous:track.scrollLeft>2,
      next:track.scrollLeft+track.clientWidth<track.scrollWidth-2
    });
    const observer=new ResizeObserver(update);
    observer.observe(track);
    for(const card of track.children)observer.observe(card);
    track.addEventListener('scroll',update,{passive:true});
    update();
    return()=>{observer.disconnect();track.removeEventListener('scroll',update)};
  },[projects]);

  const move=direction=>{
    const track=trackRef.current;
    const card=track?.querySelector('.v-project-card');
    if(!card)return;
    const gap=parseFloat(getComputedStyle(track).gap)||0;
    track.scrollBy({left:direction*(card.getBoundingClientRect().width+gap),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };

  if (!projects.length) return <div className="v-featured-carousel"><div className="v-empty-state" role="status"><p>{t.work.pending}</p></div></div>;

  return <div className="v-featured-carousel">
    {position.overflow&&<div className="v-featured-controls">
      <button type="button" onClick={()=>move(-1)} disabled={!position.previous} aria-label={t.work.featuredPrevious} aria-controls={id}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"/></svg>
      </button>
      <button type="button" onClick={()=>move(1)} disabled={!position.next} aria-label={t.work.featuredNext} aria-controls={id}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>
      </button>
    </div>}
    <div id={id} className="v-featured-track" data-count={projects.length} ref={trackRef} role="region" aria-label={t.work.selected} tabIndex={position.overflow?0:undefined} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1)}}}>
      {projects.map(project=><ProjectCard project={project} key={project.slug}/>)}
    </div>
  </div>;
}
